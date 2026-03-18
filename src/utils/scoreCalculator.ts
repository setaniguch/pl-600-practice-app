import type { Question, UserAnswer, ExamResult, QuestionResult } from '../types';

/**
 * 個別の問題の正誤を判定する
 */
export function checkAnswer(question: Question, answer: UserAnswer): boolean {
  const correct = question.correctAnswer;

  // 回答タイプと正解タイプが一致しない場合は不正解
  if (correct.type !== answer.type) return false;

  switch (correct.type) {
    case 'single':
      return correct.optionId === (answer as { type: 'single'; optionId: string }).optionId;

    case 'multiple': {
      const userIds = [...(answer as { type: 'multiple'; optionIds: string[] }).optionIds].sort();
      const correctIds = [...correct.optionIds].sort();
      return (
        userIds.length === correctIds.length &&
        userIds.every((id, i) => id === correctIds[i])
      );
    }

    case 'dropdown': {
      const userSel = (answer as { type: 'dropdown'; selections: Record<string, string> }).selections;
      const correctSel = correct.selections;
      const keys = Object.keys(correctSel);
      return (
        keys.length === Object.keys(userSel).length &&
        keys.every((k) => userSel[k] === correctSel[k])
      );
    }

    case 'yesno': {
      const userAns = (answer as { type: 'yesno'; answers: Record<string, boolean> }).answers;
      const correctAns = correct.answers;
      const keys = Object.keys(correctAns);
      return (
        keys.length === Object.keys(userAns).length &&
        keys.every((k) => userAns[k] === correctAns[k])
      );
    }

    case 'ordering': {
      const userOrder = (answer as { type: 'ordering'; orderedIds: string[] }).orderedIds;
      const correctOrder = correct.orderedIds;
      return (
        userOrder.length === correctOrder.length &&
        userOrder.every((id, i) => id === correctOrder[i])
      );
    }

    default:
      return false;
  }
}

/**
 * 全問題のスコアを計算する
 */
export function calculateScore(
  questions: Question[],
  answers: Record<string, UserAnswer>
): ExamResult {
  const results: QuestionResult[] = questions.map((q) => {
    const userAnswer = answers[q.id];
    const isCorrect = userAnswer != null ? checkAnswer(q, userAnswer) : false;

    return {
      questionId: q.id,
      isCorrect,
      userAnswer,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    };
  });

  const correctCount = results.filter((r) => r.isCorrect).length;
  const totalQuestions = questions.length;
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return { totalQuestions, correctCount, scorePercent, results };
}
