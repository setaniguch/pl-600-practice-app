import React, { createContext, useContext, useReducer, useMemo, useEffect, useRef } from 'react';
import type { ExamState, ExamAction, ExamContextValue, Question } from '../types';
import { saveExamState, loadExamState, clearExamState } from '../utils/storage';

export function examReducer(state: ExamState, action: ExamAction): ExamState {
  switch (action.type) {
    case 'SET_ANSWER':
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.questionId]: action.answer,
        },
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
      return {
        ...state,
        isCompleted: true,
      };

    case 'RESET_EXAM':
      clearExamState();
      return {
        ...state,
        currentIndex: 0,
        answers: {},
        isCompleted: false,
      };

    case 'RESUME_EXAM':
      return {
        ...state,
        isCompleted: false,
      };

    case 'RESTORE_STATE':
      return {
        ...state,
        ...action.state,
        questions: state.questions, // questions は常に元データを維持
      };

    default:
      return state;
  }
}

const ExamContext = createContext<ExamContextValue | null>(null);

interface ExamProviderProps {
  questions: Question[];
  children: React.ReactNode;
}

export function ExamProvider({ questions, children }: ExamProviderProps) {
  const initialState: ExamState = (() => {
    const base: ExamState = {
      questions,
      currentIndex: 0,
      answers: {},
      isCompleted: false,
    };
    const saved = loadExamState();
    if (saved) {
      return {
        ...base,
        ...saved,
        questions, // always use fresh question data
        currentIndex: Math.max(0, Math.min(saved.currentIndex ?? 0, questions.length - 1)),
      };
    }
    return base;
  })();

  const [state, dispatch] = useReducer(examReducer, initialState);

  // Auto-save on state changes (skip initial render)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    saveExamState(state);
  }, [state]);

  const value = useMemo<ExamContextValue>(() => {
    const currentQuestion = state.questions[state.currentIndex];
    const answeredCount = Object.keys(state.answers).length;
    const totalCount = state.questions.length;

    return {
      state,
      dispatch,
      currentQuestion,
      currentAnswer: currentQuestion ? state.answers[currentQuestion.id] : undefined,
      answeredCount,
      totalCount,
      progressPercent: totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0,
      isFirstQuestion: state.currentIndex === 0,
      isLastQuestion: state.currentIndex === state.questions.length - 1,
    };
  }, [state, dispatch]);

  return (
    <ExamContext.Provider value={value}>
      {children}
    </ExamContext.Provider>
  );
}

export function useExam(): ExamContextValue {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
}
