import { useState } from 'react'
import { Alert, Badge, Container, ProgressBar } from 'react-bootstrap'
import {
  compareVersions,
  currentAppVersion,
  fetchLatestRelease,
  installRelease,
  openRelease,
  type LatestRelease,
} from '../lib/update'
import { APP_NAME, APP_VERSION_CODE, GITEE_URL, GITHUB_URL, RELEASES_URL } from '../lib/version'

type Status = 'idle' | 'checking' | 'latest' | 'available' | 'error' | 'installing'

function formatBytes(value: number): string {
  if (value <= 0) return '0 B'
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

export default function AboutPage() {
  const version = currentAppVersion()
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [release, setRelease] = useState<LatestRelease | null>(null)
  const [percent, setPercent] = useState(0)
  const [received, setReceived] = useState(0)
  const [total, setTotal] = useState(0)

  async function checkUpdate() {
    setStatus('checking')
    setMessage('')
    setRelease(null)
    setPercent(0)
    setReceived(0)
    setTotal(0)
    try {
      const latest = await fetchLatestRelease()
      if (!latest) {
        setStatus('latest')
        setMessage('还没有发行版，或已经是最新版本。')
        return
      }
      if (compareVersions(latest.version, version) <= 0) {
        setStatus('latest')
        setMessage(`当前 ${version} 已是最新。`)
        setRelease(latest)
        return
      }
      setStatus('available')
      setRelease(latest)
      setMessage(`发现新版本 ${latest.version}`)
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : '检查更新失败')
    }
  }

  function startInstall() {
    if (!release) return
    setStatus('installing')
    setPercent(0)
    setReceived(0)
    setTotal(0)
    setMessage('正在下载安装包…')
    installRelease(release, (progress) => {
      if (progress.status.startsWith('error:')) {
        setStatus('error')
        setMessage(progress.status.slice(6) || '下载失败')
        return
      }
      setPercent(progress.percent < 0 ? 0 : progress.percent)
      setReceived(progress.received)
      setTotal(progress.total)
      if (progress.status === 'done') {
        setPercent(100)
        setMessage('下载完成，正在打开安装器。平板允许安装未知来源后即可更新。')
        return
      }
      if (progress.total > 0 && progress.percent >= 0) {
        setMessage(`正在下载 ${progress.percent}%`)
        return
      }
      setMessage('正在下载安装包…')
    })
  }

  const showBar = status === 'installing'
  const barNow = percent < 0 ? 0 : percent
  const barLabel = total > 0 ? `${barNow}% · ${formatBytes(received)} / ${formatBytes(total)}` : '下载中'

  return (
    <Container className="py-4 py-lg-5">
      <div className="arena-card p-4 p-lg-5 about-card">
        <p className="text-primary fw-semibold mb-2">版本与更新</p>
        <h1 className="display-font h2 mb-3">{APP_NAME}</h1>
        <p className="mb-2">
          当前版本 <Badge bg="primary">{version}</Badge>
          <span className="text-secondary ms-2">编译号 {APP_VERSION_CODE}</span>
        </p>
        <p className="text-secondary">
          语文拼音 / 识字 / 写字，英语 48 音标 / PEP 单词 / 短语 / 语法。听写只播声音，跟读进间隔记忆。闪卡先默打再评级，到期卡片按 1/2/4/7 天再出。
        </p>
        <div className="d-flex flex-wrap gap-2 mt-3">
          <button type="button" className="btn btn-primary btn-lg" onClick={checkUpdate} disabled={status === 'checking' || status === 'installing'}>
            {status === 'checking' ? '正在检查…' : '检查更新'}
          </button>
          <button type="button" className="btn btn-outline-primary btn-lg" onClick={() => openRelease(RELEASES_URL)}>
            Gitee 发行版
          </button>
          <button type="button" className="btn btn-outline-secondary btn-lg" onClick={() => openRelease(GITEE_URL)}>
            Gitee 源码
          </button>
          <button type="button" className="btn btn-outline-secondary btn-lg" onClick={() => openRelease(GITHUB_URL)}>
            GitHub
          </button>
        </div>

        {status === 'available' && release ? (
          <Alert variant="warning" className="mt-4 mb-0">
            <p className="fw-semibold mb-2">{message}</p>
            <pre className="about-notes mb-3">{release.notes || '无更新说明'}</pre>
            <button type="button" className="btn btn-accent" onClick={startInstall}>
              从发行版更新
            </button>
          </Alert>
        ) : null}

        {status === 'latest' ? (
          <Alert variant="success" className="mt-4 mb-0">
            {message}
          </Alert>
        ) : null}

        {status === 'error' ? (
          <Alert variant="danger" className="mt-4 mb-0">
            {message}
          </Alert>
        ) : null}

        {showBar ? (
          <Alert variant="info" className="mt-4 mb-0">
            <p className="mb-2">{message}</p>
            <ProgressBar now={barNow} label={barLabel} animated={barNow < 100} striped={barNow < 100} />
          </Alert>
        ) : null}
      </div>
    </Container>
  )
}
