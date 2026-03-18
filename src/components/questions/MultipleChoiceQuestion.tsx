import type { Question, UserAnswer } from '../../types';
import styles from './Questions.module.css';

interface Props {
  question: Question;
  answer: UserAnswer | undefined;
  onAnswer: (answer: UserAnswer) => void;
}

export function MultipleChoiceQuestion({ question, answer, onAnswer }: Props) {
  const selectedIds: string[] = answer?.type === 'multiple' ? answer.optionIds : [];

  const toggle = (optId: string) => {
    const next = selectedIds.includes(optId)
      ? selectedIds.filter((id) => id !== optId)
      : [...selectedIds, optId];
    onAnswer({ type: 'multiple', optionIds: next });
  };

  return (
    <>
      {question.requiredSelections && (
        <p className={styles.requiredNote}>
          {question.requiredSelections} つ選択してください
        </p>
      )}
      <ul className={styles.optionList} aria-label="選択肢">
        {question.options?.map((opt) => {
          const checked = selectedIds.includes(opt.id);
          return (
            <li key={opt.id}>
              <label
                className={`${styles.optionLabel} ${checked ? styles.optionLabelSelected : ''}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(opt.id)}
                />
                {opt.text}
              </label>
            </li>
          );
        })}
      </ul>
    </>
  );
}
