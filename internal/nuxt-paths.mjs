function trimSlashes(value) {
  return String(value).replace(/^\/+|\/+$/g, '')
}

function normalizePart(part) {
  const p = String(part || '').replace(/\\/g, '/')
  if (!p) return ''

  // Vite absolute fs path in dev should be exposed as /_nuxt/@fs/...
  if (/^\/(home|Users|tmp|var|opt|mnt)\//.test(p)) {
    return `@fs${p}`
  }

  if (p.startsWith('/_nuxt/')) {
    return trimSlashes(p.slice('/_nuxt/'.length))
  }

  return trimSlashes(p)
}

export function baseURL() {
  return '/'
}

export function buildAssetsDir() {
  return '/_nuxt/'
}

export function publicAssetsURL(...path) {
  if (!path.length) return '/'
  return `/${path.map(trimSlashes).filter(Boolean).join('/')}`
}

export function buildAssetsURL(...path) {
  const suffix = path.map(normalizePart).filter(Boolean).join('/')
  return suffix ? `/_nuxt/${suffix}` : '/_nuxt/'
}
