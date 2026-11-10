import { Col, Container, Row } from 'react-bootstrap'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import LessonCard from '../components/LessonCard'
import { KIND_NAME, TERM_NAME, lessonsBySubject } from '../data/lessons'
import { loadProgress } from '../lib/progress'
import type { Kind, Subject, Term } from '../lib/types'

const KIND_FILTER: Record<Subject, Kind[]> = {
  chinese: ['pinyin', 'hanzi', 'write'],
  english: ['word', 'phonetic', 'phrase', 'grammar'],
}

export default function SubjectPage({
  subject,
  initialKind = 'all',
  lockKind = false,
}: {
  subject: Subject
  initialKind?: Kind | 'all'
  lockKind?: boolean
}) {
  const all = lessonsBySubject(subject)
  const grades = subject === 'chinese' ? [1, 2, 3, 4, 5, 6] : [3, 4, 5, 6]
  const [grade, setGrade] = useState<number | 'all'>('all')
  const [term, setTerm] = useState<Term | 'all'>('all')
  const [kind, setKind] = useState<Kind | 'all'>(initialKind)
  const progress = loadProgress()

  const filtered = useMemo(() => {
    return all.filter((lesson) => {
      if (grade !== 'all' && lesson.grade !== grade) return false
      if (term !== 'all' && lesson.term !== term) return false
      if (kind !== 'all' && lesson.kind !== kind) return false
      return true
    })
  }, [all, grade, kind, term])

  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>()
    for (const lesson of filtered) {
      const key = `${lesson.grade}年级${TERM_NAME[lesson.term]}`
      const bucket = map.get(key) ?? []
      bucket.push(lesson)
      map.set(key, bucket)
    }
    return [...map.entries()]
  }, [filtered])

  const title =
    lockKind && initialKind === 'pinyin'
      ? '汉语拼音'
      : lockKind && initialKind === 'phonetic'
        ? '英语音标'
        : subject === 'chinese'
          ? '语文打字'
          : '英语打字'
  const firstTodo = filtered.find((lesson) => !progress.lessons[lesson.id]?.done)

  return (
    <Container className="py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
        <div>
          <h1 className="display-font mb-1">{title}</h1>
          <p className="text-secondary mb-0">
            {filtered.length} 课 · {lockKind ? '先听再打，到期卡进今日复习' : '先选年级和上下册，再选拼音/单词等'}
          </p>
        </div>
        {firstTodo ? (
          <Link className="btn btn-primary btn-lg" to={`/play/${firstTodo.id}/follow`}>
            接着练：{firstTodo.name}
          </Link>
        ) : null}
      </div>

      <div className="filter-board mb-4">
        <div className="filter-block">
          <div className="filter-label">年级</div>
          <div className="chip-row">
            <button type="button" className={chipClass(grade === 'all')} onClick={() => setGrade('all')}>
              全部
            </button>
            {grades.map((g) => (
              <button key={g} type="button" className={chipClass(grade === g)} onClick={() => setGrade(g)}>
                {g}年级
              </button>
            ))}
          </div>
        </div>
        <div className="filter-block">
          <div className="filter-label">册次</div>
          <div className="chip-row">
            <button type="button" className={chipClass(term === 'all')} onClick={() => setTerm('all')}>
              全册
            </button>
            <button type="button" className={chipClass(term === 1)} onClick={() => setTerm(1)}>
              上册
            </button>
            <button type="button" className={chipClass(term === 2)} onClick={() => setTerm(2)}>
              下册
            </button>
          </div>
        </div>
        {lockKind ? null : (
          <div className="filter-block">
            <div className="filter-label">内容</div>
            <div className="chip-row">
              <button type="button" className={chipClass(kind === 'all')} onClick={() => setKind('all')}>
                全部
              </button>
              {KIND_FILTER[subject].map((k) => (
                <button key={k} type="button" className={chipClass(kind === k)} onClick={() => setKind(k)}>
                  {KIND_NAME[k]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {groups.length === 0 ? (
        <div className="arena-card p-4">这一档还没有课，换个年级或内容试试。</div>
      ) : (
        groups.map(([label, group]) => (
          <section key={label} className="mb-4">
            <h2 className="h4 display-font mb-3">{label}</h2>
            <Row className="g-3">
              {group.map((lesson) => {
                const rec = progress.lessons[lesson.id]
                return (
                  <Col md={6} xl={4} key={lesson.id}>
                    <LessonCard lesson={lesson} done={rec?.done ?? 0} bestCombo={rec?.bestCombo} />
                  </Col>
                )
              })}
            </Row>
          </section>
        ))
      )}
    </Container>
  )
}

function chipClass(active: boolean): string {
  return `chip-btn${active ? ' is-on' : ''}`
}
