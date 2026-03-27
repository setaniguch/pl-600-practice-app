import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ExamProvider } from './context/ExamContext';
import { ExamPage } from './pages/ExamPage';
import { ReviewPage } from './pages/ReviewPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import questionsData from './data/questions.json';
import { selectExamQuestions } from './utils/selectQuestions';
import type { Question } from './types';

const allQuestions = questionsData.questions as Question[];

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ExamProvider allQuestions={allQuestions} selectQuestions={selectExamQuestions}>
          <Routes>
            <Route path="/" element={<ExamPage />} />
            <Route path="/review" element={<ReviewPage />} />
          </Routes>
        </ExamProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
