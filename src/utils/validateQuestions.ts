import type { QuestionType } from '../types';

export interface ValidationError {
  questionId: string | undefined;
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

const VALID_TYPES: QuestionType[] = [
  'single-choice',
  'multiple-choice',
  'dropdown',
  'yes-no',
  'ordering',
  'case-study',
];

function err(questionId: string | undefined, field: string, message: string): ValidationError {
  return { questionId, field, message };
}

/**
 * 個別の問題データをバリデーションする
 */
export function validateQuestion(q: unknown, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  if (q == null || typeof q !== 'object') {
    return [err(undefined, `questions[${index}]`, '問題データがオブジェクトではありません')];
  }

  const question = q as Record<string, unknown>;
  const id = typeof question.id === 'string' ? question.id : undefined;
  const prefix = id ?? `questions[${index}]`;

  // 必須フィールドチェック
  if (typeof question.id !== 'string' || question.id === '') {
    errors.push(err(id, 'id', `${prefix}: id は必須の文字列です`));
  }
  if (typeof question.text !== 'string' || question.text === '') {
    errors.push(err(id, 'text', `${prefix}: text は必須の文字列です`));
  }
  if (typeof question.explanation !== 'string') {
    errors.push(err(id, 'explanation', `${prefix}: explanation は必須の文字列です`));
  }
  if (!VALID_TYPES.includes(question.type as QuestionType)) {
    errors.push(err(id, 'type', `${prefix}: type が不正です (${String(question.type)})`));
    return errors; // 形式不明なのでこれ以上検証できない
  }
  if (question.correctAnswer == null || typeof question.correctAnswer !== 'object') {
    errors.push(err(id, 'correctAnswer', `${prefix}: correctAnswer は必須です`));
    return errors;
  }

  // 問題形式に応じた追加フィールド検証
  const type = question.type as QuestionType;
  switch (type) {
    case 'single-choice':
      validateOptions(question, prefix, id, errors);
      validateCorrectAnswerType(question.correctAnswer, 'single', prefix, id, errors);
      break;
    case 'multiple-choice':
      validateOptions(question, prefix, id, errors);
      validateCorrectAnswerType(question.correctAnswer, 'multiple', prefix, id, errors);
      break;
    case 'dropdown':
      validateDropdowns(question, prefix, id, errors);
      validateCorrectAnswerType(question.correctAnswer, 'dropdown', prefix, id, errors);
      break;
    case 'yes-no':
      validateStatements(question, prefix, id, errors);
      validateCorrectAnswerType(question.correctAnswer, 'yesno', prefix, id, errors);
      break;
    case 'ordering':
      validateOrderItems(question, prefix, id, errors);
      validateCorrectAnswerType(question.correctAnswer, 'ordering', prefix, id, errors);
      break;
    case 'case-study':
      validateCaseStudy(question, prefix, id, errors);
      break;
  }

  return errors;
}


function validateOptions(
  q: Record<string, unknown>,
  prefix: string,
  id: string | undefined,
  errors: ValidationError[],
): void {
  if (!Array.isArray(q.options) || q.options.length === 0) {
    errors.push(err(id, 'options', `${prefix}: options は1つ以上の配列が必要です`));
    return;
  }
  for (let i = 0; i < q.options.length; i++) {
    const opt = q.options[i] as Record<string, unknown> | undefined;
    if (!opt || typeof opt.id !== 'string' || typeof opt.text !== 'string') {
      errors.push(err(id, `options[${i}]`, `${prefix}: options[${i}] に id と text が必要です`));
    }
  }
}

function validateStatements(
  q: Record<string, unknown>,
  prefix: string,
  id: string | undefined,
  errors: ValidationError[],
): void {
  if (!Array.isArray(q.statements) || q.statements.length === 0) {
    errors.push(err(id, 'statements', `${prefix}: statements は1つ以上の配列が必要です`));
    return;
  }
  for (let i = 0; i < q.statements.length; i++) {
    const st = q.statements[i] as Record<string, unknown> | undefined;
    if (!st || typeof st.id !== 'string' || typeof st.text !== 'string') {
      errors.push(err(id, `statements[${i}]`, `${prefix}: statements[${i}] に id と text が必要です`));
    }
  }
}

function validateOrderItems(
  q: Record<string, unknown>,
  prefix: string,
  id: string | undefined,
  errors: ValidationError[],
): void {
  if (!Array.isArray(q.orderItems) || q.orderItems.length === 0) {
    errors.push(err(id, 'orderItems', `${prefix}: orderItems は1つ以上の配列が必要です`));
    return;
  }
  for (let i = 0; i < q.orderItems.length; i++) {
    const item = q.orderItems[i] as Record<string, unknown> | undefined;
    if (!item || typeof item.id !== 'string' || typeof item.text !== 'string') {
      errors.push(err(id, `orderItems[${i}]`, `${prefix}: orderItems[${i}] に id と text が必要です`));
    }
  }
}

function validateDropdowns(
  q: Record<string, unknown>,
  prefix: string,
  id: string | undefined,
  errors: ValidationError[],
): void {
  if (!Array.isArray(q.dropdowns) || q.dropdowns.length === 0) {
    errors.push(err(id, 'dropdowns', `${prefix}: dropdowns は1つ以上の配列が必要です`));
    return;
  }
  for (let i = 0; i < q.dropdowns.length; i++) {
    const slot = q.dropdowns[i] as Record<string, unknown> | undefined;
    if (!slot || typeof slot.id !== 'string' || typeof slot.label !== 'string') {
      errors.push(err(id, `dropdowns[${i}]`, `${prefix}: dropdowns[${i}] に id と label が必要です`));
    } else if (!Array.isArray(slot.options) || (slot.options as unknown[]).length === 0) {
      errors.push(err(id, `dropdowns[${i}].options`, `${prefix}: dropdowns[${i}].options は1つ以上の配列が必要です`));
    }
  }
}

function validateCaseStudy(
  q: Record<string, unknown>,
  prefix: string,
  id: string | undefined,
  errors: ValidationError[],
): void {
  // case-study は options を持つ場合もある（内部問題として）
  const cs = q.caseStudy as Record<string, unknown> | undefined;
  if (!cs || typeof cs !== 'object') {
    errors.push(err(id, 'caseStudy', `${prefix}: case-study 形式には caseStudy データが必要です`));
    return;
  }
  if (typeof cs.title !== 'string') {
    errors.push(err(id, 'caseStudy.title', `${prefix}: caseStudy.title は必須の文字列です`));
  }
  if (!Array.isArray(cs.sections) || (cs.sections as unknown[]).length === 0) {
    errors.push(err(id, 'caseStudy.sections', `${prefix}: caseStudy.sections は1つ以上の配列が必要です`));
  }
}

function validateCorrectAnswerType(
  ca: unknown,
  expectedType: string,
  prefix: string,
  id: string | undefined,
  errors: ValidationError[],
): void {
  const answer = ca as Record<string, unknown>;
  if (answer.type !== expectedType) {
    errors.push(
      err(id, 'correctAnswer.type', `${prefix}: correctAnswer.type は "${expectedType}" である必要があります (実際: "${String(answer.type)}")`),
    );
  }
}

/**
 * 問題データ全体（JSON ルート）をバリデーションする
 */
export function validateQuestions(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (data == null || typeof data !== 'object') {
    return { valid: false, errors: [err(undefined, 'root', '問題データがオブジェクトではありません')] };
  }

  const root = data as Record<string, unknown>;
  if (!Array.isArray(root.questions)) {
    return { valid: false, errors: [err(undefined, 'questions', 'questions フィールドが配列ではありません')] };
  }

  if (root.questions.length === 0) {
    errors.push(err(undefined, 'questions', '問題データが空です'));
  }

  // ID 重複チェック
  const ids = new Set<string>();
  for (let i = 0; i < root.questions.length; i++) {
    const q = root.questions[i] as Record<string, unknown> | undefined;
    if (q && typeof q.id === 'string') {
      if (ids.has(q.id)) {
        errors.push(err(q.id, 'id', `問題ID "${q.id}" が重複しています`));
      }
      ids.add(q.id);
    }
    errors.push(...validateQuestion(root.questions[i], i));
  }

  return { valid: errors.length === 0, errors };
}
