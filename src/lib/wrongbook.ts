import type { LessonItem } from './types'

const KEY = 'xiaoxue-typing-wrongbook-v1'

export type WrongEntry = {
  item: LessonItem
  count: number
  lastAt: number
}

export function loadWrongBook(): WrongEntry[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as WrongEntry[]
    return Array.isArray(parsed) ? parsed.filter((row) => row?.item?.id) : []
  } catch {
    return []
  }
}

function saveWrongBook(list: WrongEntry[]): void {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function addWrong(item: LessonItem): void {
  const list = loadWrongBook()
  const found = list.find((row) => row.item.id === item.id)
  if (found) {
    found.count += 1
    found.lastAt = Date.now()
    found.item = item
  } else {
    list.unshift({ item, count: 1, lastAt: Date.now() })
  }
  saveWrongBook(list.slice(0, 80))
}

export function removeWrong(id: string): void {
  saveWrongBook(loadWrongBook().filter((row) => row.item.id !== id))
}

export function clearWrongBook(): void {
  saveWrongBook([])
}

export function wrongItems(): LessonItem[] {
  return loadWrongBook().map((row) => row.item)
}
