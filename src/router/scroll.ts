const DEFAULT_SCROLL: ScrollToOptions = { left: 0, top: 0 }
let pendingScroll = DEFAULT_SCROLL

export const queueScroll = (position?: ScrollToOptions | null) => {
  pendingScroll = position ?? DEFAULT_SCROLL
}

export const consumeScroll = (): ScrollToOptions => {
  const position = pendingScroll
  pendingScroll = DEFAULT_SCROLL
  return position
}
