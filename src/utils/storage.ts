import type { ExamState } from '../types';

const STORAGE_KEY = 'pl600-exam-state';

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
  } catch (e) {
    console.warn('Failed to clear exam state from localStorage:', e);
  }
}
