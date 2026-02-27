import fs from 'node:fs'
import path from 'node:path'

const GISCUS_MAPPING = ['pathname', 'url', 'title', 'og:title', 'specific', 'number']
const GISCUS_INPUT_POSITION = ['top', 'bottom']
const GISCUS_LOADING = ['lazy', 'eager']

const isObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value)

const expectObject = (value, fieldPath, errors) => {
  if (!isObject(value)) {
    errors.push(`字段「${fieldPath}」必须是对象`)
    return {}
  }
  return value
}

const expectString = (source, key, fieldPath, errors, options = {}) => {
  const value = source[key]
  if (typeof value !== 'string') {
    errors.push(`字段「${fieldPath}」必须是字符串`)
    return ''
  }
  const trimmed = value.trim()
  if (!options.allowEmpty && !trimmed) {
    errors.push(`字段「${fieldPath}」不能为空`)
  }
  return trimmed
}

const expectOptionalString = (source, key, fieldPath, errors, fallback) => {
  const value = source[key]
  if (value === undefined) return fallback
  if (typeof value !== 'string') {
    errors.push(`字段「${fieldPath}」必须是字符串`)
    return fallback
  }
  return value.trim()
}

const expectBoolean = (source, key, fieldPath, errors) => {
  const value = source[key]
  if (typeof value !== 'boolean') {
    errors.push(`字段「${fieldPath}」必须是布尔值`)
    return false
  }
  return value
}

const expectOptionalBoolean = (source, key, fieldPath, errors, fallback) => {
  const value = source[key]
  if (value === undefined) return fallback
  if (typeof value !== 'boolean') {
    errors.push(`字段「${fieldPath}」必须是布尔值`)
    return fallback
  }
  return value
}

const expectStringArray = (source, key, fieldPath, errors) => {
  const value = source[key]
  if (!Array.isArray(value)) {
    errors.push(`字段「${fieldPath}」必须是字符串数组`)
    return []
  }

  const list = value.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean)

  if (list.length !== value.length) {
    errors.push(`字段「${fieldPath}」中存在非字符串或空字符串项`)
  }

  return list
}

const expectUrl = (value, fieldPath, errors) => {
  try {
    const url = new URL(value)
    if (!url.protocol.startsWith('http')) {
      errors.push(`字段「${fieldPath}」必须使用 http 或 https 协议`)
    }
  } catch {
    errors.push(`字段「${fieldPath}」必须是合法 URL`)
  }
}

const expectDateLike = (value, fieldPath, errors) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    errors.push(`字段「${fieldPath}」必须是 YYYY-MM-DD 格式`)
    return
  }
  const parsed = Date.parse(`${value}T00:00:00`)
  if (Number.isNaN(parsed)) {
    errors.push(`字段「${fieldPath}」不是有效日期`)
  }
}

const expectRepo = (value, fieldPath, errors) => {
  if (!/^[^/\s]+\/[^/\s]+$/.test(value)) {
    errors.push(`字段「${fieldPath}」必须是 owner/repo 格式`)
  }
}

const expectEnum = (value, fieldPath, errors, choices) => {
  if (!choices.includes(value)) {
    errors.push(`字段「${fieldPath}」取值无效，可选值：${choices.join('、')}`)
    return choices[0]
  }
  return value
}

const expectOptionalEnum = (source, key, fieldPath, errors, choices, fallback) => {
  const raw = source[key]
  if (raw === undefined) return fallback
  if (typeof raw !== 'string') {
    errors.push(`字段「${fieldPath}」必须是字符串`)
    return fallback
  }
  return expectEnum(raw, fieldPath, errors, choices)
}

const validateSiteConfig = (rawConfig) => {
  const errors = []
  const root = expectObject(rawConfig, '根节点', errors)

  const site = expectObject(root['站点'], '站点', errors)
  const siteUrl = expectString(site, '地址', '站点.地址', errors)
  const siteName = expectString(site, '名称', '站点.名称', errors)
  const siteDescription = expectString(site, '描述', '站点.描述', errors)
  const siteImage = expectString(site, '分享图', '站点.分享图', errors, { allowEmpty: true })
  const siteLanguage = expectString(site, '语言', '站点.语言', errors)
  const brandName = expectString(site, '品牌名', '站点.品牌名', errors)

  if (siteUrl) expectUrl(siteUrl, '站点.地址', errors)
  if (siteImage) expectUrl(siteImage, '站点.分享图', errors)

  const owner = expectObject(root['作者'], '作者', errors)
  const ownerName = expectString(owner, '姓名', '作者.姓名', errors)
  const ownerHeadline = expectString(owner, '头衔', '作者.头衔', errors)
  const ownerGreeting = expectString(owner, '问候语', '作者.问候语', errors)
  const ownerGreetingEmoji = expectString(owner, '问候表情', '作者.问候表情', errors)
  const ownerBio = expectString(owner, '简介', '作者.简介', errors)
  const ownerBioEmphasis = expectString(owner, '简介强调', '作者.简介强调', errors, {
    allowEmpty: true,
  })
  const ownerQuote = expectString(owner, '签名', '作者.签名', errors)
  const ownerAvatar = expectString(owner, '头像', '作者.头像', errors)
  const ownerTags = expectStringArray(owner, '标签', '作者.标签', errors)
  if (ownerAvatar) expectUrl(ownerAvatar, '作者.头像', errors)

  const socials = root['社交链接']
  if (!Array.isArray(socials)) {
    errors.push('字段「社交链接」必须是数组')
  }

  const normalizedSocials = Array.isArray(socials)
    ? socials.map((item, index) => {
        const row = expectObject(item, `社交链接[${index}]`, errors)
        const label = expectString(row, '名称', `社交链接[${index}].名称`, errors)
        const icon = expectString(row, '图标', `社交链接[${index}].图标`, errors)
        const url = expectString(row, '链接', `社交链接[${index}].链接`, errors)
        if (url) expectUrl(url, `社交链接[${index}].链接`, errors)
        return { label, icon, url }
      })
    : []

  const wechat = expectObject(root['微信'], '微信', errors)
  const wechatQrUrl = expectString(wechat, '二维码', '微信.二维码', errors)
  const stats = expectObject(root['统计'], '统计', errors)
  const startDate = expectString(stats, '建站日期', '统计.建站日期', errors)
  if (startDate) expectDateLike(startDate, '统计.建站日期', errors)

  const github = expectObject(root['GitHub'], 'GitHub', errors)
  const githubUsername = expectString(github, '用户名', 'GitHub.用户名', errors)
  const githubRepo = expectString(github, '仓库', 'GitHub.仓库', errors)
  const githubApiBase = expectString(github, '接口地址', 'GitHub.接口地址', errors)

  if (githubRepo) expectRepo(githubRepo, 'GitHub.仓库', errors)
  if (githubApiBase) expectUrl(githubApiBase, 'GitHub.接口地址', errors)

  const comments = expectObject(root['评论'], '评论', errors)
  const giscus = expectObject(comments['giscus'], '评论.giscus', errors)
  const giscusHost = expectOptionalString(giscus, '服务地址', '评论.giscus.服务地址', errors, '')
  const giscusRepo = expectOptionalString(giscus, '仓库', '评论.giscus.仓库', errors, githubRepo)
  const giscusRepoId = expectString(giscus, '仓库ID', '评论.giscus.仓库ID', errors)
  const giscusCategory = expectString(giscus, '分类', '评论.giscus.分类', errors)
  const giscusCategoryId = expectString(giscus, '分类ID', '评论.giscus.分类ID', errors)
  const giscusMapping = expectOptionalEnum(
    giscus,
    '映射',
    '评论.giscus.映射',
    errors,
    GISCUS_MAPPING,
    'pathname',
  )
  const giscusTerm = expectOptionalString(giscus, '指定词', '评论.giscus.指定词', errors, '')
  const giscusStrict = expectOptionalBoolean(giscus, '严格', '评论.giscus.严格', errors, true)
  const giscusReactionsEnabled = expectOptionalBoolean(
    giscus,
    '启用反应',
    '评论.giscus.启用反应',
    errors,
    true,
  )
  const giscusEmitMetadata = expectOptionalBoolean(
    giscus,
    '发送元数据',
    '评论.giscus.发送元数据',
    errors,
    false,
  )
  const giscusInputPosition = expectOptionalEnum(
    giscus,
    '输入框位置',
    '评论.giscus.输入框位置',
    errors,
    GISCUS_INPUT_POSITION,
    'top',
  )
  const giscusTheme = expectOptionalString(giscus, '主题', '评论.giscus.主题', errors, 'light')
  const giscusLang = expectOptionalString(giscus, '语言', '评论.giscus.语言', errors, siteLanguage)
  const giscusLoading = expectOptionalEnum(
    giscus,
    '加载方式',
    '评论.giscus.加载方式',
    errors,
    GISCUS_LOADING,
    'lazy',
  )
  const commentsEnabled = expectBoolean(comments, '启用', '评论.启用', errors)

  if (giscusHost) expectUrl(giscusHost, '评论.giscus.服务地址', errors)
  if (giscusRepo) expectRepo(giscusRepo, '评论.giscus.仓库', errors)
  if (giscusMapping === 'number' && !/^\d+$/.test(giscusTerm)) {
    errors.push('字段「评论.giscus.指定词」在映射为 number 时必须是数字')
  }
  if (giscusMapping === 'specific' && !giscusTerm) {
    errors.push('字段「评论.giscus.指定词」在映射为 specific 时不能为空')
  }

  const tags = expectObject(root['标签'], '标签', errors)
  const tagsDefaultColor = expectString(tags, '默认颜色', '标签.默认颜色', errors)
  const tagMetaRaw = expectObject(tags['元信息'], '标签.元信息', errors)
  const tagMeta = {}

  for (const [key, value] of Object.entries(tagMetaRaw)) {
    if (typeof value === 'string') {
      if (!value.trim()) {
        errors.push(`字段「标签.元信息.${key}」颜色字符串不能为空`)
        continue
      }
      tagMeta[key] = value.trim()
      continue
    }
    if (!isObject(value)) {
      errors.push(`字段「标签.元信息.${key}」必须是字符串或对象`)
      continue
    }
    tagMeta[key] = {
      color: expectString(value, '颜色', `标签.元信息.${key}.颜色`, errors),
      cover: expectString(value, '封面', `标签.元信息.${key}.封面`, errors, { allowEmpty: true }),
      description: expectString(value, '描述', `标签.元信息.${key}.描述`, errors, {
        allowEmpty: true,
      }),
    }
  }

  if (giscusRepo && githubRepo && giscusRepo !== githubRepo) {
    console.warn(
      '[site.config 警告] 「评论.giscus.仓库」与「GitHub.仓库」不一致，建议保持一致以避免统计偏差。',
    )
  }

  if (errors.length) {
    throw new Error(`site.config 校验失败：\n- ${errors.join('\n- ')}`)
  }

  return {
    site: {
      url: siteUrl,
      name: siteName,
      description: siteDescription,
      image: siteImage,
      language: siteLanguage,
      brandName,
    },
    owner: {
      name: ownerName,
      headline: ownerHeadline,
      greeting: ownerGreeting,
      greetingEmoji: ownerGreetingEmoji,
      bio: ownerBio,
      bioEmphasis: ownerBioEmphasis,
      quote: ownerQuote,
      avatar: ownerAvatar,
      tags: ownerTags,
    },
    socials: normalizedSocials,
    wechat: {
      qrUrl: wechatQrUrl,
    },
    stats: {
      startDate,
    },
    github: {
      username: githubUsername,
      repo: githubRepo,
      apiBase: githubApiBase.replace(/\/+$/, ''),
    },
    comments: {
      enabled: commentsEnabled,
      giscus: {
        host: giscusHost,
        repo: giscusRepo,
        repoId: giscusRepoId,
        category: giscusCategory,
        categoryId: giscusCategoryId,
        mapping: giscusMapping,
        term: giscusTerm,
        strict: giscusStrict,
        reactionsEnabled: giscusReactionsEnabled,
        emitMetadata: giscusEmitMetadata,
        inputPosition: giscusInputPosition,
        theme: giscusTheme,
        lang: giscusLang,
        loading: giscusLoading,
      },
    },
    tags: {
      defaultColor: tagsDefaultColor,
      meta: tagMeta,
    },
  }
}

export const loadSiteConfig = (rootDir = process.cwd()) => {
  const siteConfigPath = path.join(rootDir, 'site.config.json')
  if (!fs.existsSync(siteConfigPath)) {
    throw new Error('site.config 校验失败：\n- 缺少配置文件 site.config.json')
  }

  let rawConfig
  try {
    rawConfig = JSON.parse(fs.readFileSync(siteConfigPath, 'utf-8'))
  } catch (error) {
    throw new Error(`site.config 校验失败：\n- JSON 解析失败：${String(error)}`)
  }

  return validateSiteConfig(rawConfig)
}

export const normalizeSiteUrl = (url) => String(url || '').replace(/\/+$/, '')

export const resolveSiteMeta = ({ rootDir = process.cwd() } = {}) => {
  const siteConfig = loadSiteConfig(rootDir)
  const siteUrl = normalizeSiteUrl(siteConfig.site.url)
  const siteName = siteConfig.site.name
  const siteDescription = siteConfig.site.description
  const siteLanguage = siteConfig.site.language

  return {
    siteConfig,
    siteUrl,
    siteName,
    siteDescription,
    siteLanguage,
  }
}
