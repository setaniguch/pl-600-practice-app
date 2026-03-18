import { useExam } from '../context/ExamContext';
import styles from './ProgressBar.module.css';

export function ProgressBar() {
  const { answeredCount, totalCount, progressPercent } = useExam();

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <span>{answeredCount} / {totalCount} 回答済み</span>
        <span>{progressPercent}%</span>
      </div>
      <div className={styles.track} role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
        <div className={styles.fill} style={{ width: `${progressPercent}%` }} />
      </div>
    </div>
  );
}
