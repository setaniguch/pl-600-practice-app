import type { Question, UserAnswer } from '../../types';
import styles from './Questions.module.css';

interface Props {
  question: Question;
  answer: UserAnswer | undefined;
  onAnswer: (answer: UserAnswer) => void;
}

export function DropdownQuestion({ question, answer, onAnswer }: Props) {
  const selections: Record<string, string> =
    answer?.type === 'dropdown' ? answer.selections : {};

  const handleChange = (slotId: string, optionId: string) => {
    onAnswer({
      type: 'dropdown',
      selections: { ...selections, [slotId]: optionId },
    });
  };

  return (
    <div className={styles.dropdownGroup}>
      {question.dropdowns?.map((slot) => (
        <div key={slot.id} className={styles.dropdownSlot}>
          <label className={styles.dropdownLabel} htmlFor={`dd-${slot.id}`}>
            {slot.label}
          </label>
          <select
            id={`dd-${slot.id}`}
            className={styles.dropdownSelect}
            value={selections[slot.id] ?? ''}
            onChange={(e) => handleChange(slot.id, e.target.value)}
          >
            <option value="">-- 選択してください --</option>
            {slot.options.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.text}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
