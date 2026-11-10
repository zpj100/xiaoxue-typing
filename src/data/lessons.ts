import { dueItems, todayKey } from '../lib/memory'
import type { Kind, Lesson, LessonItem, PlayMode, Subject, Term } from '../lib/types'
import { chineseHanzi, chinesePinyin, chineseWrite } from './chinese'
import { englishGrammar, englishPhonetics, englishPhrases, englishWords } from './english'

export const KIND_NAME: Record<Kind, string> = {
  pinyin: '拼音',
  hanzi: '识字',
  write: '写字',
  word: '单词',
  phonetic: '音标',
  phrase: '短语',
  grammar: '语法',
}

export const TERM_NAME: Record<Term, string> = {
  1: '上册',
  2: '下册',
}

function chunk<T>(list: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size))
  return out
}

function itemTerm(item: LessonItem): Term {
  return item.term === 2 ? 2 : 1
}

function pinyinUnit(item: LessonItem): string {
  if (item.unit) return item.unit
  const hint = item.hint || ''
  if (hint === '一声') return '单韵母'
  if (hint === '韵母') return '复韵母'
  if (hint.includes('鼻韵')) return '鼻韵母'
  if (hint === '声母') return '声母'
  if (hint === '整体认读') return '整体认读'
  return '拼读'
}

function defaultUnit(fallback: string) {
  return (item: LessonItem) => item.unit || item.title || fallback
}

function makeLessons(
  items: LessonItem[],
  kind: Kind,
  subject: Subject,
  blurb: string,
  unitOf: (item: LessonItem) => string,
  size: number,
): Lesson[] {
  const lessons: Lesson[] = []
  const byKey = new Map<string, LessonItem[]>()
  for (const item of items) {
    const grade = item.grade
    const term = itemTerm(item)
    const unit = unitOf(item)
    const key = `${grade}-${term}-${unit}`
    const bucket = byKey.get(key) ?? []
    bucket.push(item)
    byKey.set(key, bucket)
  }
  for (const [key, unitItems] of [...byKey.entries()].sort()) {
    if (!unitItems.length) continue
    const [gradeText, termText, ...unitParts] = key.split('-')
    const grade = Number(gradeText)
    const term = Number(termText) as Term
    const unit = unitParts.join('-')
    const groups = chunk(unitItems, size)
    groups.forEach((group, index) => {
      const part = groups.length > 1 ? ` ${index + 1}` : ''
      lessons.push({
        id: `${subject}-${kind}-${grade}-${term}-${unit}-${index + 1}`,
        subject,
        grade,
        term,
        kind,
        unit,
        name: `${grade}年级${TERM_NAME[term]} · ${unit}${part}`,
        blurb,
        items: group,
      })
    })
  }
  return lessons
}

export const lessons: Lesson[] = [
  ...makeLessons(chinesePinyin, 'pinyin', 'chinese', '按声母、韵母、整体认读和拼读分课，照着打或默打。', pinyinUnit, 10),
  ...makeLessons(chineseHanzi, 'hanzi', 'chinese', '按年级上下册识字，看汉字打拼音。', defaultUnit('识字'), 10),
  ...makeLessons(chineseWrite, 'write', 'chinese', '按年级上下册写字，看提示打出汉字。', defaultUnit('写字'), 8),
  ...makeLessons(englishWords, 'word', 'english', '人教版 PEP 小学词表，按年级上下册单元分课。', defaultUnit('单词'), 10),
  ...makeLessons(englishPhonetics, 'phonetic', 'english', '先学 48 个国际音标，再按年级看音标打单词。', defaultUnit('音标'), 8),
  ...makeLessons(englishPhrases, 'phrase', 'english', '课标常用短句，按年级上下册整句跟打。', defaultUnit('短语'), 6),
  ...makeLessons(englishGrammar, 'grammar', 'english', '按年级语法点填空，be 动词到过去时。', defaultUnit('语法'), 6),
]

export const BANK_STATS = {
  englishWords: englishWords.length,
  englishPhrases: englishPhrases.length,
  englishPhonetics: englishPhonetics.length,
  chineseHanzi: chineseHanzi.length,
  chineseWrite: chineseWrite.length,
  chinesePinyin: chinesePinyin.length,
}

export function getLesson(id: string): Lesson | undefined {
  if (id === 'daily' || id.startsWith('daily-')) return dailyLesson()
  if (id === 'review') return reviewLesson()
  return lessons.find((lesson) => lesson.id === id)
}

export function lessonsBySubject(subject: Subject): Lesson[] {
  return lessons.filter((lesson) => lesson.subject === subject)
}

export function lessonsByKind(kind: Kind): Lesson[] {
  return lessons.filter((lesson) => lesson.kind === kind)
}

export function nextLesson(id: string): Lesson | undefined {
  const index = lessons.findIndex((lesson) => lesson.id === id)
  if (index < 0) return undefined
  return lessons[index + 1]
}

function hashDay(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  return hash
}

let cachedDaily: Lesson | null = null

export function dailyLesson(): Lesson {
  const day = todayKey()
  if (cachedDaily?.id === `daily-${day}`) return cachedDaily
  const pool = lessons
    .filter((lesson) => lesson.kind === 'word' || lesson.kind === 'pinyin' || lesson.kind === 'hanzi' || lesson.kind === 'phrase' || lesson.kind === 'phonetic')
    .flatMap((lesson) => lesson.items)
  const picked: LessonItem[] = []
  const used = new Set<string>()
  let seed = hashDay(day)
  while (picked.length < 10 && used.size < pool.length) {
    seed = (seed * 1664525 + 1013904223) >>> 0
    const item = pool[seed % pool.length]
    if (!item || used.has(item.id)) continue
    used.add(item.id)
    picked.push(item)
  }
  cachedDaily = {
    id: `daily-${day}`,
    subject: 'chinese',
    grade: 0,
    term: 1,
    kind: 'word',
    unit: '每日挑战',
    name: `今日挑战 ${day.slice(5)}`,
    blurb: '每天 10 题，打完给星星。题库按日期固定。',
    items: picked,
  }
  return cachedDaily
}

export function reviewLesson(): Lesson {
  const items = dueItems(20)
  return {
    id: 'review',
    subject: items[0]?.subject ?? 'chinese',
    grade: 0,
    term: 1,
    kind: 'hanzi',
    unit: '今日复习',
    name: `今日复习 ${items.length} 张`,
    blurb: '到期卡片优先。会了拉长间隔，忘了当天再出。',
    items,
  }
}

export function resumePath(lessonId?: string, mode?: PlayMode): string | null {
  if (!lessonId || !mode) return null
  return `/play/${lessonId}/${mode}`
}
