import React, { createContext, useContext, useReducer, useMemo, useEffect, useRef, useCallback } from 'react';
import type { ExamState, ExamAction, ExamContextValue, Question } from '../types';
import { saveExamState, loadExamState, clearExamState, loadQuestionIds, saveQuestionIds } from '../utils/storage';

export function examReducer(state: ExamState, action: ExamAction): ExamState {
  switch (action.type) {
    case 'SET_ANSWER':
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.answer },
      };
    case 'GO_TO_QUESTION':
      return {
        ...state,
        currentIndex: Math.max(0, Math.min(action.index, state.questions.length - 1)),
      };
    case 'NEXT_QUESTION':
      return {
        ...state,
        currentIndex: Math.min(state.currentIndex + 1, state.questions.length - 1),
      };
    case 'PREV_QUESTION':
      return {
        ...state,
        currentIndex: Math.max(state.currentIndex - 1, 0),
      };
    case 'COMPLETE_EXAM':
      return { ...state, isCompleted: true };
    case 'RESET_EXAM':
      clearExamState();
      return { ...state, currentIndex: 0, answers: {}, isCompleted: false };
    case 'NEW_EXAM':
      clearExamState();
      return {
        questions: action.questions,
        currentIndex: 0,
        answers: {},
        isCompleted: false,
      };
    case 'RESUME_EXAM':
      return { ...state, isCompleted: false };
    case 'RESTORE_STATE':
      return { ...state, ...action.state, questions: state.questions };
    default:
      return state;
  }
}

const ExamContext = createContext<ExamContextValue | null>(null);

interface ExamProviderProps {
  allQuestions: Question[];
  selectQuestions: (all: Question[]) => Question[];
  children: React.ReactNode;
}

export function ExamProvider({ allQuestions, selectQuestions, children }: ExamProviderProps) {
  const initialState: ExamState = (() => {
    const saved = loadExamState();
    const savedIds = loadQuestionIds();

    // 保存済みの問題IDリストがあれば同じセットを復元
    if (saved && savedIds && savedIds.length > 0) {
      const idMap = new Map(allQuestions.map(q => [q.id, q]));
      const restored = savedIds.map(id => idMap.get(id)).filter(Boolean) as Question[];
      if (restored.length === savedIds.length) {
        return {
          questions: restored,
          currentIndex: Math.max(0, Math.min(saved.currentIndex ?? 0, restored.length - 1)),
          answers: saved.answers ?? {},
          isCompleted: saved.isCompleted ?? false,
        };
      }
    }

    // 新規: ランダム選出
    const selected = selectQuestions(allQuestions);
    saveQuestionIds(selected.map(q => q.id));
    return { questions: selected, currentIndex: 0, answers: {}, isCompleted: false };
  })();

  const [state, dispatch] = useReducer(examReducer, initialState);
  const selectQuestionsRef = useRef(selectQuestions);
  selectQuestionsRef.current = selectQuestions;
  const allQuestionsRef = useRef(allQuestions);
  allQuestionsRef.current = allQuestions;

  // 新しい試験を開始（再シャッフル）
  const startNewExam = useCallback(() => {
    const selected = selectQuestionsRef.current(allQuestionsRef.current);
    saveQuestionIds(selected.map(q => q.id));
    dispatch({ type: 'NEW_EXAM', questions: selected });
  }, []);

  // Auto-save
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return; }
    saveExamState(state);
  }, [state]);

  const value = useMemo<ExamContextValue>(() => {
    const currentQuestion = state.questions[state.currentIndex];
    const answeredCount = Object.keys(state.answers).length;
    const totalCount = state.questions.length;
    return {
      state, dispatch, currentQuestion,
      currentAnswer: currentQuestion ? state.answers[currentQuestion.id] : undefined,
      answeredCount, totalCount,
      progressPercent: totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0,
      isFirstQuestion: state.currentIndex === 0,
      isLastQuestion: state.currentIndex === state.questions.length - 1,
      startNewExam,
    };
  }, [state, dispatch, startNewExam]);

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

export function useExam(): ExamContextValue {
  const context = useContext(ExamContext);
  if (!context) throw new Error('useExam must be used within an ExamProvider');
  return context;
}
