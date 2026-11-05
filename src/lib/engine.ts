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
      stop: () => void
    }
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

export function stopSpeak(): void {
  if (window.AndroidSpeak) {
    window.AndroidSpeak.stop()
    return
  }
  if (window.speechSynthesis) window.speechSynthesis.cancel()
}

function nativeSpeak(parts: SpeakPart[]): void {
  if (!window.AndroidSpeak) return
  window.AndroidSpeak.stop()
  let delay = 0
  parts.forEach((part) => {
    window.setTimeout(() => window.AndroidSpeak?.speak(part.text, part.lang), delay)
    delay += Math.max(700, part.text.length * 280)
  })
}

function webSpeak(parts: SpeakPart[]): void {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const play = (index: number) => {
    if (index >= parts.length) return
    const utter = new SpeechSynthesisUtterance(parts[index].text)
    utter.lang = parts[index].lang
    utter.rate = 0.88
    utter.onend = () => play(index + 1)
    window.speechSynthesis.speak(utter)
  }
  play(0)
}

export function speakParts(parts: SpeakPart[]): void {
  const clean = parts.filter((part) => part.text.trim().length > 0)
  if (clean.length === 0) return
  if (window.AndroidSpeak) {
    nativeSpeak(clean)
    return
  }
  webSpeak(clean)
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

export function speakItem(item: LessonItem): void {
  speakParts(voiceParts(item))
}

export function speakLetterWithWord(letter: string, item: LessonItem): void {
  const wordLang = item.subject === 'english' ? 'en-US' : 'zh-CN'
  const word = item.subject === 'english' ? item.answer : item.prompt
  const meaning = item.subject === 'english' ? item.prompt : item.phonetic || item.hint || ''
  speakParts([
    { text: letter.toUpperCase(), lang: /[a-z]/i.test(letter) ? 'en-US' : wordLang },
    { text: word, lang: wordLang },
    { text: meaning, lang: 'zh-CN' },
  ])
}
