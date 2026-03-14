import fs from 'node:fs/promises'
import path from 'node:path'

import pangu from 'pangu'
import { remark } from 'remark'
import remarkFrontmatter from 'remark-frontmatter'
import { visit } from 'unist-util-visit'

/**
 * Markdown 文章规范化器。
 *
 * 设计原则：
 * 1. 只做高置信度修复，避免“自动格式化误伤内容”。
 * 2. frontmatter、围栏代码块、行内代码内容、链接 URL 一律不改。
 * 3. 规则按“源码行 / 正文文本 / 行内边界”三层拆分，方便团队增删和审阅。
 */

const INLINE_PARENT_TYPES = new Set([
  'paragraph',
  'heading',
  'emphasis',
  'strong',
  'delete',
  'link',
  'linkReference',
  'tableCell',
])

const ASCII_PUNCTUATION_RE = /[:;,!?]/u
const ASCII_ALNUM_RE = /[A-Za-z0-9]/u
const TEXT_LIKE_RE = /[\p{Script=Han}\p{L}\p{N}`"'“”‘’()[\]{}]/u
const WORDISH_RE = /[\p{Script=Han}\p{L}\p{N}]/u
const INLINE_CODE_CONTENT_RE = /[\p{L}\p{N}_$]/u
const THEMATIC_BREAK_RE = /^ {0,3}(?:[-*_]\s*){3,}$/u
const createRule = (phase, name, description, apply) => ({
  phase,
  name,
  description,
  apply,
})

const parseMarkdown = (source) => remark().use(remarkFrontmatter, ['yaml', 'toml']).parse(source)

const uniqueReplacements = (replacements) =>
  replacements.filter(
    (replacement, index, allReplacements) =>
      allReplacements.findIndex(
        (current) =>
          current.start === replacement.start &&
          current.end === replacement.end &&
          current.value === replacement.value,
      ) === index,
  )

const applyReplacements = (source, replacements) => {
  if (!replacements.length) return source

  let next = source

  for (const { start, end, value } of [...replacements].sort((a, b) => b.start - a.start)) {
    next = `${next.slice(0, start)}${value}${next.slice(end)}`
  }

  return next
}

const splitSourceLines = (source) => {
  const hasTrailingNewline = source.endsWith('\n')
  const content = hasTrailingNewline ? source.slice(0, -1) : source

  return {
    hasTrailingNewline,
    lines: content ? content.split('\n') : [''],
  }
}

const joinSourceLines = (lines, hasTrailingNewline) =>
  `${lines.join('\n')}${hasTrailingNewline ? '\n' : ''}`

const escapeForRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const getProtectedLines = (lines) => {
  const protectedLines = lines.map(() => false)
  let frontmatterDelimiter = ''
  let fenceState = null

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]

    if (index === 0 && /^(---|\+\+\+)\s*$/u.test(line)) {
      frontmatterDelimiter = line.trim()
      protectedLines[index] = true
      continue
    }

    if (frontmatterDelimiter) {
      protectedLines[index] = true

      if (line.trim() === frontmatterDelimiter) {
        frontmatterDelimiter = ''
      }

      continue
    }

    if (!fenceState) {
      const openingFence = line.match(/^( {0,3})(`{3,}|~{3,})(.*)$/u)

      if (openingFence) {
        fenceState = {
          marker: openingFence[2][0],
          size: openingFence[2].length,
        }
        protectedLines[index] = true
        continue
      }
    }

    if (fenceState) {
      protectedLines[index] = true

      const closingFence = new RegExp(
        `^ {0,3}${escapeForRegExp(fenceState.marker)}{${fenceState.size},}\\s*$`,
        'u',
      )

      if (closingFence.test(line)) {
        fenceState = null
      }
    }
  }

  return protectedLines
}

const applyLineRule = (source, transform) => {
  const { hasTrailingNewline, lines } = splitSourceLines(source)
  const protectedLines = getProtectedLines(lines)
  const nextLines = transform(lines, protectedLines)

  return joinSourceLines(nextLines, hasTrailingNewline)
}

const mapUnprotectedLines = (source, transform) =>
  applyLineRule(source, (lines, protectedLines) =>
    lines.map((line, index) => (protectedLines[index] ? line : transform(line, index))),
  )

const withQuotePrefix = (line, transformBody) => {
  const match = line.match(/^((?: {0,3}> ?)*)(.*)$/u)

  if (!match) return line

  const [, prefix, body] = match
  return `${prefix}${transformBody(body)}`
}

const shouldNormalizeAsciiPunctuation = (left, punct, right) => {
  if (punct === ':') {
    return !(/\p{N}/u.test(left) && /\p{N}/u.test(right))
  }

  return ASCII_ALNUM_RE.test(left) || ASCII_ALNUM_RE.test(right)
}

/**
 * 规则：统一标题语法中的 `#` 后空格。
 * 场景：`##标题`、`###   标题`。
 * 原则：只修复标题标记与标题文本之间的空格，不改标题内容本身。
 */
const headingMarkerSpacingRule = createRule(
  'source',
  'heading-marker-spacing',
  '统一标题 `#` 与标题正文之间的空格。',
  (source) =>
    mapUnprotectedLines(source, (line) =>
      withQuotePrefix(line, (body) =>
        body.replace(/^( {0,3})(#{1,6})\s*(.+?)\s*$/u, (match, indent, hashes, content) => {
          if (!content || content.startsWith('#')) return match
          return `${indent}${hashes} ${content.trim()}`
        }),
      ),
    ),
)

/**
 * 规则：统一无序列表标记后的空格。
 * 场景：`-列表项`、`+列表项`、`- [x]已完成`。
 * 原则：跳过主题分隔线 `--- / *** / ___`，同时不自动修复 `*` 前缀，
 * 因为 `*` 与粗体/斜体语法冲突，误判成本高于漏改成本。
 */
const unorderedListSpacingRule = createRule(
  'source',
  'unordered-list-spacing',
  '统一无序列表标记和任务列表标记后的空格。',
  (source) =>
    mapUnprotectedLines(source, (line) =>
      withQuotePrefix(line, (body) => {
        if (THEMATIC_BREAK_RE.test(body)) return body

        return body.replace(
          /^( {0,3})([-+])\s*(\[[ xX]\])?\s*(\S.*)$/u,
          (_, indent, marker, taskMarker, content) =>
            `${indent}${marker} ${taskMarker ? `${taskMarker} ` : ''}${content.trimStart()}`,
        )
      }),
    ),
)

/**
 * 规则：统一有序列表标记后的空格。
 * 场景：`1.列表项`、`2.   说明`、`3.[x]任务`。
 * 原则：对 `1.23` 这类数字开头的版本号保守处理，不在“点号后直接跟数字”时自动改写。
 */
const orderedListSpacingRule = createRule(
  'source',
  'ordered-list-spacing',
  '统一有序列表标记和任务列表标记后的空格。',
  (source) =>
    mapUnprotectedLines(source, (line) =>
      withQuotePrefix(line, (body) =>
        body
          .replace(
            /^( {0,3})(\d+\.) {2,}(\S.*)$/u,
            (_, indent, marker, content) => `${indent}${marker} ${content.trimStart()}`,
          )
          .replace(
            /^( {0,3})(\d+\.)(?=[^\s\d])(\[[ xX]\])?\s*(\S.*)$/u,
            (_, indent, marker, taskMarker, content) =>
              `${indent}${marker} ${taskMarker ? `${taskMarker} ` : ''}${content.trimStart()}`,
          ),
      ),
    ),
)

/**
 * 规则：统一引用块 `>` 后空格。
 * 场景：`>引用`、`>>   嵌套引用`。
 * 原则：只修复引用标记后的空格，不重排多级引用深度。
 */
const blockquoteSpacingRule = createRule(
  'source',
  'blockquote-spacing',
  '统一引用块 `>` 与引用正文之间的空格。',
  (source) =>
    mapUnprotectedLines(source, (line) =>
      line.replace(/^( {0,3})(>+)\s*(\S.*)$/u, (_, indent, markers, content) => {
        return `${indent}${markers} ${content.trimStart()}`
      }),
    ),
)

/**
 * 规则：压缩多余空行。
 * 场景：正文里连续出现 3 行及以上空白行。
 * 原则：最多保留 2 个连续空行，既不压扁段落，也不放任内容“漂”开。
 */
const blankLineCompressionRule = createRule(
  'source',
  'blank-line-compression',
  '将正文中的连续空白行压缩为最多 2 行。',
  (source) =>
    applyLineRule(source, (lines, protectedLines) => {
      const nextLines = []
      let blankRun = 0

      for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index]
        const isBlank = line.trim() === ''

        if (protectedLines[index]) {
          blankRun = 0
          nextLines.push(line)
          continue
        }

        if (!isBlank) {
          blankRun = 0
          nextLines.push(line)
          continue
        }

        blankRun += 1

        if (blankRun <= 2) {
          nextLines.push(line)
        }
      }

      return nextLines
    }),
)

const SOURCE_RULES = [
  headingMarkerSpacingRule,
  unorderedListSpacingRule,
  orderedListSpacingRule,
  blockquoteSpacingRule,
  blankLineCompressionRule,
]

/**
 * 规则：合并正文中的重复半角空格。
 * 场景：`中文  Vue3`、`DOM   更新`。
 * 原则：只压缩正文文本节点内部的连续空格，不碰 Markdown 结构缩进。
 */
const duplicateInlineSpaceRule = createRule(
  'text',
  'duplicate-inline-space',
  '压缩正文文本节点内部多余的连续半角空格。',
  (value) => value.replace(/(\S) {2,}(?=\S)/gu, '$1 '),
)

/**
 * 规则：移除中文之间误输入的空格。
 * 场景：`中 文 排 版`。
 * 原则：仅处理连续中文字符之间的空格，不影响中英文混排。
 */
const cjkWordSpacingRule = createRule(
  'text',
  'cjk-word-spacing',
  '移除连续中文字符之间误输入的空格。',
  (value) => {
    let next = value

    while (true) {
      const normalized = next.replace(/([\p{Script=Han}])[ \t]+([\p{Script=Han}])/gu, '$1$2')

      if (normalized === next) {
        return normalized
      }

      next = normalized
    }
  },
)

/**
 * 规则：清理全角标点和全角括号周围的误空格。
 * 场景：`中文 ， 排版`、`（ Vue3 ）`。
 * 原则：中文标点按中文排版习惯贴合文本，不保留多余空格。
 */
const fullwidthPunctuationSpacingRule = createRule(
  'text',
  'fullwidth-punctuation-spacing',
  '移除全角标点、引号、括号附近的多余空格。',
  (value) =>
    value
      .replace(/[ \t]+([（【《「『“‘])/gu, '$1')
      .replace(/[ \t]+([，。！？：；、）】》」』”’])/gu, '$1')
      .replace(/([，。！？：；、（【《「『“‘])[ \t]+/gu, '$1'),
)

/**
 * 规则：统一中英文、数字、常见半角符号之间的阅读空格。
 * 场景：`Vue3开发`、`DOM元素`、`innerHTML更新`。
 * 原则：借助 pangu 处理高频中英文混排问题，但仅作用于正文文本节点。
 */
const cjkLatinSpacingRule = createRule(
  'text',
  'cjk-latin-spacing',
  '统一中英文、数字、半角符号之间的阅读空格。',
  (value) => pangu.spacingText(value),
)

/**
 * 规则：统一半角标点后的空格。
 * 场景：`API:说明`、`hello,world`。
 * 原则：`16:9`、`502/504` 这类数字语义不强行改写；中文句内的 `? ! , ;` 保持中文习惯。
 */
const asciiPunctuationSpacingRule = createRule(
  'text',
  'ascii-punctuation-spacing',
  '统一半角冒号、逗号、分号、问号、叹号后的空格。',
  (value) =>
    value.replace(
      /([\p{Script=Han}\p{L}\p{N}\)\]'"`”’])\s*([:;,!?])\s*([\p{Script=Han}\p{L}\p{N}(`"'“‘])/gu,
      (match, left, punct, right) => {
        if (!shouldNormalizeAsciiPunctuation(left, punct, right)) {
          return match
        }

        return `${left}${punct} ${right}`
      },
    ),
)

/**
 * 规则：把中文句内被英文规则“撑开”的标点重新收紧。
 * 场景：`这是什么? 这里是中文`。
 * 原则：中文语境里保留紧凑排版，避免把整篇文章改成英文式断句。
 */
const cjkSentencePunctuationCleanupRule = createRule(
  'text',
  'cjk-sentence-punctuation-cleanup',
  '收紧中文句内 `, ; ! ?` 后被误加入的空格。',
  (value) => value.replace(/([\p{Script=Han}])([,;!?])\s+([\p{Script=Han}])/gu, '$1$2$3'),
)

const TEXT_RULES = [
  duplicateInlineSpaceRule,
  cjkWordSpacingRule,
  cjkLatinSpacingRule,
  asciiPunctuationSpacingRule,
  cjkSentencePunctuationCleanupRule,
  fullwidthPunctuationSpacingRule,
]

const normalizeInlineLine = (value) =>
  TEXT_RULES.reduce((currentValue, rule) => rule.apply(currentValue), value)

const normalizeInlineText = (value) =>
  value
    .split(/(\n+)/)
    .map((segment) =>
      segment.includes('\n') || !segment.trim() ? segment : normalizeInlineLine(segment),
    )
    .join('')

const getTextReplacements = (source) => {
  const replacements = []
  const tree = parseMarkdown(source)

  visit(tree, 'text', (node) => {
    const start = node.position?.start.offset
    const end = node.position?.end.offset

    if (typeof start !== 'number' || typeof end !== 'number' || start >= end) return

    const original = source.slice(start, end)

    if (original !== node.value) return

    const normalized = normalizeInlineText(original)

    if (normalized !== original) {
      replacements.push({ start, end, value: normalized })
    }
  })

  return replacements
}

const getVisibleText = (node) => {
  if (!node) return ''

  if (node.type === 'text' || node.type === 'inlineCode') {
    return node.value.trim()
  }

  if (node.type === 'image') {
    return (node.alt ?? '').trim()
  }

  if (!Array.isArray(node.children)) return ''

  return node.children
    .map((child) => getVisibleText(child))
    .join('')
    .trim()
}

const getVisibleBoundary = (node) => {
  const text = getVisibleText(node)

  if (!text) return null

  const chars = Array.from(text)

  return {
    text,
    first: chars[0],
    last: chars.at(-1),
  }
}

const isInlineCode = (node) => node?.type === 'inlineCode'
const isTextLike = (value) => Boolean(value && TEXT_LIKE_RE.test(value))

const getEditableBoundaryRange = (
  source,
  leftNode,
  rightNode,
  leftStart,
  leftEnd,
  rightStart,
  rightEnd,
) => {
  let start = leftEnd
  let end = rightStart

  if (leftNode.type === 'text') {
    const trailingWhitespace = source.slice(leftStart, leftEnd).match(/[ \t]+$/u)?.[0].length ?? 0
    start = leftEnd - trailingWhitespace
  }

  if (rightNode.type === 'text') {
    const leadingWhitespace = source.slice(rightStart, rightEnd).match(/^[ \t]+/u)?.[0].length ?? 0
    end = rightStart + leadingWhitespace
  }

  const content = source.slice(start, end)

  if (!/^[ \t]*$/u.test(content)) {
    return null
  }

  return { start, end, content }
}

/**
 * 规则：行内节点边界在半角标点后补充必要空格。
 * 场景：`说明:**重点**`、`API:[文档](...)`。
 * 原则：只有在半角标点需要承担“英文式分隔”时才补空格。
 */
const inlinePunctuationBoundaryRule = createRule(
  'boundary',
  'inline-punctuation-boundary',
  '在需要英文式分隔的半角标点和后续行内节点之间补空格。',
  ({ left, right }) =>
    Boolean(
      left?.last &&
      right?.first &&
      ASCII_PUNCTUATION_RE.test(left.last) &&
      isTextLike(right.first) &&
      shouldNormalizeAsciiPunctuation(left.text.at(-2) ?? left.last, left.last, right.first),
    ),
)

/**
 * 规则：行内节点边界统一中英文混排空格。
 * 场景：`使用**innerHTML**更新DOM`、`链接[Vue3文档]很好`。
 * 原则：基于相邻可见字符判断是否需要阅读空格，不改节点内容本身。
 */
const inlineCjkLatinBoundaryRule = createRule(
  'boundary',
  'inline-cjk-latin-boundary',
  '在相邻行内节点边界统一中英文混排空格。',
  ({ left, right }) =>
    Boolean(
      left?.last &&
      right?.first &&
      pangu.spacingText(`${left.last}${right.first}`) !== `${left.last}${right.first}`,
    ),
)

/**
 * 规则：行内代码与正文之间补充阅读空格。
 * 场景：`在\`useEffect\`里处理`。
 * 原则：只在代码节点确实像“词”而不是纯符号时补空格，避免把 `` `(` `` 这类片段撑开。
 */
const inlineCodeBoundaryRule = createRule(
  'boundary',
  'inline-code-boundary',
  '在行内代码和正文文本之间补充阅读空格。',
  ({ left, right, leftNode, rightNode }) => {
    if (
      isInlineCode(leftNode) &&
      WORDISH_RE.test(right?.first ?? '') &&
      INLINE_CODE_CONTENT_RE.test(left?.text ?? '')
    ) {
      return true
    }

    if (
      isInlineCode(rightNode) &&
      WORDISH_RE.test(left?.last ?? '') &&
      INLINE_CODE_CONTENT_RE.test(right?.text ?? '')
    ) {
      return true
    }

    return false
  },
)

const BOUNDARY_SPACE_RULES = [
  inlinePunctuationBoundaryRule,
  inlineCjkLatinBoundaryRule,
  inlineCodeBoundaryRule,
]

const getBoundaryEdits = (source) => {
  const edits = []
  const tree = parseMarkdown(source)

  visit(tree, (node) => {
    if (
      !INLINE_PARENT_TYPES.has(node.type) ||
      !Array.isArray(node.children) ||
      node.children.length < 2
    ) {
      return
    }

    for (let index = 0; index < node.children.length - 1; index += 1) {
      const leftNode = node.children[index]
      const rightNode = node.children[index + 1]
      const leftStart = leftNode.position?.start.offset
      const leftEnd = leftNode.position?.end.offset
      const rightStart = rightNode.position?.start.offset
      const rightEnd = rightNode.position?.end.offset

      if (
        typeof leftStart !== 'number' ||
        typeof leftEnd !== 'number' ||
        typeof rightStart !== 'number' ||
        typeof rightEnd !== 'number'
      ) {
        continue
      }

      const left = getVisibleBoundary(leftNode)
      const right = getVisibleBoundary(rightNode)
      if (!left?.last || !right?.first) continue

      const editableRange = getEditableBoundaryRange(
        source,
        leftNode,
        rightNode,
        leftStart,
        leftEnd,
        rightStart,
        rightEnd,
      )

      if (!editableRange) continue

      const shouldInsertSpace = BOUNDARY_SPACE_RULES.some((rule) =>
        rule.apply({ left, right, leftNode, rightNode }),
      )

      if (shouldInsertSpace && editableRange.content !== ' ') {
        edits.push({ start: editableRange.start, end: editableRange.end, value: ' ' })
      }
    }
  })

  return uniqueReplacements(edits)
}

const normalizeMarkdownArticle = (source) => {
  const normalizedSource = SOURCE_RULES.reduce(
    (currentSource, rule) => rule.apply(currentSource),
    source,
  )
  const withNormalizedText = applyReplacements(
    normalizedSource,
    getTextReplacements(normalizedSource),
  )

  return applyReplacements(withNormalizedText, getBoundaryEdits(withNormalizedText))
}

const walkMarkdownFiles = async (entryPath, files) => {
  const stat = await fs.stat(entryPath)

  if (stat.isDirectory()) {
    const entries = await fs.readdir(entryPath, { withFileTypes: true })

    for (const entry of entries) {
      await walkMarkdownFiles(path.join(entryPath, entry.name), files)
    }

    return files
  }

  if (stat.isFile() && entryPath.endsWith('.md')) {
    files.push(entryPath)
  }

  return files
}

export const collectMarkdownFiles = async (targets = ['posts']) => {
  const files = []

  for (const target of targets) {
    await walkMarkdownFiles(path.resolve(target), files)
  }

  return files.sort()
}

export const formatMarkdownFile = async (filePath) => {
  const source = await fs.readFile(filePath, 'utf8')
  const normalized = normalizeMarkdownArticle(source)
  const changed = normalized !== source

  if (!changed) {
    return false
  }

  await fs.writeFile(filePath, normalized)
  return true
}
