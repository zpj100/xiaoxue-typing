import { Container, ProgressBar, Table } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { lessons } from '../data/lessons'
import { memoryStats } from '../lib/memory'
import { accuracy, loadProgress } from '../lib/progress'

export default function ProgressPage() {
  const store = loadProgress()
  const acc = accuracy(store)
  const memory = memoryStats()
  const doneLessons = Object.values(store.lessons).filter((item) => item.done > 0).length

  return (
    <Container className="py-4">
      <h1 className="display-font mb-4">进度</h1>
      <div className="stat-card p-4 mb-4">
        <p className="mb-2">
          星星 {store.stars} · 正确率 {acc}% · 最高连击 {store.bestCombo} · 通关课 {doneLessons}/{lessons.length} · 连续 {memory.streak} 天 · 到期 {memory.due} · 已稳固 {memory.known}
        </p>
        <Link className="btn btn-success mb-3" to="/play/review/flash">
          今日复习
        </Link>
        <ProgressBar now={Math.round((doneLessons / lessons.length) * 100)} />
      </div>
      <div className="table-responsive arena-card p-3">
        <Table hover className="mb-0">
          <thead>
            <tr>
              <th>课</th>
              <th>通关</th>
              <th>最高连击</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson) => {
              const rec = store.lessons[lesson.id]
              return (
                <tr key={lesson.id}>
                  <td>{lesson.name}</td>
                  <td>{rec?.done ?? 0}</td>
                  <td>{rec?.bestCombo ?? 0}</td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </div>
    </Container>
  )
}
