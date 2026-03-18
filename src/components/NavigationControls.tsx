import { useExam } from '../context/ExamContext';
import styles from './NavigationControls.module.css';

export function NavigationControls() {
  const { dispatch, isFirstQuestion, isLastQuestion } = useExam();

  return (
    <div className={styles.container}>
      <button
        className={styles.btn}
        disabled={isFirstQuestion}
        onClick={() => dispatch({ type: 'PREV_QUESTION' })}
      >
        前へ
      </button>
      {isLastQuestion ? (
        <button
          className={`${styles.btn} ${styles.complete}`}
          onClick={() => dispatch({ type: 'COMPLETE_EXAM' })}
        >
          完了
        </button>
      ) : (
        <button
          className={styles.btn}
          onClick={() => dispatch({ type: 'NEXT_QUESTION' })}
        >
          次へ
        </button>
      )}
    </div>
  );
}
