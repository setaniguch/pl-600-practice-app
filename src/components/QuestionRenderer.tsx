import { useExam } from '../context/ExamContext';
import { SingleChoiceQuestion } from './questions/SingleChoiceQuestion';
import { MultipleChoiceQuestion } from './questions/MultipleChoiceQuestion';
import { DropdownQuestion } from './questions/DropdownQuestion';
import { YesNoQuestion } from './questions/YesNoQuestion';
import { OrderingQuestion } from './questions/OrderingQuestion';
import { CaseStudyQuestion } from './questions/CaseStudyQuestion';
import type { UserAnswer } from '../types';

export function QuestionRenderer() {
  const { currentQuestion, currentAnswer, state, totalCount, dispatch } = useExam();

  if (!currentQuestion) {
    return <p>問題データが見つかりません。</p>;
  }

  const handleAnswer = (answer: UserAnswer) => {
    dispatch({ type: 'SET_ANSWER', questionId: currentQuestion.id, answer });
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'single-choice':
        return (
          <SingleChoiceQuestion
            question={currentQuestion}
            answer={currentAnswer}
            onAnswer={handleAnswer}
          />
        );
      case 'multiple-choice':
        return (
          <MultipleChoiceQuestion
            question={currentQuestion}
            answer={currentAnswer}
            onAnswer={handleAnswer}
          />
        );
      case 'dropdown':
        return (
          <DropdownQuestion
            question={currentQuestion}
            answer={currentAnswer}
            onAnswer={handleAnswer}
          />
        );
      case 'yes-no':
        return (
          <YesNoQuestion
            question={currentQuestion}
            answer={currentAnswer}
            onAnswer={handleAnswer}
          />
        );
      case 'ordering':
        return (
          <OrderingQuestion
            question={currentQuestion}
            answer={currentAnswer}
            onAnswer={handleAnswer}
          />
        );
      case 'case-study':
        return (
          <CaseStudyQuestion
            question={currentQuestion}
            answer={currentAnswer}
            onAnswer={handleAnswer}
          />
        );
      default:
        return <p>未対応の問題形式です。</p>;
    }
  };

  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '8px' }}>
        問題 {state.currentIndex + 1} / {totalCount}
      </p>
      <div
        style={{ fontSize: '16px', lineHeight: 1.6, color: 'var(--text-h)', marginBottom: '20px', whiteSpace: 'pre-wrap' }}
        dangerouslySetInnerHTML={{ __html: currentQuestion.text }}
      />
      {renderQuestion()}
    </div>
  );
}
