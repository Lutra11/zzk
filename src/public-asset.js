export function resolvePublicAsset(baseUrl, assetPath) {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  return `${normalizedBase}${assetPath.replace(/^\/+/, '')}`
}
