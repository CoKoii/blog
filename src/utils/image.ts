const OSS_PROCESS_PARAM = 'x-oss-process'

type ImageFormat = 'webp' | 'avif'

export type OptimizeImageOptions = {
  width?: number
  height?: number
  quality?: number
  format?: ImageFormat
  mode?: 'm_fill' | 'm_lfit'
}

export type ImageSource = {
  src: string
  srcset?: string
  sizes?: string
}

export type ResponsiveImageOptions = Omit<OptimizeImageOptions, 'width'> & {
  srcWidth?: number
  widths?: number[]
  sizes?: string
}

export type DensityImageOptions = Omit<OptimizeImageOptions, 'width' | 'height'> & {
  sizes?: string
  variants: Array<{
    width: number
    height?: number
    descriptor: string
  }>
}

const toPositiveInt = (value?: number) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return 0
  return Math.round(value)
}

const normalizePositiveInts = (values: number[]) =>
  [...new Set(values.map(toPositiveInt).filter(Boolean))].sort((a, b) => a - b)

const toImageSource = (src: string, srcset = '', sizes = ''): ImageSource => ({
  src,
  ...(srcset ? { srcset } : {}),
  ...(sizes ? { sizes } : {}),
})

const getSizedImageUrl = (
  src: string,
  options: Omit<OptimizeImageOptions, 'width' | 'height'>,
  width?: number,
  height?: number,
) =>
  getOptimizedImageUrl(src, {
    ...options,
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
  })

const buildOssProcess = (options: OptimizeImageOptions) => {
  const width = toPositiveInt(options.width)
  const height = toPositiveInt(options.height)
  const quality = toPositiveInt(options.quality)
  const mode = options.mode
  const format = options.format

  const steps: string[] = []
  const resizeArgs: string[] = []

  if (mode) resizeArgs.push(mode)
  if (width) resizeArgs.push(`w_${width}`)
  if (height) resizeArgs.push(`h_${height}`)
  if (resizeArgs.length) steps.push(`resize,${resizeArgs.join(',')}`)
  if (quality) steps.push(`quality,q_${quality}`)
  if (format) steps.push(`format,${format}`)

  return steps.length ? `image/${steps.join('/')}` : ''
}

export const isAliyunOssUrl = (src: string) => {
  if (!src) return false
  try {
    const url = new URL(src)
    return url.hostname.includes('.oss-') && url.hostname.endsWith('.aliyuncs.com')
  } catch {
    return false
  }
}

export const getImageOrigin = (src: string) => {
  if (!src) return ''
  try {
    return new URL(src).origin
  } catch {
    return ''
  }
}

export const getOptimizedImageUrl = (src: string, options: OptimizeImageOptions = {}) => {
  if (!isAliyunOssUrl(src)) return src

  const process = buildOssProcess(options)
  if (!process) return src

  const url = new URL(src)
  if (url.searchParams.has(OSS_PROCESS_PARAM)) return src
  url.searchParams.set(OSS_PROCESS_PARAM, process)
  return url.toString()
}

export const getOptimizedImageSrcSet = (
  src: string,
  widths: number[],
  options: Omit<OptimizeImageOptions, 'width'> = {},
) => {
  if (!isAliyunOssUrl(src)) return ''

  const uniqueWidths = normalizePositiveInts(widths)
  return uniqueWidths
    .map((width) => `${getSizedImageUrl(src, options, width)} ${width}w`)
    .join(', ')
}

export const createResponsiveImageSource = (
  src: string,
  { srcWidth, widths = [], sizes, ...options }: ResponsiveImageOptions,
): ImageSource => {
  const normalizedWidths = normalizePositiveInts(widths)
  const baseWidth = toPositiveInt(srcWidth) || normalizedWidths[0]
  const baseSrc = baseWidth ? getSizedImageUrl(src, options, baseWidth) : getOptimizedImageUrl(src, options)
  const srcset = normalizedWidths.length ? getOptimizedImageSrcSet(src, normalizedWidths, options) : ''

  return toImageSource(baseSrc, srcset, sizes)
}

export const createDensityImageSource = (
  src: string,
  { variants, sizes, ...options }: DensityImageOptions,
): ImageSource => {
  const normalizedVariants = variants
    .map((variant) => ({
      descriptor: variant.descriptor.trim(),
      width: toPositiveInt(variant.width),
      height: toPositiveInt(variant.height),
    }))
    .filter((variant) => variant.descriptor && variant.width)

  const [baseVariant] = normalizedVariants
  const baseSrc = baseVariant
    ? getSizedImageUrl(src, options, baseVariant.width, baseVariant.height)
    : getOptimizedImageUrl(src, options)

  const srcset = normalizedVariants
    .map((variant) => {
      const variantSrc = getSizedImageUrl(src, options, variant.width, variant.height)
      return `${variantSrc} ${variant.descriptor}`
    })
    .join(', ')

  return toImageSource(baseSrc, srcset, sizes)
}
