import { Container, ProgressBar, Table } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { lessons } from '../data/lessons'
import { memoryStats, reviewHeatmap } from '../lib/memory'
import { accuracy, loadProgress } from '../lib/progress'

export default function ProgressPage() {
  const store = loadProgress()
  const acc = accuracy(store)
  const memory = memoryStats()
  const heat = reviewHeatmap(7)
  const maxHeat = Math.max(1, ...heat.map((day) => day.count))
  const doneLessons = Object.values(store.lessons).filter((item) => item.done > 0).length

  return (
    <Container className="py-4">
      <h1 className="display-font mb-4">进度</h1>
      <div className="stat-card p-4 mb-4">
        <p className="mb-2">
          星星 {store.stars} · 正确率 {acc}% · 最高连击 {store.bestCombo} · 通关课 {doneLessons}/{lessons.length} · 连续 {memory.streak} 天 · 到期 {memory.due} · 已稳固 {memory.known} · 今日新卡余 {memory.newLeft}
        </p>
        <Link className="btn btn-success mb-3" to="/play/review/flash">
          今日复习
        </Link>
        <ProgressBar now={Math.round((doneLessons / lessons.length) * 100)} />
      </div>
      <div className="stat-card p-4 mb-4">
        <h2 className="h5 display-font mb-3">近 7 天复习</h2>
        <div className="heat-row" aria-label="近七天复习次数">
          {heat.map((day) => (
            <div key={day.date} className="heat-cell">
              <div
                className="heat-bar"
                style={{ height: `${16 + Math.round((day.count / maxHeat) * 48)}px` }}
                data-count={day.count}
                title={`${day.label} ${day.count} 次`}
              />
              <span className="heat-count">{day.count}</span>
              <span className="heat-label">{day.label}</span>
            </div>
          ))}
        </div>
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
