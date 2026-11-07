import { Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { accuracy, loadProgress } from '../lib/progress'
import { lessons } from '../data/lessons'

export default function Home() {
  const progress = loadProgress()
  const acc = accuracy(progress)

  return (
    <Container className="py-4 py-lg-5">
      <Row className="align-items-center g-4">
        <Col lg={7}>
          <div className="hero-card p-4 p-lg-5">
            <p className="text-primary fw-semibold mb-2">边打字，边把课文敲进脑子</p>
            <h1 className="display-font prompt-zh mb-3">小学打字训练营</h1>
            <p className="lead mb-4">
              语文练拼音、识字、写字；英语练单词、音标、短语、语法。打错整词重来、键位高亮、错词本、WPM，仿 Qwerty Learner / TypeWords。
            </p>
            <div className="d-flex flex-wrap gap-2">
              <Link className="btn btn-primary btn-lg" to="/chinese">
                练语文
              </Link>
              <Link className="btn btn-outline-primary btn-lg" to="/english">
                练英语
              </Link>
              <Link className="btn btn-outline-secondary btn-lg" to="/wrongbook">
                错词本
              </Link>
              <Link className="btn btn-outline-secondary btn-lg" to="/about">
                关于 / 更新
              </Link>
            </div>
          </div>
        </Col>
        <Col lg={5}>
          <div className="stat-card p-4">
            <h2 className="h4 display-font">我的进度</h2>
            <div className="d-flex gap-3 mt-3">
              <div>
                <div className="fs-2 fw-bold text-primary">{progress.stars}</div>
                <div className="small text-secondary">星星</div>
              </div>
              <div>
                <div className="fs-2 fw-bold text-primary">{acc}%</div>
                <div className="small text-secondary">正确率</div>
              </div>
              <div>
                <div className="fs-2 fw-bold text-primary">{progress.bestCombo}</div>
                <div className="small text-secondary">最高连击</div>
              </div>
            </div>
            <Link className="btn btn-link px-0 mt-2" to="/progress">
              查看全部进度
            </Link>
          </div>
        </Col>
      </Row>

      <h2 className="display-font h3 mt-5 mb-3">四种玩法</h2>
      <Row className="g-3">
        <Col md={6} xl={3}>
          <div className="mode-card p-4 h-100">
            <h3 className="h5 display-font">跟打</h3>
            <p className="mb-0 text-secondary">屏幕上有答案，照着敲。打错整词重来。</p>
          </div>
        </Col>
        <Col md={6} xl={3}>
          <div className="mode-card p-4 h-100">
            <h3 className="h5 display-font">默写</h3>
            <p className="mb-0 text-secondary">只给汉字、中文或音标，凭记忆敲出来。</p>
          </div>
        </Col>
        <Col md={6} xl={3}>
          <div className="mode-card p-4 h-100">
            <h3 className="h5 display-font">落字</h3>
            <p className="mb-0 text-secondary">整词往下掉，打对就接住。</p>
          </div>
        </Col>
        <Col md={6} xl={3}>
          <div className="mode-card p-4 h-100">
            <h3 className="h5 display-font">字母落</h3>
            <p className="mb-0 text-secondary">逐个字母落下，同步读字母、单词和汉字/翻译。</p>
          </div>
        </Col>
      </Row>

      <p className="text-secondary mt-4 mb-0">
        共 {lessons.length} 课。英语词表抽样自本仓库人教版小学词库；拼音、识字、语法为课标常用条目。
      </p>
    </Container>
  )
}
