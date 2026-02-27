const formatByLocale = (
  dateString: string | undefined,
  options: Intl.DateTimeFormatOptions,
): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('zh-CN', options)
}

export function formatDate(dateString?: string): string {
  return formatByLocale(dateString, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateYMD(dateString?: string): string {
  return formatByLocale(dateString, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}
