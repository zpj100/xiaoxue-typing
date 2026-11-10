import type { LessonItem } from '../lib/types'
import { ipaChart } from './ipa-chart'
import raw from './english.json'

type RawItem = LessonItem & { kind: 'word' | 'phrase' | 'phonetic' }

const pack = raw as { words: RawItem[]; phrases: RawItem[]; phonetics: RawItem[] }

export const englishWords: LessonItem[] = pack.words
export const englishPhrases: LessonItem[] = pack.phrases
export const englishPhonetics: LessonItem[] = [...ipaChart, ...pack.phonetics]

export const englishGrammar: LessonItem[] = [
  { id: 'gr-3-1', subject: 'english', grade: 3, term: 1, unit: 'be 动词', kind: 'grammar', title: 'be 动词', prompt: 'I ___ a student. (am/is/are)', answer: 'am', hint: 'I 后面用 am' },
  { id: 'gr-3-2', subject: 'english', grade: 3, term: 1, unit: 'be 动词', kind: 'grammar', title: 'be 动词', prompt: 'She ___ my sister. (am/is/are)', answer: 'is', hint: 'She 后面用 is' },
  { id: 'gr-3-3', subject: 'english', grade: 3, term: 1, unit: 'be 动词', kind: 'grammar', title: 'be 动词', prompt: 'They ___ friends. (am/is/are)', answer: 'are', hint: 'They 后面用 are' },
  { id: 'gr-3-4', subject: 'english', grade: 3, term: 1, unit: '冠词', kind: 'grammar', title: '冠词', prompt: 'This is ___ apple. (a/an)', answer: 'an', hint: '元音前用 an' },
  { id: 'gr-3-5', subject: 'english', grade: 3, term: 2, unit: '冠词', kind: 'grammar', title: '冠词', prompt: 'I have ___ book. (a/an)', answer: 'a', hint: '辅音前用 a' },
  { id: 'gr-3-6', subject: 'english', grade: 3, term: 2, unit: '人称', kind: 'grammar', title: '人称', prompt: '___ is a boy. (He/She)', answer: 'He', hint: '男孩用 He' },
  { id: 'gr-4-1', subject: 'english', grade: 4, term: 1, unit: '现在进行时', kind: 'grammar', title: '现在进行时', prompt: 'I am ___ (read).', answer: 'reading', hint: 'be + v-ing' },
  { id: 'gr-4-2', subject: 'english', grade: 4, term: 1, unit: '现在进行时', kind: 'grammar', title: '现在进行时', prompt: 'She is ___ (run).', answer: 'running', hint: '双写 n 再加 ing' },
  { id: 'gr-4-3', subject: 'english', grade: 4, term: 1, unit: 'there be', kind: 'grammar', title: 'there be', prompt: 'There ___ a cat. (is/are)', answer: 'is', hint: '单数用 is' },
  { id: 'gr-4-4', subject: 'english', grade: 4, term: 2, unit: 'there be', kind: 'grammar', title: 'there be', prompt: 'There ___ two books. (is/are)', answer: 'are', hint: '复数用 are' },
  { id: 'gr-4-5', subject: 'english', grade: 4, term: 2, unit: '介词', kind: 'grammar', title: '介词', prompt: 'The book is ___ the desk. (on/in)', answer: 'on', hint: '在上面用 on' },
  { id: 'gr-4-6', subject: 'english', grade: 4, term: 2, unit: '介词', kind: 'grammar', title: '介词', prompt: 'The cat is ___ the box. (in/on)', answer: 'in', hint: '在里面用 in' },
  { id: 'gr-5-1', subject: 'english', grade: 5, term: 1, unit: '一般现在时', kind: 'grammar', title: '一般现在时', prompt: 'He ___ football. (play/plays)', answer: 'plays', hint: '第三人称单数加 s' },
  { id: 'gr-5-2', subject: 'english', grade: 5, term: 1, unit: '一般现在时', kind: 'grammar', title: '一般现在时', prompt: 'They ___ to school. (go/goes)', answer: 'go', hint: '复数用原形' },
  { id: 'gr-5-3', subject: 'english', grade: 5, term: 1, unit: 'can', kind: 'grammar', title: 'can', prompt: '___ you swim? (Can/Do)', answer: 'Can', hint: '能力用 Can' },
  { id: 'gr-5-4', subject: 'english', grade: 5, term: 2, unit: 'like doing', kind: 'grammar', title: 'like doing', prompt: 'I like ___ (swim).', answer: 'swimming', hint: 'like + doing' },
  { id: 'gr-5-5', subject: 'english', grade: 5, term: 2, unit: '比较级', kind: 'grammar', title: '比较级', prompt: 'Tom is ___ than me. (tall/taller)', answer: 'taller', hint: 'than 前用比较级' },
  { id: 'gr-5-6', subject: 'english', grade: 5, term: 2, unit: '最高级', kind: 'grammar', title: '最高级', prompt: 'This is the ___ book. (best/better)', answer: 'best', hint: 'the 后用最高级' },
  { id: 'gr-6-1', subject: 'english', grade: 6, term: 1, unit: '一般过去时', kind: 'grammar', title: '一般过去时', prompt: 'I ___ to the park yesterday. (go/went)', answer: 'went', hint: 'yesterday 用过去式' },
  { id: 'gr-6-2', subject: 'english', grade: 6, term: 1, unit: '一般过去时', kind: 'grammar', title: '一般过去时', prompt: 'She ___ a letter. (write/wrote)', answer: 'wrote', hint: 'write 的过去式' },
  { id: 'gr-6-3', subject: 'english', grade: 6, term: 1, unit: 'will', kind: 'grammar', title: 'will', prompt: 'I ___ help you. (will/am)', answer: 'will', hint: '将来用 will' },
  { id: 'gr-6-4', subject: 'english', grade: 6, term: 2, unit: 'be going to', kind: 'grammar', title: 'be going to', prompt: 'We are going ___ play. (to/for)', answer: 'to', hint: 'be going to + 动词原形' },
  { id: 'gr-6-5', subject: 'english', grade: 6, term: 2, unit: 'because', kind: 'grammar', title: 'because', prompt: 'I stay home ___ it rains. (because/but)', answer: 'because', hint: '原因用 because' },
  { id: 'gr-6-6', subject: 'english', grade: 6, term: 2, unit: 'and / but', kind: 'grammar', title: 'and / but', prompt: 'I like tea ___ I don\'t like coffee. (and/but)', answer: 'but', hint: '转折用 but' },
]
