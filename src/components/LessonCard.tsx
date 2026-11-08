import { Badge, Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import type { Lesson, PlayMode } from '../lib/types'

const MODE_CLASS: Record<PlayMode, string> = {
  follow: 'btn btn-primary',
  recall: 'btn btn-outline-primary',
  flash: 'btn btn-success',
  fall: 'btn btn-warning',
  letters: 'btn btn-accent',
}

const MODE_LABEL: Record<PlayMode, string> = {
  follow: '跟打',
  recall: '默写',
  flash: '闪卡',
  fall: '落字',
  letters: '字母落',
}

export default function LessonCard({ lesson, done, bestCombo }: { lesson: Lesson; done: number; bestCombo?: number }) {
  const stars = Math.min(3, done)
  return (
    <Card className="mode-card h-100">
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
          <div className="d-flex flex-wrap gap-1">
            <Badge bg="primary">
              {lesson.grade}年级{lesson.term === 2 ? '下' : '上'}
            </Badge>
            <Badge bg="light" text="dark">
              {lesson.unit}
            </Badge>
          </div>
          <span className="star-row" aria-label={`星星 ${stars}`}>
            {stars}/3 星
          </span>
        </div>
        <Card.Title className="display-font">{lesson.name}</Card.Title>
        <Card.Text className="text-secondary flex-grow-1">{lesson.blurb}</Card.Text>
        <p className="small text-secondary mb-3">
          {lesson.items.length} 题
          {bestCombo ? ` · 连击 ${bestCombo}` : ''}
          {done ? ` · 通关 ${done}` : ''}
        </p>
        <div className="d-grid gap-2 play-mode-grid">
          {(Object.keys(MODE_LABEL) as PlayMode[]).map((mode) => (
            <Link key={mode} className={MODE_CLASS[mode]} to={`/play/${lesson.id}/${mode}`}>
              {MODE_LABEL[mode]}
            </Link>
          ))}
        </div>
      </Card.Body>
    </Card>
  )
}
