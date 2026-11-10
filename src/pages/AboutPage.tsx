import { useState } from 'react'
import { Alert, Badge, Container } from 'react-bootstrap'
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

export default function AboutPage() {
  const version = currentAppVersion()
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [release, setRelease] = useState<LatestRelease | null>(null)

  async function checkUpdate() {
    setStatus('checking')
    setMessage('')
    setRelease(null)
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
    setMessage('正在打开发行版安装包。平板允许安装未知来源后即可更新。')
    installRelease(release)
  }

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
          <button type="button" className="btn btn-primary btn-lg" onClick={checkUpdate} disabled={status === 'checking'}>
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

        {status === 'installing' ? (
          <Alert variant="info" className="mt-4 mb-0">
            {message}
          </Alert>
        ) : null}
      </div>
    </Container>
  )
}
