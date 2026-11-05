export type Subject = 'chinese' | 'english'
export type Kind = 'pinyin' | 'hanzi' | 'write' | 'word' | 'phonetic' | 'phrase' | 'grammar'
export type PlayMode = 'follow' | 'recall' | 'fall' | 'letters'

export type LessonItem = {
  id: string
  subject: Subject
  grade: number
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
  kind: Kind
  name: string
  blurb: string
  items: LessonItem[]
}

export type ProgressStore = {
  stars: number
  typedChars: number
  correctChars: number
  bestCombo: number
  lessons: Record<string, { done: number; bestCombo: number }>
}
