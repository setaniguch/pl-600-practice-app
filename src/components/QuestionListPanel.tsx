import { useExam } from '../context/ExamContext';
import styles from './QuestionListPanel.module.css';

export function QuestionListPanel() {
  const { state, dispatch, totalCount } = useExam();

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>問題一覧</h3>
      <div className={styles.grid}>
        {Array.from({ length: totalCount }, (_, i) => {
          const q = state.questions[i];
          const isAnswered = q && q.id in state.answers;
          const isCurrent = i === state.currentIndex;

          return (
            <button
              key={i}
              className={`${styles.item} ${isCurrent ? styles.current : ''} ${isAnswered ? styles.answered : ''}`}
              onClick={() => dispatch({ type: 'GO_TO_QUESTION', index: i })}
              aria-label={`問題 ${i + 1}${isAnswered ? ' (回答済み)' : ''}`}
              aria-current={isCurrent ? 'true' : undefined}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
