import type { Question, UserAnswer } from '../../types';
import styles from './Questions.module.css';

interface Props {
  question: Question;
  answer: UserAnswer | undefined;
  onAnswer: (answer: UserAnswer) => void;
}

export function YesNoQuestion({ question, answer, onAnswer }: Props) {
  const answers: Record<string, boolean> =
    answer?.type === 'yesno' ? answer.answers : {};

  const handleChange = (statementId: string, value: boolean) => {
    onAnswer({
      type: 'yesno',
      answers: { ...answers, [statementId]: value },
    });
  };

  return (
    <table className={styles.statementTable}>
      <thead>
        <tr>
          <th>ステートメント</th>
          <th>Yes</th>
          <th>No</th>
        </tr>
      </thead>
      <tbody>
        {question.statements?.map((stmt) => (
          <tr key={stmt.id}>
            <td>{stmt.text}</td>
            <td>
              <input
                type="radio"
                name={`yn-${question.id}-${stmt.id}`}
                checked={answers[stmt.id] === true}
                onChange={() => handleChange(stmt.id, true)}
                aria-label={`${stmt.text} - Yes`}
              />
            </td>
            <td>
              <input
                type="radio"
                name={`yn-${question.id}-${stmt.id}`}
                checked={answers[stmt.id] === false}
                onChange={() => handleChange(stmt.id, false)}
                aria-label={`${stmt.text} - No`}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
