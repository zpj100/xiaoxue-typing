import type { Kind, Lesson, LessonItem, Subject } from '../lib/types'
import { chineseHanzi, chinesePinyin, chineseWrite } from './chinese'
import { englishGrammar, englishPhonetics, englishPhrases, englishWords } from './english'

const KIND_NAME: Record<Kind, string> = {
  pinyin: '拼音',
  hanzi: '识字',
  write: '写字',
  word: '单词',
  phonetic: '音标',
  phrase: '短语',
  grammar: '语法',
}

function chunk<T>(list: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size))
  return out
}

function makeLessons(items: LessonItem[], kind: Kind, subject: Subject, blurb: string): Lesson[] {
  const byGrade = new Map<number, LessonItem[]>()
  for (const item of items) {
    const bucket = byGrade.get(item.grade) ?? []
    bucket.push(item)
    byGrade.set(item.grade, bucket)
  }
  const lessons: Lesson[] = []
  for (const [grade, gradeItems] of [...byGrade.entries()].sort((a, b) => a[0] - b[0])) {
    chunk(gradeItems, 12).forEach((group, index) => {
      lessons.push({
        id: `${subject}-${kind}-${grade}-${index + 1}`,
        subject,
        grade,
        kind,
        name: `${grade}年级 · ${KIND_NAME[kind]} ${index + 1}`,
        blurb,
        items: group,
      })
    })
  }
  return lessons
}

export const lessons: Lesson[] = [
  ...makeLessons(chinesePinyin, 'pinyin', 'chinese', '声母、韵母、整体认读与拼读，照着打或默打。'),
  ...makeLessons(chineseHanzi, 'hanzi', 'chinese', '看汉字打拼音，练识字与拼写。'),
  ...makeLessons(chineseWrite, 'write', 'chinese', '看提示打出汉字，练写字输入。'),
  ...makeLessons(englishWords, 'word', 'english', '人教版小学词表抽样，打单词练拼写。'),
  ...makeLessons(englishPhonetics, 'phonetic', 'english', '看音标打出对应单词。'),
  ...makeLessons(englishPhrases, 'phrase', 'english', '课标常用短句，整句跟打。'),
  ...makeLessons(englishGrammar, 'grammar', 'english', '填空打出正确答案，覆盖 be 动词到过去时。'),
]

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === id)
}

export function lessonsBySubject(subject: Subject): Lesson[] {
  return lessons.filter((lesson) => lesson.subject === subject)
}
