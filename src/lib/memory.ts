import type { LessonItem } from './types'

export function todayKey(date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export type MemoryGrade = 'again' | 'hard' | 'good' | 'easy'

export type MemoryCard = {
  itemId: string
  item: LessonItem
  box: number
  ease: number
  interval: number
  due: number
  reps: number
  lapses: number
}

type MemoryStore = {
  cards: Record<string, MemoryCard>
  streak: number
  lastPlayDate?: string
  newToday?: number
  newDate?: string
  reviewsByDay?: Record<string, number>
}

export const NEW_PER_DAY = 10
export const REVIEW_PER_DAY = 20
const LEARN_MINUTES = 10
const GRADUATE_DAYS = 1
const EASY_DAYS = 4
const KEY = 'xiaoxue-typing-memory-v1'
const empty: MemoryStore = { cards: {}, streak: 0, reviewsByDay: {} }

function loadStore(): MemoryStore {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { cards: {}, streak: 0, reviewsByDay: {} }
    const parsed = JSON.parse(raw) as MemoryStore
    return {
      cards: parsed.cards ?? {},
      streak: parsed.streak ?? 0,
      lastPlayDate: parsed.lastPlayDate,
      newToday: parsed.newToday ?? 0,
      newDate: parsed.newDate,
      reviewsByDay: parsed.reviewsByDay ?? {},
    }
  } catch {
    return { ...empty, cards: {} }
  }
}

function saveStore(store: MemoryStore): void {
  localStorage.setItem(KEY, JSON.stringify(store))
}

function bumpStreak(store: MemoryStore): void {
  const today = todayKey()
  if (store.lastPlayDate === today) return
  const y = new Date()
  y.setDate(y.getDate() - 1)
  const yesterday = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`
  store.streak = store.lastPlayDate === yesterday ? store.streak + 1 : 1
  store.lastPlayDate = today
}

function startOfTomorrow(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 1)
  return d.getTime()
}

function daysFromNow(days: number): number {
  if (days <= 0) return Date.now()
  return startOfTomorrow() + (days - 1) * 86400000
}

function minutesFromNow(minutes: number): number {
  return Date.now() + minutes * 60 * 1000
}

function isLearning(card: MemoryCard): boolean {
  return card.interval < 1
}

function defaultCard(item: LessonItem): MemoryCard {
  return {
    itemId: item.id,
    item,
    box: 1,
    ease: 2.5,
    interval: 0,
    due: Date.now(),
    reps: 0,
    lapses: 0,
  }
}

function applyGrade(prev: MemoryCard, grade: MemoryGrade): MemoryCard {
  const card: MemoryCard = { ...prev, item: prev.item }
  if (grade === 'again') {
    card.box = 1
    card.interval = 0
    card.due = Date.now()
    card.lapses += 1
    card.reps = 0
    card.ease = Math.max(1.3, card.ease - 0.2)
    return card
  }
  if (grade === 'hard') {
    if (isLearning(card)) {
      card.due = minutesFromNow(LEARN_MINUTES)
      card.interval = 0
    } else {
      card.interval = Math.max(1, Math.round(Math.max(card.interval, 1) * 1.2))
      card.due = daysFromNow(card.interval)
      card.ease = Math.max(1.3, card.ease - 0.15)
    }
    card.reps += 1
    return card
  }
  if (grade === 'easy') {
    card.ease = Math.min(2.8, card.ease + 0.15)
    card.interval = isLearning(card)
      ? EASY_DAYS
      : Math.max(EASY_DAYS, Math.round(Math.max(card.interval, 1) * card.ease * 1.3))
    card.due = daysFromNow(card.interval)
    card.box = Math.min(5, Math.max(3, card.box + 2))
    card.reps += 1
    return card
  }
  if (isLearning(card)) {
    if (card.reps === 0) {
      card.due = minutesFromNow(LEARN_MINUTES)
      card.interval = 0
      card.reps = 1
      card.box = 1
    } else {
      card.interval = GRADUATE_DAYS
      card.due = daysFromNow(GRADUATE_DAYS)
      card.box = 2
      card.reps += 1
    }
    return card
  }
  card.interval = Math.max(1, Math.round(card.interval * card.ease))
  card.due = daysFromNow(card.interval)
  card.box = Math.min(5, card.box + 1)
  card.reps += 1
  return card
}

export function loadMemory(): MemoryStore {
  return loadStore()
}

export function dueCards(now = Date.now()): MemoryCard[] {
  return Object.values(loadStore().cards)
    .filter((card) => card.due <= now)
    .sort((a, b) => a.interval - b.interval || a.due - b.due)
}

export function dueItems(limit = REVIEW_PER_DAY): LessonItem[] {
  return dueCards()
    .slice(0, limit)
    .map((card) => card.item)
}

export function remainingNewToday(): number {
  const store = loadStore()
  if (store.newDate !== todayKey()) return NEW_PER_DAY
  return Math.max(0, NEW_PER_DAY - (store.newToday ?? 0))
}

export function studyQueue(items: LessonItem[], reviewLimit = REVIEW_PER_DAY, newLimit = NEW_PER_DAY): LessonItem[] {
  const store = loadStore()
  const now = Date.now()
  const due = items.filter((item) => {
    const card = store.cards[item.id]
    return Boolean(card && card.due <= now)
  })
  const unseen = items.filter((item) => !store.cards[item.id])
  const newLeft = Math.min(newLimit, remainingNewToday())
  return [...due.slice(0, reviewLimit), ...unseen.slice(0, newLeft)]
}

export function prioritize(items: LessonItem[], limit = REVIEW_PER_DAY): LessonItem[] {
  return studyQueue(items, limit, NEW_PER_DAY).slice(0, limit)
}

export function memoryStats(): { due: number; known: number; streak: number; newLeft: number } {
  const store = loadStore()
  const now = Date.now()
  const cards = Object.values(store.cards)
  return {
    due: cards.filter((card) => card.due <= now).length,
    known: cards.filter((card) => card.box >= 3 || card.interval >= 4).length,
    streak: store.streak,
    newLeft: remainingNewToday(),
  }
}

export function reviewHeatmap(days = 7): { date: string; label: string; count: number }[] {
  const store = loadStore()
  const out: { date: string; label: string; count: number }[] = []
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = todayKey(d)
    out.push({
      date: key,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      count: store.reviewsByDay?.[key] ?? 0,
    })
  }
  return out
}

export function nextIntervalLabel(item: LessonItem, grade: MemoryGrade): string {
  const store = loadStore()
  const next = applyGrade(store.cards[item.id] ?? defaultCard(item), grade)
  const delta = next.due - Date.now()
  if (delta < 90 * 1000) return '现在'
  if (delta < 50 * 60 * 1000) return `${Math.max(1, Math.round(delta / 60000))}分钟`
  if (next.interval <= 1 && delta < 36 * 3600 * 1000) return '1天'
  if (next.interval < 1) return `${Math.max(1, Math.round(delta / 60000))}分钟`
  return `${next.interval}天`
}

export function flashItems(items: LessonItem[]): LessonItem[] {
  const out: LessonItem[] = []
  for (const item of items) {
    if (item.id.endsWith('__fwd')) {
      out.push(item)
      continue
    }
    if (item.subject === 'english' && (item.kind === 'word' || item.kind === 'phrase')) {
      out.push(item)
      out.push({
        ...item,
        id: `${item.id}__fwd`,
        prompt: item.answer,
        answer: item.prompt,
        hint: item.phonetic || item.hint,
      })
    } else {
      out.push(item)
    }
  }
  return out
}

export function isForwardCard(item: LessonItem): boolean {
  return item.id.endsWith('__fwd')
}

export function recordMemory(item: LessonItem, grade: MemoryGrade): MemoryCard {
  const store = loadStore()
  bumpStreak(store)
  const isNew = !store.cards[item.id]
  const prev = store.cards[item.id] ?? defaultCard(item)
  const card = applyGrade({ ...prev, item }, grade)
  store.cards[item.id] = card
  if (isNew) {
    const today = todayKey()
    if (store.newDate !== today) {
      store.newDate = today
      store.newToday = 0
    }
    store.newToday = (store.newToday ?? 0) + 1
  }
  const day = todayKey()
  store.reviewsByDay = store.reviewsByDay ?? {}
  store.reviewsByDay[day] = (store.reviewsByDay[day] ?? 0) + 1
  saveStore(store)
  return card
}
