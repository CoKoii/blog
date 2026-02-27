export const safeDecodeURIComponent = (value: string): string => {
  if (!value) return ''
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export const resolveTitleFromSlug = (slug?: string): string =>
  safeDecodeURIComponent(slug ?? '') || 'Untitled'
