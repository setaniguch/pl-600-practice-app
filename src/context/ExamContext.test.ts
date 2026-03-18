import { describe, it, expect } from 'vitest';
import { examReducer } from './ExamContext';
import type { ExamState, Question, UserAnswer } from '../types';

// ヘルパー: 最小限のテスト用問題データ
function makeQuestion(id: string, type: Question['type'] = 'single-choice'): Question {
  return {
    id,
    type,
    text: `Question ${id}`,
    options: [
      { id: 'a', text: 'A' },
      { id: 'b', text: 'B' },
    ],
    correctAnswer: { type: 'single', optionId: 'a' },
    explanation: 'Explanation',
  };
}

function makeState(overrides?: Partial<ExamState>): ExamState {
  return {
    questions: [makeQuestion('q1'), makeQuestion('q2'), makeQuestion('q3')],
    currentIndex: 0,
    answers: {},
    isCompleted: false,
    ...overrides,
  };
}

describe('examReducer', () => {
  describe('SET_ANSWER', () => {
    it('回答を保存する', () => {
      const state = makeState();
      const answer: UserAnswer = { type: 'single', optionId: 'a' };
      const next = examReducer(state, { type: 'SET_ANSWER', questionId: 'q1', answer });
      expect(next.answers['q1']).toEqual(answer);
    });

    it('既存の回答を上書きする', () => {
      const state = makeState({
        answers: { q1: { type: 'single', optionId: 'a' } },
      });
      const answer: UserAnswer = { type: 'single', optionId: 'b' };
      const next = examReducer(state, { type: 'SET_ANSWER', questionId: 'q1', answer });
      expect(next.answers['q1']).toEqual(answer);
    });

    it('他の回答に影響しない', () => {
      const state = makeState({
        answers: { q1: { type: 'single', optionId: 'a' } },
      });
      const answer: UserAnswer = { type: 'single', optionId: 'b' };
      const next = examReducer(state, { type: 'SET_ANSWER', questionId: 'q2', answer });
      expect(next.answers['q1']).toEqual({ type: 'single', optionId: 'a' });
      expect(next.answers['q2']).toEqual(answer);
    });
  });

  describe('NEXT_QUESTION', () => {
    it('次の問題に移動する', () => {
      const state = makeState({ currentIndex: 0 });
      const next = examReducer(state, { type: 'NEXT_QUESTION' });
      expect(next.currentIndex).toBe(1);
    });

    it('最後の問題を超えない', () => {
      const state = makeState({ currentIndex: 2 });
      const next = examReducer(state, { type: 'NEXT_QUESTION' });
      expect(next.currentIndex).toBe(2);
    });
  });

  describe('PREV_QUESTION', () => {
    it('前の問題に移動する', () => {
      const state = makeState({ currentIndex: 1 });
      const next = examReducer(state, { type: 'PREV_QUESTION' });
      expect(next.currentIndex).toBe(0);
    });

    it('最初の問題より前に行かない', () => {
      const state = makeState({ currentIndex: 0 });
      const next = examReducer(state, { type: 'PREV_QUESTION' });
      expect(next.currentIndex).toBe(0);
    });
  });

  describe('GO_TO_QUESTION', () => {
    it('指定インデックスに移動する', () => {
      const state = makeState();
      const next = examReducer(state, { type: 'GO_TO_QUESTION', index: 2 });
      expect(next.currentIndex).toBe(2);
    });

    it('範囲外のインデックスをクランプする（上限）', () => {
      const state = makeState();
      const next = examReducer(state, { type: 'GO_TO_QUESTION', index: 100 });
      expect(next.currentIndex).toBe(2);
    });

    it('範囲外のインデックスをクランプする（下限）', () => {
      const state = makeState();
      const next = examReducer(state, { type: 'GO_TO_QUESTION', index: -5 });
      expect(next.currentIndex).toBe(0);
    });
  });

  describe('COMPLETE_EXAM', () => {
    it('試験を完了状態にする', () => {
      const state = makeState();
      const next = examReducer(state, { type: 'COMPLETE_EXAM' });
      expect(next.isCompleted).toBe(true);
    });
  });

  describe('RESET_EXAM', () => {
    it('状態を初期化する', () => {
      const state = makeState({
        currentIndex: 2,
        answers: { q1: { type: 'single', optionId: 'a' } },
        isCompleted: true,
      });
      const next = examReducer(state, { type: 'RESET_EXAM' });
      expect(next.currentIndex).toBe(0);
      expect(next.answers).toEqual({});
      expect(next.isCompleted).toBe(false);
      expect(next.questions).toBe(state.questions); // 問題データは維持
    });
  });

  describe('RESTORE_STATE', () => {
    it('部分的な状態を復元する', () => {
      const state = makeState();
      const next = examReducer(state, {
        type: 'RESTORE_STATE',
        state: { currentIndex: 1, answers: { q1: { type: 'single', optionId: 'b' } } },
      });
      expect(next.currentIndex).toBe(1);
      expect(next.answers['q1']).toEqual({ type: 'single', optionId: 'b' });
      expect(next.questions).toBe(state.questions); // questions は元データを維持
    });
  });

  describe('ナビゲーションのラウンドトリップ', () => {
    it('NEXT → PREV で元のインデックスに戻る', () => {
      const state = makeState({ currentIndex: 1 });
      const afterNext = examReducer(state, { type: 'NEXT_QUESTION' });
      const afterPrev = examReducer(afterNext, { type: 'PREV_QUESTION' });
      expect(afterPrev.currentIndex).toBe(1);
    });
  });

  describe('回答状態の保持', () => {
    it('ナビゲーション後も回答が保持される', () => {
      let state = makeState();
      const answer: UserAnswer = { type: 'single', optionId: 'a' };
      state = examReducer(state, { type: 'SET_ANSWER', questionId: 'q1', answer });
      state = examReducer(state, { type: 'NEXT_QUESTION' });
      state = examReducer(state, { type: 'PREV_QUESTION' });
      expect(state.answers['q1']).toEqual(answer);
    });
  });
});
