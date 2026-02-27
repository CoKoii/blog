import type { Dict } from '@/types/common'
import type {
  SiteCommentsGiscus,
  SiteConfig,
  SiteMeta,
  SiteOwner,
  SiteSocialLink,
  SiteTags,
} from './types'

const GISCUS_MAPPING = ['pathname', 'url', 'title', 'og:title', 'specific', 'number'] as const
const GISCUS_INPUT_POSITION = ['top', 'bottom'] as const
const GISCUS_LOADING = ['lazy', 'eager'] as const

const isObject = (value: unknown): value is Dict =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const expectObject = (value: unknown, path: string, errors: string[]): Dict => {
  if (!isObject(value)) {
    errors.push(`字段「${path}」必须是对象`)
    return {}
  }
  return value
}

const expectString = (
  source: Dict,
  key: string,
  path: string,
  errors: string[],
  { allowEmpty = false }: { allowEmpty?: boolean } = {},
): string => {
  const value = source[key]
  if (typeof value !== 'string') {
    errors.push(`字段「${path}」必须是字符串`)
    return ''
  }
  const trimmed = value.trim()
  if (!allowEmpty && !trimmed) {
    errors.push(`字段「${path}」不能为空`)
  }
  return trimmed
}

const expectOptionalString = (
  source: Dict,
  key: string,
  path: string,
  errors: string[],
  fallback: string,
): string => {
  const value = source[key]
  if (value === undefined) return fallback
  if (typeof value === 'string') return value.trim()
  errors.push(`字段「${path}」必须是字符串`)
  return fallback
}

const expectBoolean = (source: Dict, key: string, path: string, errors: string[]): boolean => {
  const value = source[key]
  if (typeof value !== 'boolean') {
    errors.push(`字段「${path}」必须是布尔值`)
    return false
  }
  return value
}

const expectOptionalBoolean = (
  source: Dict,
  key: string,
  path: string,
  errors: string[],
  fallback: boolean,
): boolean => {
  const value = source[key]
  if (value === undefined) return fallback
  if (typeof value === 'boolean') return value
  errors.push(`字段「${path}」必须是布尔值`)
  return fallback
}

const expectStringArray = (source: Dict, key: string, path: string, errors: string[]): string[] => {
  const value = source[key]
  if (!Array.isArray(value)) {
    errors.push(`字段「${path}」必须是字符串数组`)
    return []
  }

  const list = value.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean)

  if (list.length !== value.length) {
    errors.push(`字段「${path}」中存在非字符串或空字符串项`)
  }
  return list
}

const expectDateLike = (value: string, path: string, errors: string[]) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    errors.push(`字段「${path}」必须是 YYYY-MM-DD 格式`)
    return
  }
  if (Number.isNaN(Date.parse(`${value}T00:00:00`))) errors.push(`字段「${path}」不是有效日期`)
}

const expectUrl = (value: string, path: string, errors: string[]) => {
  try {
    const url = new URL(value)
    if (!url.protocol.startsWith('http')) {
      errors.push(`字段「${path}」必须使用 http 或 https 协议`)
    }
  } catch {
    errors.push(`字段「${path}」必须是合法 URL`)
  }
}

const expectRepo = (value: string, path: string, errors: string[]) => {
  if (!/^[^/\s]+\/[^/\s]+$/.test(value)) {
    errors.push(`字段「${path}」必须是 owner/repo 格式`)
  }
}

const expectEnum = <T extends readonly [string, ...string[]]>(
  value: string,
  path: string,
  errors: string[],
  choices: T,
): T[number] => {
  if (!choices.includes(value)) {
    errors.push(`字段「${path}」取值无效，可选值：${choices.join('、')}`)
    return choices[0]
  }
  return value as T[number]
}

const expectOptionalEnum = <T extends readonly [string, ...string[]]>(
  source: Dict,
  key: string,
  path: string,
  errors: string[],
  choices: T,
  fallback: T[number],
): T[number] => {
  const raw = source[key]
  if (raw === undefined) return fallback
  if (typeof raw !== 'string') {
    errors.push(`字段「${path}」必须是字符串`)
    return fallback
  }
  return expectEnum(raw, path, errors, choices)
}

const resolveSiteMeta = (root: Dict, errors: string[]): SiteMeta => {
  const site = expectObject(root['站点'], '站点', errors)
  const url = expectString(site, '地址', '站点.地址', errors)
  const name = expectString(site, '名称', '站点.名称', errors)
  const description = expectString(site, '描述', '站点.描述', errors)
  const image = expectString(site, '分享图', '站点.分享图', errors, { allowEmpty: true })
  const language = expectString(site, '语言', '站点.语言', errors)
  const brandName = expectString(site, '品牌名', '站点.品牌名', errors)

  if (url) expectUrl(url, '站点.地址', errors)
  if (image) expectUrl(image, '站点.分享图', errors)

  return { url, name, description, image, language, brandName }
}

const resolveOwner = (root: Dict, errors: string[]): SiteOwner => {
  const owner = expectObject(root['作者'], '作者', errors)
  const avatar = expectString(owner, '头像', '作者.头像', errors)
  const tags = expectStringArray(owner, '标签', '作者.标签', errors)

  if (avatar) expectUrl(avatar, '作者.头像', errors)

  return {
    name: expectString(owner, '姓名', '作者.姓名', errors),
    headline: expectString(owner, '头衔', '作者.头衔', errors),
    greeting: expectString(owner, '问候语', '作者.问候语', errors),
    greetingEmoji: expectString(owner, '问候表情', '作者.问候表情', errors),
    bio: expectString(owner, '简介', '作者.简介', errors),
    bioEmphasis: expectString(owner, '简介强调', '作者.简介强调', errors, { allowEmpty: true }),
    quote: expectString(owner, '签名', '作者.签名', errors),
    avatar,
    tags,
  }
}

const resolveSocials = (root: Dict, errors: string[]): SiteSocialLink[] => {
  const socials = root['社交链接']
  if (!Array.isArray(socials)) {
    errors.push('字段「社交链接」必须是数组')
    return []
  }

  return socials.map((item, index) => {
    const row = expectObject(item, `社交链接[${index}]`, errors)
    const label = expectString(row, '名称', `社交链接[${index}].名称`, errors)
    const icon = expectString(row, '图标', `社交链接[${index}].图标`, errors)
    const url = expectString(row, '链接', `社交链接[${index}].链接`, errors)

    if (url) expectUrl(url, `社交链接[${index}].链接`, errors)

    return { label, icon, url }
  })
}

const resolveWechat = (root: Dict, errors: string[]) => {
  const wechat = expectObject(root['微信'], '微信', errors)
  return {
    qrUrl: expectString(wechat, '二维码', '微信.二维码', errors),
  }
}

const resolveStats = (root: Dict, errors: string[]) => {
  const stats = expectObject(root['统计'], '统计', errors)
  const startDate = expectString(stats, '建站日期', '统计.建站日期', errors)
  if (startDate) expectDateLike(startDate, '统计.建站日期', errors)
  return { startDate }
}

const resolveGithub = (root: Dict, errors: string[]) => {
  const github = expectObject(root['GitHub'], 'GitHub', errors)
  const username = expectString(github, '用户名', 'GitHub.用户名', errors)
  const repo = expectString(github, '仓库', 'GitHub.仓库', errors)
  const apiBase = expectString(github, '接口地址', 'GitHub.接口地址', errors)

  if (repo) expectRepo(repo, 'GitHub.仓库', errors)
  if (apiBase) expectUrl(apiBase, 'GitHub.接口地址', errors)

  return { username, repo, apiBase: apiBase.replace(/\/+$/, '') }
}

const resolveGiscus = (
  source: Dict,
  errors: string[],
  defaults: { repo: string; lang: string },
): SiteCommentsGiscus => {
  const giscus = expectObject(source['giscus'], '评论.giscus', errors)
  const host = expectOptionalString(giscus, '服务地址', '评论.giscus.服务地址', errors, '')
  const repo = expectOptionalString(giscus, '仓库', '评论.giscus.仓库', errors, defaults.repo)
  const repoId = expectString(giscus, '仓库ID', '评论.giscus.仓库ID', errors)
  const category = expectString(giscus, '分类', '评论.giscus.分类', errors)
  const categoryId = expectString(giscus, '分类ID', '评论.giscus.分类ID', errors)
  const mapping = expectOptionalEnum(
    giscus,
    '映射',
    '评论.giscus.映射',
    errors,
    GISCUS_MAPPING,
    'pathname',
  )
  const term = expectOptionalString(giscus, '指定词', '评论.giscus.指定词', errors, '')
  const strict = expectOptionalBoolean(giscus, '严格', '评论.giscus.严格', errors, true)
  const reactionsEnabled = expectOptionalBoolean(
    giscus,
    '启用反应',
    '评论.giscus.启用反应',
    errors,
    true,
  )
  const emitMetadata = expectOptionalBoolean(
    giscus,
    '发送元数据',
    '评论.giscus.发送元数据',
    errors,
    false,
  )
  const inputPosition = expectOptionalEnum(
    giscus,
    '输入框位置',
    '评论.giscus.输入框位置',
    errors,
    GISCUS_INPUT_POSITION,
    'top',
  )
  const theme = expectOptionalString(giscus, '主题', '评论.giscus.主题', errors, 'light')
  const lang = expectOptionalString(giscus, '语言', '评论.giscus.语言', errors, defaults.lang)
  const loading = expectOptionalEnum(
    giscus,
    '加载方式',
    '评论.giscus.加载方式',
    errors,
    GISCUS_LOADING,
    'lazy',
  )

  if (repo) expectRepo(repo, '评论.giscus.仓库', errors)
  if (host) expectUrl(host, '评论.giscus.服务地址', errors)
  if (mapping === 'number' && !/^\d+$/.test(term)) {
    errors.push('字段「评论.giscus.指定词」在映射为 number 时必须是数字')
  }
  if (mapping === 'specific' && !term) {
    errors.push('字段「评论.giscus.指定词」在映射为 specific 时不能为空')
  }

  return {
    host,
    repo,
    repoId,
    category,
    categoryId,
    mapping,
    term,
    strict,
    reactionsEnabled,
    emitMetadata,
    inputPosition,
    theme,
    lang,
    loading,
  }
}

const resolveComments = (
  root: Dict,
  errors: string[],
  defaults: { repo: string; lang: string },
) => {
  const comments = expectObject(root['评论'], '评论', errors)
  return {
    enabled: expectBoolean(comments, '启用', '评论.启用', errors),
    giscus: resolveGiscus(comments, errors, defaults),
  }
}

const resolveTags = (root: Dict, errors: string[]): SiteTags => {
  const tags = expectObject(root['标签'], '标签', errors)
  const defaultColor = expectString(tags, '默认颜色', '标签.默认颜色', errors)
  const metaRaw = expectObject(tags['元信息'], '标签.元信息', errors)
  const meta: SiteTags['meta'] = {}

  Object.entries(metaRaw).forEach(([key, value]) => {
    if (typeof value === 'string') {
      if (!value.trim()) {
        errors.push(`字段「标签.元信息.${key}」颜色字符串不能为空`)
        return
      }
      meta[key] = value.trim()
      return
    }

    if (!isObject(value)) {
      errors.push(`字段「标签.元信息.${key}」必须是字符串或对象`)
      return
    }

    meta[key] = {
      color: expectString(value, '颜色', `标签.元信息.${key}.颜色`, errors),
      cover: expectString(value, '封面', `标签.元信息.${key}.封面`, errors, { allowEmpty: true }),
      description: expectString(value, '描述', `标签.元信息.${key}.描述`, errors, {
        allowEmpty: true,
      }),
    }
  })

  return { defaultColor, meta }
}

export const validateSiteConfig = (rawConfig: unknown): SiteConfig => {
  const errors: string[] = []
  const root = expectObject(rawConfig, '根节点', errors)

  const site = resolveSiteMeta(root, errors)
  const owner = resolveOwner(root, errors)
  const socials = resolveSocials(root, errors)
  const wechat = resolveWechat(root, errors)
  const stats = resolveStats(root, errors)
  const github = resolveGithub(root, errors)
  const comments = resolveComments(root, errors, { repo: github.repo, lang: site.language })
  const tags = resolveTags(root, errors)

  if (comments.giscus.repo && github.repo && comments.giscus.repo !== github.repo) {
    console.warn(
      '[site.config 警告] 「评论.giscus.仓库」与「GitHub.仓库」不一致，建议保持一致以避免统计偏差。',
    )
  }

  if (errors.length) {
    throw new Error(`site.config 校验失败：\n- ${errors.join('\n- ')}`)
  }

  return {
    site,
    owner,
    socials,
    wechat,
    stats,
    github,
    comments,
    tags,
  }
}
