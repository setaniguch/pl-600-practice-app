// 問題形式の型
export type QuestionType =
  | 'single-choice'
  | 'multiple-choice'
  | 'dropdown'
  | 'yes-no'
  | 'ordering'
  | 'case-study';

export interface Option {
  id: string;
  text: string;
}

export interface Statement {
  id: string;
  text: string;
}

export interface OrderItem {
  id: string;
  text: string;
}

export interface DropdownSlot {
  id: string;
  label: string;
  options: Option[];
}

export interface CaseStudySubSection {
  id: string;
  title: string;
  content: string;
}

export interface CaseStudySection {
  id: string;
  title: string;
  content: string;
  subSections?: CaseStudySubSection[];
}

export interface CaseStudy {
  title: string;
  sections: CaseStudySection[];
}

// 正解データ（問題形式に応じた Union 型）
export type CorrectAnswer =
  | { type: 'single'; optionId: string }
  | { type: 'multiple'; optionIds: string[] }
  | { type: 'dropdown'; selections: Record<string, string> }
  | { type: 'yesno'; answers: Record<string, boolean> }
  | { type: 'ordering'; orderedIds: string[] };

// ユーザー回答データ
export type UserAnswer =
  | { type: 'single'; optionId: string }
  | { type: 'multiple'; optionIds: string[] }
  | { type: 'dropdown'; selections: Record<string, string> }
  | { type: 'yesno'; answers: Record<string, boolean> }
  | { type: 'ordering'; orderedIds: string[] };

// 問題データ
export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: Option[];
  statements?: Statement[];
  orderItems?: OrderItem[];
  correctAnswer: CorrectAnswer;
  explanation: string;
  caseStudy?: CaseStudy;
  requiredSelections?: number;
  dropdowns?: DropdownSlot[];
}

// 試験全体の状態
export interface ExamState {
  questions: Question[];
  currentIndex: number;
  answers: Record<string, UserAnswer>;
  isCompleted: boolean;
}

// アクション定義
export type ExamAction =
  | { type: 'SET_ANSWER'; questionId: string; answer: UserAnswer }
  | { type: 'GO_TO_QUESTION'; index: number }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREV_QUESTION' }
  | { type: 'COMPLETE_EXAM' }
  | { type: 'RESET_EXAM' }
  | { type: 'NEW_EXAM'; questions: Question[] }
  | { type: 'RESUME_EXAM' }
  | { type: 'RESTORE_STATE'; state: Partial<ExamState> };

// Context 提供値
export interface ExamContextValue {
  state: ExamState;
  dispatch: React.Dispatch<ExamAction>;
  currentQuestion: Question;
  currentAnswer: UserAnswer | undefined;
  answeredCount: number;
  totalCount: number;
  progressPercent: number;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  startNewExam: () => void;
}

// スコア計算
export interface QuestionResult {
  questionId: string;
  isCorrect: boolean;
  userAnswer: UserAnswer | undefined;
  correctAnswer: CorrectAnswer;
  explanation: string;
}

export interface ExamResult {
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  results: QuestionResult[];
}
