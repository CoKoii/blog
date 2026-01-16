export const safeDecodeURIComponent = (value: string): string => {
  if (!value) return ''
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
