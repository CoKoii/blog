import { siteConfig, type SiteOwner, type SiteSocialLink, type SiteStats, type SiteWechat } from './raw'

const config = siteConfig

export const brandName = config.brandName || config.owner?.name || 'CaoKai'

export const ownerProfile: Required<SiteOwner> = {
  name: config.owner?.name || 'CaoKai',
  headline: config.owner?.headline || 'Full-Stack Developer',
  greeting: config.owner?.greeting || "Hi, I'm CaoKai",
  greetingEmoji: config.owner?.greetingEmoji || '👋',
  bio:
    config.owner?.bio ||
    '欢迎来到我的博客 😝，这里是我记笔记的地方 🙌，目前在杭州实习',
  bioEmphasis: config.owner?.bioEmphasis || '— 致力于成为一个前端小姥.',
  quote: config.owner?.quote || '我见青山多妩媚，料青山见我应如是',
  avatar: config.owner?.avatar || '',
  tags: config.owner?.tags || [],
  githubUsername: config.owner?.githubUsername || 'CoKoii',
}

export const socialLinks: SiteSocialLink[] = config.socials || [
  { label: 'GitHub', icon: 'lucide:github', url: '#' },
  { label: 'Twitter / X', icon: 'lucide:twitter', url: '#' },
  { label: 'Dribbble', icon: 'lucide:dribbble', url: '#' },
]

export const wechatConfig: Required<SiteWechat> = {
  qrUrl:
    config.wechat?.qrUrl ||
    'https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://weixin.qq.com/',
}

export const statsConfig: Required<SiteStats> = {
  startDate: config.stats?.startDate || '2026-01-04',
}
