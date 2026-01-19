import { pinyin } from 'pinyin-pro'

// 将中文转换为 URL 友好的拼音格式，保留英文和数字
export const toPinyinSlug = (text) => {
  const segments = []
  let currentSegment = ''
  let isChineseSegment = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const isChinese = /[\u4e00-\u9fa5]/.test(char)

    if (i === 0) {
      currentSegment = char
      isChineseSegment = isChinese
    } else if (isChinese === isChineseSegment) {
      currentSegment += char
    } else {
      if (currentSegment) segments.push({ text: currentSegment, isChinese: isChineseSegment })
      currentSegment = char
      isChineseSegment = isChinese
    }
  }
  if (currentSegment) segments.push({ text: currentSegment, isChinese: isChineseSegment })

  return segments
    .map((seg) => {
      if (seg.isChinese) {
        return pinyin(seg.text, {
          pattern: 'pinyin',
          toneType: 'none',
          type: 'array',
        }).join('')
      }
      return seg.text.replace(/[^a-zA-Z0-9]/g, '')
    })
    .filter((s) => s.length > 0)
    .join('-')
    .toLowerCase()
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export const buildArticlePath = (category, slug) =>
  `/article/${toPinyinSlug(category)}/${toPinyinSlug(slug)}`
