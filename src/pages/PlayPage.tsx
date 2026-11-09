import { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Badge, Container, Form } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import SpeakerButton from '../components/SpeakerButton'
import TypedLine from '../components/TypedLine'
import KeyGuide from '../components/KeyGuide'
import { getLesson, nextLesson } from '../data/lessons'
import {
  compareInput,
  normalizeAnswer,
  speakItem,
  speakLetterWithWord,
  stopSpeak,
} from '../lib/engine'
import { prioritize, recordMemory, type MemoryGrade } from '../lib/memory'
import { recordLesson, rememberPlay } from '../lib/progress'
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

const SPEED_STEPS = [
  { label: '最慢', base: 0.28 },
  { label: '慢', base: 0.7 },
  { label: '中', base: 1.4 },
  { label: '快', base: 2.2 },
  { label: '极快', base: 3.2 },
]

export default function PlayPage() {
  const { lessonId = '', mode = 'follow' } = useParams()
  const playMode = (mode as PlayMode) || 'follow'
  const isWrongBook = lessonId === 'wrongbook'
  const lesson = isWrongBook ? undefined : getLesson(lessonId)
  const items = isWrongBook ? wrongItems() : lesson?.items ?? []
  const title = isWrongBook ? '错词本' : lesson?.name ?? ''
  const subject = isWrongBook ? items[0]?.subject : lesson?.subject
  const persistId = lesson?.id || lessonId

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

  if (lessonId === 'review' && items.length === 0) {
    return (
      <Container className="py-5">
        <Alert variant="success">今天没有到期卡片。先去闪卡学新词，会了的会按间隔再出来。</Alert>
        <Link className="btn btn-primary" to="/chinese">
          去语文课表
        </Link>
      </Container>
    )
  }

  if (playMode === 'flash') {
    return (
      <FlashGame
        lessonId={persistId}
        items={items}
        title={title}
        backTo={isWrongBook ? '/wrongbook' : subject === 'english' ? '/english' : '/chinese'}
      />
    )
  }

  if (playMode === 'fall' || playMode === 'letters') {
    return (
      <FallGame
        lessonId={persistId}
        items={items}
        title={title}
        letterMode={playMode === 'letters'}
        backTo={isWrongBook ? '/wrongbook' : subject === 'english' ? '/english' : '/chinese'}
      />
    )
  }

  return (
    <TypeGame
      lessonId={persistId}
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
  const [startedAt, setStartedAt] = useState(() => Date.now())
  const advancing = useRef(false)
  const statsRef = useRef({ typed: 0, correct: 0, combo: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const sequel = nextLesson(lessonId)
  const item = items[index]
  const target = item ? normalizeAnswer(item, mode) : ''
  const match = compareInput(typed, target)
  const hideTarget = mode === 'recall'
  const useIme = item?.kind === 'write'
  const nextKey = target[typed.length] || ''
  const minutes = Math.max((Date.now() - startedAt) / 60000, 1 / 60)
  const wpm = Math.round(correctChars / 5 / minutes)

  useEffect(() => {
    rememberPlay(lessonId, mode)
  }, [lessonId, mode])

  useEffect(() => {
    inputRef.current?.focus()
  }, [index])

  useEffect(() => {
    if (!item) return
    speakItem(item)
    return () => stopSpeak()
  }, [item])

  function finishLesson() {
    const typedCount = statsRef.current.typed
    const correctCount = statsRef.current.correct
    const acc = typedCount ? correctCount / typedCount : 1
    const stars = acc >= 0.95 && statsRef.current.combo >= 8 ? 3 : acc >= 0.8 ? 2 : 1
    setFinished(true)
    recordLesson(lessonId, {
      typed: typedCount,
      correct: correctCount,
      combo: statsRef.current.combo,
      finished: true,
      stars,
    })
  }

  function jumpTo(nextIndex: number) {
    advancing.current = false
    setFinished(false)
    setIndex(nextIndex)
    setTyped('')
    setCombo(0)
    if (nextIndex === 0) setStartedAt(Date.now())
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

  function applyTyped(nextRaw: string) {
    if (finished || !item) return
    const next = useIme ? nextRaw : nextRaw.replace(/ü/g, 'v')
    if (!useIme && next.length > typed.length) {
      const added = next.slice(typed.length)
      statsRef.current.typed += added.length
      setTypedChars((v) => v + added.length)
      if (target.startsWith(next)) {
        statsRef.current.correct += added.length
        setCorrectChars((v) => v + added.length)
      } else {
        addWrong(item)
      }
    }
    if (useIme && next !== typed) {
      statsRef.current.typed += 1
      setTypedChars((v) => v + 1)
    }
      if (!useIme && next !== target.slice(0, next.length) && next.length > 0) {
        recordMemory(item, 'again')
        setTyped('')
        return
      }
      setTyped(next)
      if (next === target) {
        if (useIme) {
          statsRef.current.correct += 1
          setCorrectChars((v) => v + 1)
        }
        recordMemory(item, 'good')
        goNext(true)
      }
  }

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    applyTyped(event.target.value)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (finished || !item) return
    if (event.key === 'Enter' && match.done) {
      event.preventDefault()
      goNext(true)
    }
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
            {sequel ? (
              <Link className="btn btn-primary" to={`/play/${sequel.id}/${mode}`}>
                下一课 {sequel.unit}
              </Link>
            ) : (
              <Link className="btn btn-primary" to="/progress">
                看进度
              </Link>
            )}
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
              enterKeyHint="done"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
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

function FlashGame({
  lessonId,
  items,
  title,
  backTo,
}: {
  lessonId: string
  items: LessonItem[]
  title: string
  backTo: string
}) {
  const deck = useMemo(() => prioritize(items, 20), [items])
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [known, setKnown] = useState(0)
  const [unknown, setUnknown] = useState(0)
  const [finished, setFinished] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const locking = useRef(false)
  const item = deck[index]
  const target = item ? normalizeAnswer(item, 'recall') : ''
  const match = compareInput(typed, target)
  const useIme = item?.kind === 'write'

  useEffect(() => {
    rememberPlay(lessonId, 'flash')
  }, [lessonId])

  useEffect(() => {
    inputRef.current?.focus()
  }, [index])

  useEffect(() => {
    if (!item || finished) return
    speakItem(item)
    return () => stopSpeak()
  }, [item, finished])

  function mark(grade: MemoryGrade) {
    if (!item || finished || locking.current) return
    locking.current = true
    recordMemory(item, grade)
    const ok = grade === 'good'
    const nextKnown = known + (ok ? 1 : 0)
    const nextUnknown = unknown + (ok ? 0 : 1)
    setKnown(nextKnown)
    setUnknown(nextUnknown)
    if (!ok) addWrong(item)
    if (index + 1 >= deck.length) {
      setFinished(true)
      recordLesson(lessonId, {
        typed: deck.length,
        correct: nextKnown,
        combo: nextKnown,
        finished: true,
        stars: nextUnknown === 0 ? 3 : 1,
      })
      return
    }
    setIndex((v) => v + 1)
    setTyped('')
    setRevealed(false)
    locking.current = false
  }

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (finished || revealed || !item) return
    const next = useIme ? event.target.value : event.target.value.replace(/ü/g, 'v')
    setTyped(next)
    if (next === target) {
      setRevealed(true)
      mark('good')
    }
  }

  function restart() {
    locking.current = false
    setIndex(0)
    setTyped('')
    setRevealed(false)
    setKnown(0)
    setUnknown(0)
    setFinished(false)
  }

  return (
    <Container fluid="xl" className="play-page py-3 py-lg-4">
      <div className="play-toolbar">
        <Link className="btn btn-link px-0" to={backTo}>
          返回课表
        </Link>
        <h1 className="h4 display-font mb-0">{title} · 闪卡</h1>
        <div>
          <Badge bg="success" className="me-2">
            会 {known}
          </Badge>
          <Badge bg="danger">生 {unknown}</Badge>
        </div>
      </div>
      {finished ? (
        <div className="arena-card p-4 p-lg-5 text-center">
          <h2 className="display-font">本轮闪卡完成</h2>
          <p>
            会 {known} · 生 {unknown} · 共 {deck.length} 张
          </p>
          <p className="text-secondary">会了的明天或更后才再出，忘了的今天还会排进来。</p>
          <button type="button" className="btn btn-primary" onClick={restart}>
            再记一轮
          </button>
        </div>
      ) : item ? (
        <div className="arena-card flash-card p-4 p-lg-5 text-center" onClick={() => inputRef.current?.focus()}>
          <p className="text-secondary mb-2">
            {index + 1}/{deck.length} · 先默打，对了自动过；想不起来再翻面
          </p>
          <div className="prompt-zh display-font mb-2">{item.prompt}</div>
          {revealed ? (
            <>
              <p className="fs-3 fw-bold text-success mb-1">{item.answer}</p>
              {item.phonetic ? <p className="text-primary fs-5">{item.phonetic}</p> : null}
              <p className="mb-3">{item.hint}</p>
            </>
          ) : (
            <TypedLine target={target} typed={typed} hideTarget />
          )}
          <SpeakerButton onClick={() => speakItem(item)} />
          <input
            ref={inputRef}
            className="form-control form-control-lg mt-3 mx-auto play-input"
            value={typed}
            onChange={onChange}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && match.done) {
                event.preventDefault()
                setRevealed(true)
                mark('good')
              }
            }}
            placeholder="打出拼音或单词"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="done"
            aria-label="闪卡默打"
          />
          <div className="nav-row mt-4">
            <button
              type="button"
              className="btn btn-outline-primary btn-lg"
              onClick={() => {
                setRevealed(true)
                speakItem(item)
              }}
            >
              翻面
            </button>
            <button type="button" className="btn btn-outline-danger btn-lg" onClick={() => mark('again')}>
              再记
            </button>
            <button type="button" className="btn btn-outline-warning btn-lg" onClick={() => mark('hard')}>
              犹豫
            </button>
            <button type="button" className="btn btn-success btn-lg" onClick={() => mark('good')}>
              会了
            </button>
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
  const [round, setRound] = useState(0)
  const [speedStep, setSpeedStep] = useState(2)
  const idRef = useRef(0)
  const spokenRef = useRef<Set<number>>(new Set())
  const speakQueueRef = useRef<{ item: LessonItem; letter: string }[]>([])
  const speakingRef = useRef(false)
  const letterModeRef = useRef(letterMode)
  const inputRef = useRef<HTMLInputElement>(null)
  const speedRef = useRef(SPEED_STEPS[2].base)
  const lives = 8
  letterModeRef.current = letterMode
  speedRef.current = SPEED_STEPS[speedStep].base + Math.min(score, 24) * 0.02

  useEffect(() => {
    rememberPlay(lessonId, letterMode ? 'letters' : 'fall')
  }, [lessonId, letterMode])

  useEffect(() => {
    inputRef.current?.focus()
  }, [round])

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
          const y = row.y + speedRef.current
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
  }, [over, pool, letterMode, round])

  function pumpSpeak() {
    if (speakingRef.current) return
    const next = speakQueueRef.current.shift()
    if (!next) return
    speakingRef.current = true
    setCurrent(next.item)
    const done = () => {
      speakingRef.current = false
      pumpSpeak()
    }
    if (letterModeRef.current) speakLetterWithWord(next.letter, next.item, done)
    else speakItem(next.item, done)
  }

  useEffect(() => {
    falling.forEach((row) => {
      if (spokenRef.current.has(row.id)) return
      spokenRef.current.add(row.id)
      speakQueueRef.current.push({ item: row.item, letter: row.letter })
    })
    pumpSpeak()
  }, [falling])

  useEffect(() => {
    if (miss >= 8 && !over) {
      setOver(true)
      speakQueueRef.current = []
      speakingRef.current = false
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
    return true
  }

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (over) return
    const next = event.target.value
    if (letterMode) {
      const ch = next.slice(-1)
      setTyped(ch)
      if (ch && tryCatch(ch)) setTyped('')
      return
    }
    setTyped(next)
    if (tryCatch(next)) setTyped('')
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (over) return
    if (event.key === 'Enter') {
      tryCatch(typed)
      setTyped('')
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
          <Badge bg="warning" text="dark" className="me-2">
            连击 {combo}
          </Badge>
          <Badge bg="danger">生命 {Math.max(lives - miss, 0)}</Badge>
        </div>
      </div>
      <div className="speed-bar arena-card px-3 py-2 mb-3">
        <Form.Label className="mb-1 fw-semibold">下落速度：{SPEED_STEPS[speedStep].label}</Form.Label>
        <Form.Range
          min={0}
          max={SPEED_STEPS.length - 1}
          step={1}
          value={speedStep}
          onChange={(event) => setSpeedStep(Number(event.target.value))}
        />
        <div className="d-flex justify-content-between small text-secondary">
          {SPEED_STEPS.map((step) => (
            <span key={step.label}>{step.label}</span>
          ))}
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
            <div className="position-absolute top-50 start-50 translate-middle text-white text-center px-3">
              <h2 className="display-font">游戏结束</h2>
              <p>接住 {score} · 连击 {combo}</p>
              <button
                type="button"
                className="btn btn-warning"
                onClick={() => {
                  setFalling([])
                  setTyped('')
                  setScore(0)
                  setMiss(0)
                  setCombo(0)
                  setOver(false)
                  setCurrent(null)
                  spokenRef.current = new Set()
                  speakQueueRef.current = []
                  speakingRef.current = false
                  setRound((v) => v + 1)
                }}
              >
                再来一局
              </button>
            </div>
          ) : null}
        </div>
        <aside className="fall-aside arena-card p-3">
          <SpeakerButton
            onClick={() => {
              if (!current) return
              speakingRef.current = true
              const done = () => {
                speakingRef.current = false
                pumpSpeak()
              }
              if (letterMode && falling[0]) speakLetterWithWord(falling[0].letter, current, done)
              else speakItem(current, done)
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
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={letterMode ? '落下什么字母就打什么' : '看到字就打对应拼音或单词'}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="done"
        aria-label="落字输入"
      />
    </Container>
  )
}
