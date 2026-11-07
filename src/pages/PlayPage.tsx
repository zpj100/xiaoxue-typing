import { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Badge, Container } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import SpeakerButton from '../components/SpeakerButton'
import TypedLine from '../components/TypedLine'
import KeyGuide from '../components/KeyGuide'
import { getLesson } from '../data/lessons'
import {
  applyKey,
  compareInput,
  normalizeAnswer,
  speakItem,
  speakLetterWithWord,
  stopSpeak,
} from '../lib/engine'
import { recordLesson } from '../lib/progress'
import type { LessonItem, PlayMode } from '../lib/types'
import { addWrong, wrongItems } from '../lib/wrongbook'

type FallItem = {
  id: number
  item: LessonItem
  letter: string
  remain: string
  x: number
  y: number
}

export default function PlayPage() {
  const { lessonId = '', mode = 'follow' } = useParams()
  const playMode = (mode as PlayMode) || 'follow'
  const isWrongBook = lessonId === 'wrongbook'
  const lesson = isWrongBook ? undefined : getLesson(lessonId)
  const items = isWrongBook ? wrongItems() : lesson?.items ?? []
  const title = isWrongBook ? '错词本' : lesson?.name ?? ''
  const subject = isWrongBook ? items[0]?.subject : lesson?.subject

  if (!isWrongBook && !lesson) {
    return (
      <Container className="py-5">
        <Alert variant="warning">找不到这一课。</Alert>
        <Link className="btn btn-primary" to="/">
          回首页
        </Link>
      </Container>
    )
  }

  if (isWrongBook && items.length === 0) {
    return (
      <Container className="py-5">
        <Alert variant="info">错词本是空的。</Alert>
        <Link className="btn btn-primary" to="/wrongbook">
          返回错词本
        </Link>
      </Container>
    )
  }

  if (playMode === 'fall' || playMode === 'letters') {
    return (
      <FallGame
        lessonId={isWrongBook ? 'wrongbook' : lesson!.id}
        items={items}
        title={title}
        letterMode={playMode === 'letters'}
        backTo={isWrongBook ? '/wrongbook' : subject === 'english' ? '/english' : '/chinese'}
      />
    )
  }

  return (
    <TypeGame
      lessonId={isWrongBook ? 'wrongbook' : lesson!.id}
      items={items}
      title={title}
      mode={playMode}
      backTo={isWrongBook ? '/wrongbook' : subject === 'english' ? '/english' : '/chinese'}
    />
  )
}

function TypeGame({
  lessonId,
  items,
  title,
  mode,
  backTo,
}: {
  lessonId: string
  items: LessonItem[]
  title: string
  mode: PlayMode
  backTo: string
}) {
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [typedChars, setTypedChars] = useState(0)
  const [correctChars, setCorrectChars] = useState(0)
  const [finished, setFinished] = useState(false)
  const [startedAt] = useState(() => Date.now())
  const advancing = useRef(false)
  const statsRef = useRef({ typed: 0, correct: 0, combo: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const item = items[index]
  const target = item ? normalizeAnswer(item, mode) : ''
  const match = compareInput(typed, target)
  const hideTarget = mode === 'recall'
  const useIme = item?.kind === 'write'
  const nextKey = target[typed.length] || ''
  const minutes = Math.max((Date.now() - startedAt) / 60000, 1 / 60)
  const wpm = Math.round(correctChars / 5 / minutes)

  useEffect(() => {
    inputRef.current?.focus()
  }, [index])

  useEffect(() => {
    if (!item) return
    speakItem(item)
    return () => stopSpeak()
  }, [item])

  function finishLesson() {
    setFinished(true)
    recordLesson(lessonId, {
      typed: statsRef.current.typed,
      correct: statsRef.current.correct,
      combo: statsRef.current.combo,
      finished: true,
    })
  }

  function jumpTo(nextIndex: number) {
    advancing.current = false
    setFinished(false)
    setIndex(nextIndex)
    setTyped('')
    setCombo(0)
  }

  function goPrev() {
    if (index === 0) return
    jumpTo(index - 1)
  }

  function goNextManual() {
    if (index + 1 >= items.length) {
      finishLesson()
      return
    }
    jumpTo(index + 1)
  }

  function goNext(ok: boolean) {
    if (advancing.current) return
    advancing.current = true
    const nextCombo = ok ? combo + 1 : 0
    setCombo(nextCombo)
    setBestCombo((v) => {
      const best = Math.max(v, nextCombo)
      statsRef.current.combo = best
      return best
    })
    window.setTimeout(() => {
      advancing.current = false
      if (index + 1 >= items.length) {
        finishLesson()
        return
      }
      setIndex((v) => v + 1)
      setTyped('')
    }, 160)
  }

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!useIme || finished) return
    const next = event.target.value
    setTyped(next)
    statsRef.current.typed += 1
    setTypedChars((v) => v + 1)
    if (next === target) {
      statsRef.current.correct += 1
      setCorrectChars((v) => v + 1)
      goNext(true)
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (finished || !item) return
    if (event.key === 'Tab') return
    if (useIme) {
      if (event.key === 'Enter' && match.done) {
        event.preventDefault()
        goNext(true)
      }
      return
    }
    event.preventDefault()
    if (event.key === 'Enter' && match.done) {
      goNext(true)
      return
    }
    const next = applyKey(typed, target, event.key, true)
    if (event.key.length === 1) {
      statsRef.current.typed += 1
      setTypedChars((v) => v + 1)
      if (target.startsWith(typed + event.key)) {
        statsRef.current.correct += 1
        setCorrectChars((v) => v + 1)
      } else {
        addWrong(item)
      }
    }
    setTyped(next)
    if (next === target) goNext(true)
  }

  return (
    <Container fluid="xl" className="play-page py-3 py-lg-4">
      <div className="play-toolbar">
        <Link className="btn btn-link px-0" to={backTo}>
          返回课表
        </Link>
        <h1 className="h4 display-font mb-0">{title}</h1>
        <div className="text-end">
          <Badge bg="primary" className="me-2">
            {index + 1}/{items.length}
          </Badge>
          <Badge bg="info" className="me-2" text="dark">
            {wpm} WPM
          </Badge>
          <Badge bg="warning" text="dark">
            连击 {combo}
          </Badge>
        </div>
      </div>

      {finished ? (
        <div className="arena-card p-4 p-lg-5 text-center">
          <h2 className="display-font">本课完成</h2>
          <p>
            正确率 {typedChars ? Math.round((correctChars / typedChars) * 100) : 100}% · 最高连击 {bestCombo} · {wpm} WPM
          </p>
          <div className="d-flex justify-content-center gap-2 flex-wrap">
            <button type="button" className="btn btn-outline-primary" onClick={() => jumpTo(0)}>
              再练一遍
            </button>
            <Link className="btn btn-primary" to="/progress">
              看进度
            </Link>
          </div>
        </div>
      ) : item ? (
        <div className="arena-card play-arena p-3 p-lg-5" onClick={() => inputRef.current?.focus()}>
          <div className="play-prompt">
            <p className="prompt-sub mb-2">{item.hint}</p>
            <div className="prompt-zh display-font mb-2">
              {hideTarget && item.kind === 'write' ? item.hint : item.prompt}
            </div>
            {item.phonetic && item.kind !== 'pinyin' ? <p className="text-primary mb-3">{item.phonetic}</p> : null}
            <SpeakerButton onClick={() => speakItem(item)} />
          </div>
          <div className="play-type">
            <TypedLine target={target} typed={typed} hideTarget={hideTarget} />
            {!useIme ? <KeyGuide nextKey={nextKey} /> : null}
            <input
              ref={inputRef}
              className="form-control form-control-lg mt-3 mx-auto play-input"
              value={typed}
              onChange={onChange}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-label="打字输入"
            />
            <div className="nav-row mt-4">
              <button type="button" className="btn btn-outline-primary btn-lg" onClick={goPrev} disabled={index === 0}>
                上一题
              </button>
              <button type="button" className="btn btn-primary btn-lg" onClick={goNextManual}>
                下一题
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Container>
  )
}

function FallGame({
  lessonId,
  items,
  title,
  letterMode,
  backTo,
}: {
  lessonId: string
  items: LessonItem[]
  title: string
  letterMode: boolean
  backTo: string
}) {
  const pool = useMemo(() => items.slice(0, 12), [items])
  const [falling, setFalling] = useState<FallItem[]>([])
  const [typed, setTyped] = useState('')
  const [score, setScore] = useState(0)
  const [miss, setMiss] = useState(0)
  const [combo, setCombo] = useState(0)
  const [over, setOver] = useState(false)
  const [current, setCurrent] = useState<LessonItem | null>(null)
  const idRef = useRef(0)
  const spokenRef = useRef<Set<number>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (over) return
    const spawn = window.setInterval(() => {
      setFalling((list) => {
        if (list.length >= (letterMode ? 7 : 5)) return list
        const item = pool[Math.floor(Math.random() * pool.length)]
        const answer = normalizeAnswer(item, 'follow')
        const letters = letterMode ? answer.replace(/\s+/g, '').split('') : [answer]
        const letter = letters[Math.floor(Math.random() * letters.length)] || answer[0] || ''
        if (!letter) return list
        idRef.current += 1
        return [
          ...list,
          {
            id: idRef.current,
            item,
            letter,
            remain: letter,
            x: 10 + Math.random() * 80,
            y: 0,
          },
        ]
      })
    }, letterMode ? 900 : 1400)
    const tick = window.setInterval(() => {
      setFalling((list) => {
        const next: FallItem[] = []
        let missed = 0
        for (const row of list) {
          const y = row.y + (letterMode ? 1.8 : 2.2)
          if (y >= 90) missed += 1
          else next.push({ ...row, y })
        }
        if (missed) {
          setMiss((v) => v + missed)
          setCombo(0)
        }
        return next
      })
    }, 80)
    return () => {
      window.clearInterval(spawn)
      window.clearInterval(tick)
    }
  }, [over, pool, letterMode])

  useEffect(() => {
    falling.forEach((row) => {
      if (spokenRef.current.has(row.id)) return
      spokenRef.current.add(row.id)
      setCurrent(row.item)
      if (letterMode) speakLetterWithWord(row.letter, row.item)
      else speakItem(row.item)
    })
  }, [falling, letterMode])

  useEffect(() => {
    if (miss >= 8 && !over) {
      setOver(true)
      stopSpeak()
      recordLesson(lessonId, {
        typed: score + miss,
        correct: score,
        combo,
        finished: score >= 8,
      })
    }
  }, [miss, over, lessonId, score, combo])

  function tryCatch(value: string) {
    const needle = value.toLowerCase()
    const hit = falling.find((row) => row.letter.toLowerCase() === needle || row.remain.toLowerCase() === needle)
    if (!hit) return false
    setFalling((list) => list.filter((row) => row.id !== hit.id))
    setScore((v) => v + 1)
    setCombo((v) => v + 1)
    setCurrent(hit.item)
    if (letterMode) speakLetterWithWord(hit.letter, hit.item)
    else speakItem(hit.item)
    return true
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (over) return
    if (event.key === 'Enter') {
      tryCatch(typed)
      setTyped('')
      event.preventDefault()
      return
    }
    if (event.key === 'Backspace') {
      setTyped((v) => v.slice(0, -1))
      event.preventDefault()
      return
    }
    if (event.key.length === 1) {
      const next = letterMode ? event.key : typed + event.key
      setTyped(letterMode ? event.key : next)
      if (tryCatch(next)) setTyped('')
      event.preventDefault()
    }
  }

  return (
    <Container fluid="xl" className="play-page py-3">
      <div className="play-toolbar">
        <Link className="btn btn-link px-0" to={backTo}>
          返回课表
        </Link>
        <h1 className="h4 display-font mb-0">
          {title} · {letterMode ? '字母落字' : '落字'}
        </h1>
        <div>
          <Badge bg="success" className="me-2">
            接住 {score}
          </Badge>
          <Badge bg="danger">漏掉 {miss}/8</Badge>
        </div>
      </div>
      <div className="fall-layout">
        <div className="fall-stage" onClick={() => inputRef.current?.focus()}>
          {falling.map((row) => (
            <div key={row.id} className="fall-item" style={{ left: `${row.x}%`, top: `${row.y}%` }}>
              <span className="fall-letter">{row.letter}</span>
            </div>
          ))}
          <div className="catcher" aria-hidden="true" />
          {over ? (
            <div className="position-absolute top-50 start-50 translate-middle text-white text-center">
              <h2 className="display-font">游戏结束</h2>
              <p>接住 {score} · 连击 {combo}</p>
            </div>
          ) : null}
        </div>
        <aside className="fall-aside arena-card p-3">
          <SpeakerButton
            onClick={() => {
              if (current) {
                if (letterMode && falling[0]) speakLetterWithWord(falling[0].letter, current)
                else speakItem(current)
              }
            }}
          />
          {current ? (
            <>
              <div className="prompt-zh display-font">{current.prompt}</div>
              <p className="text-primary mb-1">{current.phonetic || current.answer}</p>
              <p className="mb-0">{current.hint}</p>
            </>
          ) : (
            <p className="text-secondary mb-0">打落下的{letterMode ? '字母' : '字'}，同步听读音。</p>
          )}
        </aside>
      </div>
      <input
        ref={inputRef}
        className="form-control form-control-lg mt-3 play-input"
        value={typed}
        onChange={() => undefined}
        onKeyDown={onKeyDown}
        placeholder={letterMode ? '落下什么字母就打什么' : '看到字就打对应拼音或单词'}
        autoComplete="off"
        aria-label="落字输入"
      />
    </Container>
  )
}
