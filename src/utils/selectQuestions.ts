import type { Question } from '../types';

/** 必須問題ID（連続出題） */
const YESNO_IDS = ['q132', 'q133', 'q134', 'q135'];
const LAST_ID = 'q136';
const REQUIRED_IDS = new Set([...YESNO_IDS, LAST_ID]);
const RANDOM_COUNT = 43;

/** Fisher-Yates シャッフル */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 48問を選出する
 * - q132〜q135 は連続で出題（順序固定）
 * - q136 は最後に配置
 * - 残りからランダム43問
 * - ランダム部分をシャッフルし、その中にq132〜q135ブロックをランダム位置に挿入
 */
export function selectExamQuestions(allQuestions: Question[]): Question[] {
  const idMap = new Map(allQuestions.map(q => [q.id, q]));
  const yesNoBlock = YESNO_IDS.map(id => idMap.get(id)).filter(Boolean) as Question[];
  const last = idMap.get(LAST_ID);
  const pool = allQuestions.filter(q => !REQUIRED_IDS.has(q.id));

  const randomPick = shuffle(pool).slice(0, RANDOM_COUNT);
  const shuffled = shuffle(randomPick);

  // q132〜q135ブロックをランダム位置に挿入
  const insertPos = Math.floor(Math.random() * (shuffled.length + 1));
  shuffled.splice(insertPos, 0, ...yesNoBlock);

  return last ? [...shuffled, last] : shuffled;
}
