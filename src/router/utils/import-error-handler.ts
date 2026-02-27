const RELOAD_KEY = '__router_import_reload_path__'
const RELOAD_QUERY = '__reload'
const IMPORT_ERROR_RE =
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i

const buildPath = (path: string, withReload = false) => {
  const url = new URL(path, window.location.origin)
  if (withReload) {
    url.searchParams.set(RELOAD_QUERY, Date.now().toString())
  } else {
    url.searchParams.delete(RELOAD_QUERY)
  }
  return `${url.pathname}${url.search}${url.hash}`
}

export const isImportError = (error: unknown): error is Error =>
  error instanceof Error && IMPORT_ERROR_RE.test(error.message)

export const getCurrentPath = () =>
  `${window.location.pathname}${window.location.search}${window.location.hash}`

export const handleImportError = (error: unknown, targetPath: string = getCurrentPath()) => {
  const path = buildPath(targetPath)
  if (sessionStorage.getItem(RELOAD_KEY) === path) {
    sessionStorage.removeItem(RELOAD_KEY)
    console.error('[Router] Import failed after reload. Check deployment/cache strategy.', error)
    return
  }
  sessionStorage.setItem(RELOAD_KEY, path)
  window.location.replace(buildPath(targetPath, true))
}

export const normalizeCurrentPath = () => {
  const currentPath = getCurrentPath()
  const normalized = buildPath(currentPath)
  if (normalized !== currentPath) {
    window.history.replaceState(window.history.state, '', normalized)
  }
}

export const clearReloadKey = (path: string) => {
  const normalizedPath = buildPath(path)
  if (sessionStorage.getItem(RELOAD_KEY) === normalizedPath) {
    sessionStorage.removeItem(RELOAD_KEY)
  }
}

export const setupImportErrorHandler = () => {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault()
    handleImportError(event)
  })
}
