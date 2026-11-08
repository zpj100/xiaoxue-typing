export type Subject = 'chinese' | 'english'
export type Kind = 'pinyin' | 'hanzi' | 'write' | 'word' | 'phonetic' | 'phrase' | 'grammar'
export type PlayMode = 'follow' | 'recall' | 'flash' | 'fall' | 'letters'
export type Term = 1 | 2

export type LessonItem = {
  id: string
  subject: Subject
  grade: number
  term?: Term
  unit?: string
  kind: Kind
  title: string
  prompt: string
  answer: string
  phonetic?: string
  hint?: string
  strokes?: string
}

export type Lesson = {
  id: string
  subject: Subject
  grade: number
  term: Term
  kind: Kind
  unit: string
  name: string
  blurb: string
  items: LessonItem[]
}

export type ProgressStore = {
  stars: number
  typedChars: number
  correctChars: number
  bestCombo: number
  lastLessonId?: string
  lastMode?: PlayMode
  dailyDate?: string
  dailyStars?: number
  lessons: Record<string, { done: number; bestCombo: number }>
}
