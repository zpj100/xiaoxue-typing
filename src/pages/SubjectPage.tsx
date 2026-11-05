import { Col, Container, Form, Row } from 'react-bootstrap'
import { useMemo, useState } from 'react'
import LessonCard from '../components/LessonCard'
import { lessonsBySubject } from '../data/lessons'
import { loadProgress } from '../lib/progress'
import type { Kind, Subject } from '../lib/types'

const KIND_FILTER: Record<Subject, Kind[]> = {
  chinese: ['pinyin', 'hanzi', 'write'],
  english: ['word', 'phonetic', 'phrase', 'grammar'],
}

const KIND_LABEL: Record<Kind, string> = {
  pinyin: '拼音',
  hanzi: '识字',
  write: '写字',
  word: '单词',
  phonetic: '音标',
  phrase: '短语',
  grammar: '语法',
}

export default function SubjectPage({ subject }: { subject: Subject }) {
  const all = lessonsBySubject(subject)
  const [grade, setGrade] = useState('all')
  const [kind, setKind] = useState<Kind | 'all'>('all')
  const progress = loadProgress()

  const filtered = useMemo(() => {
    return all.filter((lesson) => {
      if (grade !== 'all' && lesson.grade !== Number(grade)) return false
      if (kind !== 'all' && lesson.kind !== kind) return false
      return true
    })
  }, [all, grade, kind])

  const title = subject === 'chinese' ? '语文打字' : '英语打字'
  const grades = subject === 'chinese' ? [1, 2, 3, 4, 5, 6] : [3, 4, 5, 6]

  return (
    <Container className="py-4">
      <h1 className="display-font mb-3">{title}</h1>
      <Row className="g-3 mb-4">
        <Col sm={6} md={3}>
          <Form.Label>年级</Form.Label>
          <Form.Select value={grade} onChange={(e) => setGrade(e.target.value)} aria-label="选择年级">
            <option value="all">全部年级</option>
            {grades.map((g) => (
              <option key={g} value={g}>
                {g}年级
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col sm={6} md={3}>
          <Form.Label>内容</Form.Label>
          <Form.Select
            value={kind}
            onChange={(e) => setKind(e.target.value as Kind | 'all')}
            aria-label="选择内容"
          >
            <option value="all">全部内容</option>
            {KIND_FILTER[subject].map((k) => (
              <option key={k} value={k}>
                {KIND_LABEL[k]}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>
      <Row className="g-3">
        {filtered.map((lesson) => (
          <Col md={6} xl={4} key={lesson.id}>
            <LessonCard lesson={lesson} done={progress.lessons[lesson.id]?.done ?? 0} />
          </Col>
        ))}
      </Row>
    </Container>
  )
}
