import type { Question, UserAnswer } from '../../types';
import styles from './Questions.module.css';

interface Props {
  question: Question;
  answer: UserAnswer | undefined;
  onAnswer: (answer: UserAnswer) => void;
}

export function SingleChoiceQuestion({ question, answer, onAnswer }: Props) {
  const selectedId = answer?.type === 'single' ? answer.optionId : '';

  return (
    <ul className={styles.optionList} role="radiogroup" aria-label="選択肢">
      {question.options?.map((opt) => (
        <li key={opt.id}>
          <label
            className={`${styles.optionLabel} ${selectedId === opt.id ? styles.optionLabelSelected : ''}`}
          >
            <input
              type="radio"
              name={`q-${question.id}`}
              checked={selectedId === opt.id}
              onChange={() => onAnswer({ type: 'single', optionId: opt.id })}
            />
            {opt.text}
          </label>
        </li>
      ))}
    </ul>
  );
}
