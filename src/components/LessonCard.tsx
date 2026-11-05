import { Badge, Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import type { Lesson, PlayMode } from '../lib/types'

const MODE_CLASS: Record<PlayMode, string> = {
  follow: 'btn btn-primary btn-sm',
  recall: 'btn btn-outline-primary btn-sm',
  fall: 'btn btn-warning btn-sm',
  letters: 'btn btn-accent btn-sm',
}

const MODE_LABEL: Record<PlayMode, string> = {
  follow: '跟打',
  recall: '默写',
  fall: '落字',
  letters: '字母落',
}

export default function LessonCard({ lesson, done }: { lesson: Lesson; done: number }) {
  return (
    <Card className="mode-card h-100">
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Badge bg="primary">{lesson.grade}年级</Badge>
          {done > 0 ? <Badge bg="success">通关 {done}</Badge> : null}
        </div>
        <Card.Title className="display-font">{lesson.name}</Card.Title>
        <Card.Text className="text-secondary flex-grow-1">{lesson.blurb}</Card.Text>
        <p className="small text-secondary mb-3">{lesson.items.length} 题</p>
        <div className="d-flex flex-wrap gap-2">
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
