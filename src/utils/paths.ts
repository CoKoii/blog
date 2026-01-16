export const buildArticlePath = (category: string, slug: string): string =>
  `/article/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`
