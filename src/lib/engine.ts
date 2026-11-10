import type { LessonItem, PlayMode } from './types'

export type MatchState = {
  typed: string
  okLen: number
  wrong: boolean
  done: boolean
}

type SpeakPart = { text: string; lang: string }

declare global {
  interface Window {
    AndroidSpeak?: {
      speak: (text: string, lang: string) => void
      speakAndNotify?: (text: string, lang: string) => void
      stop: () => void
    }
    __xiaoxueSpeakDone?: () => void
  }
}

export function normalizeAnswer(item: LessonItem, _mode: PlayMode): string {
  const raw = item.answer
  if (item.kind === 'write') return raw
  if (item.kind === 'pinyin' || item.kind === 'hanzi' || item.kind === 'phonetic' || item.kind === 'word') {
    return raw.replace(/ü/g, 'v')
  }
  return raw
}

export function compareInput(typed: string, target: string): MatchState {
  let okLen = 0
  while (okLen < typed.length && okLen < target.length && typed[okLen] === target[okLen]) {
    okLen += 1
  }
  return {
    typed,
    okLen,
    wrong: typed.length > okLen,
    done: typed === target,
  }
}

export function applyKey(typed: string, target: string, key: string, replayWrong: boolean): string {
  if (key === 'Backspace') return typed.slice(0, -1)
  if (key.length !== 1) return typed
  const next = typed + key
  if (replayWrong && next !== target.slice(0, next.length)) return ''
  return next
}

let speakToken = 0
const speakWaiters: Array<() => void> = []

function flushSpeakWaiters(): void {
  const waiters = speakWaiters.splice(0)
  waiters.forEach((waiter) => waiter())
}

if (typeof window !== 'undefined') {
  window.__xiaoxueSpeakDone = () => {
    const waiter = speakWaiters.shift()
    waiter?.()
  }
}

export function stopSpeak(): void {
  speakToken += 1
  if (window.AndroidSpeak) window.AndroidSpeak.stop()
  else if (window.speechSynthesis) window.speechSynthesis.cancel()
  flushSpeakWaiters()
}

function waitNativeDone(): Promise<void> {
  return new Promise((resolve) => {
    const finish = () => {
      window.clearTimeout(timer)
      const index = speakWaiters.indexOf(finish)
      if (index >= 0) speakWaiters.splice(index, 1)
      resolve()
    }
    const timer = window.setTimeout(finish, 8000)
    speakWaiters.push(finish)
  })
}

async function nativeSpeak(parts: SpeakPart[], onDone?: () => void): Promise<void> {
  if (!window.AndroidSpeak) {
    onDone?.()
    return
  }
  const mine = speakToken
  for (const part of parts) {
    if (speakToken !== mine) {
      onDone?.()
      return
    }
    if (window.AndroidSpeak.speakAndNotify) {
      window.AndroidSpeak.speakAndNotify(part.text, part.lang)
      await waitNativeDone()
    } else {
      window.AndroidSpeak.speak(part.text, part.lang)
      await new Promise((resolve) => window.setTimeout(resolve, Math.max(700, part.text.length * 280)))
    }
  }
  onDone?.()
}

function webSpeak(parts: SpeakPart[], onDone?: () => void): void {
  if (!window.speechSynthesis) {
    onDone?.()
    return
  }
  const mine = speakToken
  window.speechSynthesis.cancel()
  const play = (index: number) => {
    if (speakToken !== mine) return
    if (index >= parts.length) {
      onDone?.()
      return
    }
    const utter = new SpeechSynthesisUtterance(parts[index].text)
    utter.lang = parts[index].lang
    utter.rate = 0.88
    utter.onend = () => play(index + 1)
    utter.onerror = () => play(index + 1)
    window.speechSynthesis.speak(utter)
  }
  play(0)
}

export function speakParts(parts: SpeakPart[], onDone?: () => void): void {
  const clean = parts.filter((part) => part.text.trim().length > 0)
  speakToken += 1
  const mine = speakToken
  if (clean.length === 0) {
    onDone?.()
    return
  }
  const finish = () => {
    if (speakToken === mine) onDone?.()
  }
  if (window.AndroidSpeak) {
    void nativeSpeak(clean, finish)
    return
  }
  webSpeak(clean, finish)
}

export function speak(text: string, lang = 'zh-CN'): void {
  speakParts([{ text, lang }])
}

export function speakLetter(letter: string, lang = 'en-US'): void {
  const ch = letter.trim()
  if (!ch) return
  if (/[a-z]/i.test(ch)) {
    speakParts([{ text: ch.toUpperCase(), lang: 'en-US' }])
    return
  }
  speakParts([{ text: ch, lang }])
}

export function voiceParts(item: LessonItem): SpeakPart[] {
  if (item.subject === 'english') {
    const zh = item.hint || item.prompt
    return [
      { text: item.answer, lang: 'en-US' },
      { text: zh, lang: 'zh-CN' },
    ]
  }
  if (item.kind === 'pinyin') {
    return [
      { text: item.prompt, lang: 'zh-CN' },
      { text: item.phonetic || item.answer, lang: 'zh-CN' },
    ]
  }
  return [
    { text: item.prompt, lang: 'zh-CN' },
    { text: item.phonetic || item.answer, lang: 'zh-CN' },
    { text: item.hint || '', lang: 'zh-CN' },
  ]
}

export function speakListen(item: LessonItem, onDone?: () => void): void {
  if (item.subject === 'english') {
    speakParts([{ text: item.answer, lang: 'en-US' }], onDone)
    return
  }
  speakParts([{ text: item.phonetic || item.prompt || item.answer, lang: 'zh-CN' }], onDone)
}

export function speakItem(item: LessonItem, onDone?: () => void): void {
  speakParts(voiceParts(item), onDone)
}

export function speakLetterWithWord(letter: string, item: LessonItem, onDone?: () => void): void {
  const wordLang = item.subject === 'english' ? 'en-US' : 'zh-CN'
  const word = item.subject === 'english' ? item.answer : item.prompt
  const meaning = item.subject === 'english' ? item.prompt : item.phonetic || item.hint || ''
  speakParts(
    [
      { text: letter.toUpperCase(), lang: /[a-z]/i.test(letter) ? 'en-US' : wordLang },
      { text: word, lang: wordLang },
      { text: meaning, lang: 'zh-CN' },
    ],
    onDone,
  )
}
