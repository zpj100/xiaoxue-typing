import type { LessonItem } from './types'

export function todayKey(date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export type MemoryGrade = 'again' | 'hard' | 'good'

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
}

const KEY = 'xiaoxue-typing-memory-v1'
const BOX_DAYS = [0, 0, 1, 2, 4, 7]

const empty: MemoryStore = { cards: {}, streak: 0 }

function loadStore(): MemoryStore {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { cards: {}, streak: 0 }
    const parsed = JSON.parse(raw) as MemoryStore
    return { cards: parsed.cards ?? {}, streak: parsed.streak ?? 0, lastPlayDate: parsed.lastPlayDate }
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

export function loadMemory(): MemoryStore {
  return loadStore()
}

export function dueCards(now = Date.now()): MemoryCard[] {
  return Object.values(loadStore().cards)
    .filter((card) => card.due <= now)
    .sort((a, b) => a.box - b.box || a.due - b.due)
}

export function dueItems(limit = 20): LessonItem[] {
  return dueCards()
    .slice(0, limit)
    .map((card) => card.item)
}

export function prioritize(items: LessonItem[], limit = 20): LessonItem[] {
  const dueIds = new Set(dueCards().map((card) => card.itemId))
  const due = items.filter((item) => dueIds.has(item.id))
  const rest = items.filter((item) => !dueIds.has(item.id))
  return [...due, ...rest].slice(0, limit)
}

export function memoryStats(): { due: number; known: number; streak: number } {
  const store = loadStore()
  const now = Date.now()
  const cards = Object.values(store.cards)
  return {
    due: cards.filter((card) => card.due <= now).length,
    known: cards.filter((card) => card.box >= 3).length,
    streak: store.streak,
  }
}

export function recordMemory(item: LessonItem, grade: MemoryGrade): MemoryCard {
  const store = loadStore()
  bumpStreak(store)
  const prev = store.cards[item.id] ?? {
    itemId: item.id,
    item,
    box: 1,
    ease: 2.5,
    interval: 0,
    due: Date.now(),
    reps: 0,
    lapses: 0,
  }
  const card: MemoryCard = { ...prev, item }
  if (grade === 'again') {
    card.box = 1
    card.interval = 0
    card.due = Date.now()
    card.lapses += 1
    card.ease = Math.max(1.3, card.ease - 0.2)
  } else if (grade === 'hard') {
    card.box = Math.max(1, Math.min(card.box, 3))
    card.interval = Math.max(1, Math.round(Math.max(card.interval, 1) * 1.2))
    card.due = daysFromNow(card.interval)
    card.ease = Math.max(1.3, card.ease - 0.15)
    card.reps += 1
  } else {
    card.box = Math.min(5, card.box + 1)
    card.interval = BOX_DAYS[card.box] || 7
    card.due = daysFromNow(card.interval)
    card.ease = Math.min(2.8, card.ease + 0.05)
    card.reps += 1
  }
  store.cards[item.id] = card
  saveStore(store)
  return card
}
