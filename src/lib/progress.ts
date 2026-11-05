import type { ProgressStore } from './types'

const KEY = 'xiaoxue-typing-progress-v1'

const empty: ProgressStore = {
  stars: 0,
  typedChars: 0,
  correctChars: 0,
  bestCombo: 0,
  lessons: {},
}

export function loadProgress(): ProgressStore {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...empty, lessons: {} }
    const parsed = JSON.parse(raw) as ProgressStore
    return {
      ...empty,
      ...parsed,
      lessons: parsed.lessons ?? {},
    }
  } catch {
    return { ...empty, lessons: {} }
  }
}

export function saveProgress(store: ProgressStore): void {
  localStorage.setItem(KEY, JSON.stringify(store))
}

export function recordLesson(
  lessonId: string,
  stats: { typed: number; correct: number; combo: number; finished: boolean },
): ProgressStore {
  const store = loadProgress()
  store.typedChars += stats.typed
  store.correctChars += stats.correct
  store.bestCombo = Math.max(store.bestCombo, stats.combo)
  const prev = store.lessons[lessonId] ?? { done: 0, bestCombo: 0 }
  if (stats.finished) {
    prev.done += 1
    store.stars += 1
  }
  prev.bestCombo = Math.max(prev.bestCombo, stats.combo)
  store.lessons[lessonId] = prev
  saveProgress(store)
  return store
}

export function accuracy(store: ProgressStore): number {
  if (store.typedChars === 0) return 100
  return Math.round((store.correctChars / store.typedChars) * 100)
}
