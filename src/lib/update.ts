import { APP_VERSION, RELEASES_API } from './version'

export type LatestRelease = {
  version: string
  title: string
  notes: string
  apkUrl: string
  apkName: string
  htmlUrl: string
}

declare global {
  interface Window {
    AndroidUpdate?: {
      currentVersion: () => string
      checkLatest: () => string
      openUrl: (url: string) => void
      downloadAndInstall: (url: string, name: string) => void
    }
  }
}

export function compareVersions(left: string, right: string): number {
  const parts = (value: string) =>
    value
      .replace(/^v/i, '')
      .split(/[^0-9]+/)
      .filter(Boolean)
      .map((item) => Number(item) || 0)
  const a = parts(left)
  const b = parts(right)
  const len = Math.max(a.length, b.length)
  for (let i = 0; i < len; i += 1) {
    const compared = (a[i] || 0) - (b[i] || 0)
    if (compared) return compared > 0 ? 1 : -1
  }
  return 0
}

function parseRelease(raw: unknown): LatestRelease | null {
  if (!raw || typeof raw !== 'object') return null
  const data = raw as Record<string, unknown>
  const version = String(data.tag_name || '')
    .trim()
    .replace(/^v/i, '')
  const assets = Array.isArray(data.assets) ? data.assets : []
  let apkUrl = ''
  let apkName = ''
  for (const asset of assets) {
    if (!asset || typeof asset !== 'object') continue
    const item = asset as Record<string, unknown>
    const name = String(item.name || '')
    const url = String(item.browser_download_url || item.direct_asset_url || '')
    if (name.toLowerCase().endsWith('.apk') || url.toLowerCase().includes('.apk')) {
      apkName = name || `xiaoxue-typing-${version}.apk`
      apkUrl = url
      break
    }
  }
  if (!version || !apkUrl) return null
  return {
    version,
    title: String(data.name || `小学打字训练营 ${version}`),
    notes: String(data.body || ''),
    apkUrl,
    apkName,
    htmlUrl: String(data.html_url || ''),
  }
}

export async function fetchLatestRelease(): Promise<LatestRelease | null> {
  if (window.AndroidUpdate?.checkLatest) {
    const raw = window.AndroidUpdate.checkLatest()
    if (!raw) return null
    if (raw.startsWith('ERROR:')) throw new Error(raw.slice(6))
    try {
      return parseRelease(JSON.parse(raw))
    } catch {
      throw new Error('发行版信息无法解析')
    }
  }
  const response = await fetch(RELEASES_API, {
    headers: {
      Accept: 'application/json',
      'User-Agent': `XiaoXueTyping/${APP_VERSION}`,
    },
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`检查更新失败：HTTP ${response.status}`)
  return parseRelease(await response.json())
}

export function currentAppVersion(): string {
  return window.AndroidUpdate?.currentVersion?.() || APP_VERSION
}

export function openRelease(url: string): void {
  if (window.AndroidUpdate?.openUrl) {
    window.AndroidUpdate.openUrl(url)
    return
  }
  window.open(url, '_blank', 'noopener')
}

export function installRelease(release: LatestRelease): void {
  if (window.AndroidUpdate?.downloadAndInstall) {
    window.AndroidUpdate.downloadAndInstall(release.apkUrl, release.apkName)
    return
  }
  openRelease(release.apkUrl || release.htmlUrl)
}
