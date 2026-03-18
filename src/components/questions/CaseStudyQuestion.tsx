import { useState, useCallback, useEffect } from 'react';
import type { Question, UserAnswer } from '../../types';
import { ResizableCaseStudyPanel } from '../CaseStudyPanel';
import { CaseStudyPanel } from '../CaseStudyPanel';
import { SingleChoiceQuestion } from './SingleChoiceQuestion';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { DropdownQuestion } from './DropdownQuestion';
import { YesNoQuestion } from './YesNoQuestion';
import { OrderingQuestion } from './OrderingQuestion';
import styles from './CaseStudyQuestion.module.css';

interface Props {
  question: Question;
  answer: UserAnswer | undefined;
  onAnswer: (answer: UserAnswer) => void;
}

const MOBILE_BREAKPOINT = 767;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isMobile;
}

export function CaseStudyQuestion({ question, answer, onAnswer }: Props) {
  const [panelOpen, setPanelOpen] = useState(false);
  const isMobile = useIsMobile();

  const closePanel = useCallback(() => setPanelOpen(false), []);

  // Close panel on escape key
  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [panelOpen, closePanel]);

  if (!question.caseStudy) {
    return (
      <SingleChoiceQuestion question={question} answer={answer} onAnswer={onAnswer} />
    );
  }

  const renderInnerQuestion = () => {
    const innerType = question.correctAnswer.type;
    switch (innerType) {
      case 'multiple':
        return <MultipleChoiceQuestion question={question} answer={answer} onAnswer={onAnswer} />;
      case 'dropdown':
        return <DropdownQuestion question={question} answer={answer} onAnswer={onAnswer} />;
      case 'yesno':
        return <YesNoQuestion question={question} answer={answer} onAnswer={onAnswer} />;
      case 'ordering':
        return <OrderingQuestion question={question} answer={answer} onAnswer={onAnswer} />;
      case 'single':
      default:
        return <SingleChoiceQuestion question={question} answer={answer} onAnswer={onAnswer} />;
    }
  };

  return (
    <div className={styles.layout}>
      {/* Mobile overlay backdrop */}
      <div
        className={`${styles.overlay} ${panelOpen ? styles.overlayVisible : ''}`}
        onClick={closePanel}
      />

      {/* Panel: resizable on desktop, overlay on mobile */}
      <div className={`${styles.panelArea} ${panelOpen ? styles.panelAreaOpen : ''}`}>
        {isMobile ? (
          <CaseStudyPanel caseStudy={question.caseStudy} />
        ) : (
          <ResizableCaseStudyPanel caseStudy={question.caseStudy} />
        )}
      </div>

      <div className={styles.questionArea}>
        <button
          className={styles.overlayToggle}
          onClick={() => setPanelOpen(true)}
          aria-label="ケーススタディパネルを開く"
        >
          📋 ケーススタディを表示
        </button>
        {renderInnerQuestion()}
      </div>
    </div>
  );
}
