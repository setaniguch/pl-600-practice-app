import { useState } from 'react';
import { useExam } from '../context/ExamContext';
import { calculateScore } from '../utils/scoreCalculator';
import { useNavigate } from 'react-router-dom';
import type { Question, UserAnswer, CorrectAnswer } from '../types';
import styles from './ReviewPage.module.css';

/** Format a user answer or correct answer into readable text lines */
function formatAnswer(
  question: Question,
  answer: UserAnswer | CorrectAnswer | undefined,
): string[] {
  if (!answer) return ['（未回答）'];

  switch (answer.type) {
    case 'single': {
      const opt = question.options?.find((o) => o.id === answer.optionId);
      return [opt?.text ?? answer.optionId];
    }
    case 'multiple': {
      return answer.optionIds.map((id) => {
        const opt = question.options?.find((o) => o.id === id);
        return opt?.text ?? id;
      });
    }
    case 'dropdown': {
      return Object.entries(answer.selections).map(([slotId, optId]) => {
        const slot = question.dropdowns?.find((d) => d.id === slotId);
        const opt = slot?.options.find((o) => o.id === optId);
        return `${slot?.label ?? slotId}: ${opt?.text ?? optId}`;
      });
    }
    case 'yesno': {
      return Object.entries(answer.answers).map(([stId, val]) => {
        const st = question.statements?.find((s) => s.id === stId);
        return `${st?.text ?? stId}: ${val ? 'Yes' : 'No'}`;
      });
    }
    case 'ordering': {
      return answer.orderedIds.map((id, i) => {
        const item = question.orderItems?.find((o) => o.id === id);
        return `${i + 1}. ${item?.text ?? id}`;
      });
    }
    default:
      return ['—'];
  }
}

export function ReviewPage() {
  const { state, dispatch, startNewExam } = useExam();
  const navigate = useNavigate();
  const result = calculateScore(state.questions, state.answers);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Guard: redirect to exam if not completed
  if (!state.isCompleted) {
    navigate('/', { replace: true });
    return null;
  }

  const handleRestart = () => {
    startNewExam();
    navigate('/');
  };

  const handleBackToExam = () => {
    dispatch({ type: 'RESUME_EXAM' });
    navigate('/');
  };

  const toggle = (qId: string) => {
    setExpandedId((prev) => (prev === qId ? null : qId));
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1 className={styles.title}>PL-600 Practice Exam — 結果</h1>
      </header>

      {/* Score summary */}
      <section className={styles.scoreSection}>
        <p className={styles.scorePercent}>{result.scorePercent}%</p>
        <p className={styles.scoreDetail}>
          {result.correctCount} / {result.totalQuestions} 問正解
        </p>
        <div className={styles.scoreBar}>
          <div
            className={styles.scoreBarFill}
            style={{ width: `${result.scorePercent}%` }}
          />
        </div>
        <div className={styles.actions}>
          <button className={styles.btn} onClick={handleRestart}>
            最初からやり直す
          </button>
          <button className={styles.btn} onClick={handleBackToExam}>
            問題に戻る
          </button>
        </div>
      </section>

      {/* Per-question results */}
      <div className={styles.resultsList}>
        {result.results.map((r, idx) => {
          const question = state.questions.find((q) => q.id === r.questionId);
          if (!question) return null;
          const isOpen = expandedId === r.questionId;
          const skipped = r.userAnswer == null;

          const badgeClass = skipped
            ? styles.badgeSkipped
            : r.isCorrect
              ? styles.badgeCorrect
              : styles.badgeIncorrect;
          const badgeLabel = skipped ? '—' : r.isCorrect ? '✓' : '✗';

          return (
            <div
              key={r.questionId}
              className={styles.resultItem}
              onClick={() => toggle(r.questionId)}
              role="button"
              tabIndex={0}
              aria-expanded={isOpen}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggle(r.questionId);
                }
              }}
            >
              <div className={styles.resultHeader}>
                <span className={`${styles.badge} ${badgeClass}`}>
                  {badgeLabel}
                </span>
                <span className={styles.questionNum}>問 {idx + 1}</span>
                <span className={styles.questionText}>{question.text}</span>
                <span
                  className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                >
                  ▶
                </span>
              </div>

              {isOpen && (
                <div className={styles.detail}>
                  {/* User answer */}
                  <div className={styles.detailSection}>
                    <p className={styles.detailLabel}>あなたの回答</p>
                    {formatAnswer(question, r.userAnswer).map((line, i) => (
                      <p
                        key={i}
                        className={`${styles.answerRow} ${
                          skipped
                            ? ''
                            : r.isCorrect
                              ? styles.correctText
                              : styles.incorrectText
                        }`}
                      >
                        {line}
                      </p>
                    ))}
                  </div>

                  {/* Correct answer (show when incorrect or skipped) */}
                  {!r.isCorrect && (
                    <div className={styles.detailSection}>
                      <p className={styles.detailLabel}>正解</p>
                      {formatAnswer(question, r.correctAnswer).map((line, i) => (
                        <p key={i} className={`${styles.answerRow} ${styles.correctText}`}>
                          {line}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Explanation */}
                  <div className={styles.detailSection}>
                    <p className={styles.detailLabel}>解説</p>
                    <div className={styles.explanation}>{r.explanation}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
