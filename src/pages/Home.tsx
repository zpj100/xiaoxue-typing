import { Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { BANK_STATS, dailyLesson, reviewLesson } from '../data/lessons'
import { memoryStats } from '../lib/memory'
import { accuracy, loadProgress } from '../lib/progress'

export default function Home() {
  const progress = loadProgress()
  const acc = accuracy(progress)
  const daily = dailyLesson()
  const review = reviewLesson()
  const memory = memoryStats()
  const dailyDone = Boolean(progress.dailyDate && progress.lessons[daily.id]?.done)

  return (
    <Container className="py-4 py-lg-5">
      <Row className="align-items-center g-4">
        <Col lg={7}>
          <div className="hero-card p-4 p-lg-5">
            <p className="text-primary fw-semibold mb-2">白底蓝字 · 打字游戏</p>
            <h1 className="display-font prompt-zh mb-3">小学打字训练营</h1>
            <p className="lead mb-4">
              按年级、上下册选课。语文拼音识字写字，英语 PEP 课本草。闪卡先默打再评级，到期卡片按间隔再出。
            </p>
            <div className="home-tabs">
              <div className="home-tab-row">
                <Link className="btn btn-primary" to="/chinese">
                  语文
                </Link>
                <Link className="btn btn-outline-primary" to="/english">
                  英语
                </Link>
                <Link className="btn btn-outline-primary" to="/progress">
                  进度
                </Link>
              </div>
              <div className="home-tab-row">
                <Link className={memory.due > 0 ? 'btn btn-success' : 'btn btn-outline-primary'} to="/play/review/flash">
                  复习{memory.due > 0 ? ` ${memory.due}` : ''}
                </Link>
                <Link className="btn btn-outline-secondary" to="/wrongbook">
                  错词本
                </Link>
                <Link className="btn btn-outline-secondary" to="/about">
                  关于
                </Link>
              </div>
            </div>
          </div>
        </Col>
        <Col lg={5}>
          <div className="stat-card p-4 mb-3">
            <h2 className="h4 display-font">我的进度</h2>
            <div className="d-flex gap-3 mt-3 flex-wrap">
              <div>
                <div className="fs-2 fw-bold text-primary">{progress.stars}</div>
                <div className="small text-secondary">星星</div>
              </div>
              <div>
                <div className="fs-2 fw-bold text-primary">{acc}%</div>
                <div className="small text-secondary">正确率</div>
              </div>
              <div>
                <div className="fs-2 fw-bold text-primary">{memory.streak}</div>
                <div className="small text-secondary">连续天</div>
              </div>
              <div>
                <div className="fs-2 fw-bold text-primary">{memory.known}</div>
                <div className="small text-secondary">已稳固</div>
              </div>
            </div>
            <Link className="btn btn-link px-0 mt-2" to="/progress">
              查看全部进度
            </Link>
          </div>
          <div className="mode-card p-4 mb-3">
            <div className="d-flex justify-content-between align-items-start gap-2">
              <div>
                <h2 className="h5 display-font mb-1">{review.name}</h2>
                <p className="text-secondary mb-0">{review.blurb}</p>
              </div>
              <span className="star-row">{memory.due ? `${memory.due} 张` : '暂无'}</span>
            </div>
            <Link className="btn btn-success mt-3" to="/play/review/flash">
              {memory.due ? '先复习到期卡' : '去闪卡学新词'}
            </Link>
          </div>
          <div className="mode-card p-4">
            <div className="d-flex justify-content-between align-items-start gap-2">
              <div>
                <h2 className="h5 display-font mb-1">{daily.name}</h2>
                <p className="text-secondary mb-0">{daily.blurb}</p>
              </div>
              <span className="star-row">{dailyDone ? '已完成' : '未完成'}</span>
            </div>
            <Link className="btn btn-warning mt-3" to={`/play/${daily.id}/follow`}>
              {dailyDone ? '再打一遍' : '开始今日 10 题'}
            </Link>
          </div>
        </Col>
      </Row>

      <h2 className="display-font h3 mt-5 mb-3">词库</h2>
      <Row className="g-3">
        <Col md={6} xl={4}>
          <div className="mode-card p-4 h-100">
            <h3 className="h5 display-font">英语 PEP</h3>
            <p className="mb-0 text-secondary">
              单词 {BANK_STATS.englishWords} · 短语 {BANK_STATS.englishPhrases} · 音标 {BANK_STATS.englishPhonetics}，3–6 年级上下册 Unit。
            </p>
          </div>
        </Col>
        <Col md={6} xl={4}>
          <div className="mode-card p-4 h-100">
            <h3 className="h5 display-font">语文识字</h3>
            <p className="mb-0 text-secondary">
              识字 {BANK_STATS.chineseHanzi} · 写字 {BANK_STATS.chineseWrite} · 拼音 {BANK_STATS.chinesePinyin}，1–6 年级上下册。
            </p>
          </div>
        </Col>
        <Col md={6} xl={4}>
          <div className="mode-card p-4 h-100">
            <h3 className="h5 display-font">间隔记忆</h3>
            <p className="mb-0 text-secondary">到期先复习，会了 1/2/4/7 天后再出。忘了当天再排。连续打卡 {memory.streak} 天。</p>
          </div>
        </Col>
      </Row>

      <h2 className="display-font h3 mt-5 mb-3">五种玩法</h2>
      <Row className="g-3">
        <Col md={6} xl={4}>
          <div className="mode-card p-4 h-100">
            <h3 className="h5 display-font">跟打</h3>
            <p className="mb-0 text-secondary">屏幕上有答案，照着敲。打错整词重来，连击攒星星。</p>
          </div>
        </Col>
        <Col md={6} xl={4}>
          <div className="mode-card p-4 h-100">
            <h3 className="h5 display-font">默写</h3>
            <p className="mb-0 text-secondary">只给汉字、中文或音标，凭记忆敲出来。</p>
          </div>
        </Col>
        <Col md={6} xl={4}>
          <div className="mode-card p-4 h-100">
            <h3 className="h5 display-font">闪卡</h3>
            <p className="mb-0 text-secondary">先默打，对了自动过。翻面后点会了 / 犹豫 / 再记，按间隔排下次。</p>
          </div>
        </Col>
        <Col md={6} xl={4}>
          <div className="mode-card p-4 h-100">
            <h3 className="h5 display-font">落字</h3>
            <p className="mb-0 text-secondary">整词往下掉，打对接住。速度可调，漏 8 个结束，可重开。</p>
          </div>
        </Col>
        <Col md={6} xl={4}>
          <div className="mode-card p-4 h-100">
            <h3 className="h5 display-font">字母落</h3>
            <p className="mb-0 text-secondary">逐个字母落下，同步读字母、单词和汉字/翻译。</p>
          </div>
        </Col>
      </Row>
    </Container>
  )
}
