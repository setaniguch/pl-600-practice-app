import { useExam } from '../context/ExamContext';
import { ProgressBar } from '../components/ProgressBar';
import { QuestionRenderer } from '../components/QuestionRenderer';
import { NavigationControls } from '../components/NavigationControls';
import { QuestionListPanel } from '../components/QuestionListPanel';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import styles from './ExamPage.module.css';

export function ExamPage() {
  const { state } = useExam();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.isCompleted) {
      navigate('/review');
    }
  }, [state.isCompleted, navigate]);

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1 className={styles.title}>PL-600 Practice Exam</h1>
        <ProgressBar />
      </header>
      <div className={styles.body}>
        <main className={styles.main}>
          <QuestionRenderer />
          <NavigationControls />
        </main>
        <aside className={styles.sidebar}>
          <QuestionListPanel />
        </aside>
      </div>
    </div>
  );
}
