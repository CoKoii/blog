export type LazySource = {
  src: string
  srcset?: string
  sizes?: string
}

export type LazyEl = HTMLImageElement & { __cleanup?: () => void }
