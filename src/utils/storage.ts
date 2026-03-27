import type { ExamState } from '../types';

const STORAGE_KEY = 'pl600-exam-state';
const QUESTION_IDS_KEY = 'pl600-question-ids';

interface StoredState {
  currentIndex: number;
  answers: ExamState['answers'];
  isCompleted: boolean;
}

export function saveExamState(state: ExamState): void {
  try {
    const toStore: StoredState = {
      currentIndex: state.currentIndex,
      answers: state.answers,
      isCompleted: state.isCompleted,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch (e) {
    console.warn('Failed to save exam state to localStorage:', e);
  }
}

export function loadExamState(): Partial<ExamState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: StoredState = JSON.parse(raw);

    // Basic validation
    if (
      typeof parsed.currentIndex !== 'number' ||
      typeof parsed.answers !== 'object' ||
      parsed.answers === null ||
      typeof parsed.isCompleted !== 'boolean'
    ) {
      clearExamState();
      return null;
    }

    return {
      currentIndex: parsed.currentIndex,
      answers: parsed.answers,
      isCompleted: parsed.isCompleted,
    };
  } catch (e) {
    console.warn('Failed to load exam state from localStorage:', e);
    clearExamState();
    return null;
  }
}

export function clearExamState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(QUESTION_IDS_KEY);
  } catch (e) {
    console.warn('Failed to clear exam state from localStorage:', e);
  }
}

export function saveQuestionIds(ids: string[]): void {
  try {
    localStorage.setItem(QUESTION_IDS_KEY, JSON.stringify(ids));
  } catch (e) {
    console.warn('Failed to save question IDs:', e);
  }
}

export function loadQuestionIds(): string[] | null {
  try {
    const raw = localStorage.getItem(QUESTION_IDS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
