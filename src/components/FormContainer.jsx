import { useState, useCallback, useEffect } from 'react';
import '../App.css';
import FormPage from './FormPage';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';

const FormContainer = ({ formSessionId, onSubmitSuccess }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const API_URL = 'https://forms-9hg3.onrender.com/';

  const questions = [
    { id: 'q1', text: 'What is your full name?' },
    { id: 'q2', text: 'What is your email address?' },
    { id: 'q3', text: 'What is your profession?' },
    { id: 'q4', text: 'What is your feedback or comments?' }
  ];

  const totalPages = questions.length;

  // Debounce function
  const debounce = useCallback((func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }, []);

  // Save answer to backend
  const saveAnswer = useCallback(
    async (questionId, answer) => {
      if (!formSessionId || !answer.trim()) return;

      try {
        const pageNumber = questions.findIndex(q => q.id === questionId) + 1;
        const response = await fetch(`${API_URL}/api/forms/save-answer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            session_id: formSessionId,
            question_number: pageNumber,
            answer: answer.trim()
          })
        });

        if (!response.ok) throw new Error('Failed to save answer');
        console.log(`Answer for question ${pageNumber} saved`);
      } catch (error) {
        console.error('Error saving answer:', error);
      }
    },
    [formSessionId, questions, API_URL]
  );

  // Auto-save with debounce
  const debouncedSave = useCallback(
    debounce((questionId, answer) => {
      saveAnswer(questionId, answer);
    }, 1000),
    [debounce, saveAnswer]
  );

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    debouncedSave(questionId, value);
  };

  const handleBlur = (questionId) => {
    saveAnswer(questionId, answers[questionId]);
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      saveAnswer(questions[currentPage].id, answers[questions[currentPage].id]);
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      saveAnswer(questions[currentPage].id, answers[questions[currentPage].id]);
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSubmit = async () => {
    const currentQuestion = questions[currentPage];
    if (!answers[currentQuestion.id].trim()) {
      setError('Please answer all questions before submitting.');
      return;
    }

    await saveAnswer(currentQuestion.id, answers[currentQuestion.id]);

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/forms/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: formSessionId
        })
      });

      if (!response.ok) throw new Error('Failed to submit form');
      onSubmitSuccess();
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to submit form. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Warn user before leaving if form is incomplete
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (currentPage < totalPages) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentPage, totalPages]);

  return (
    <div className="container">
      <LoadingIndicator isLoading={isLoading} />
      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      <div className="page-indicator">
        Question {currentPage + 1} of {totalPages}
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
        />
      </div>

      <FormPage
        question={questions[currentPage]}
        answer={answers[questions[currentPage].id]}
        onAnswerChange={(value) => handleAnswerChange(questions[currentPage].id, value)}
        onBlur={() => handleBlur(questions[currentPage].id)}
        onNext={handleNext}
        onPrev={handlePrev}
        onSubmit={handleSubmit}
        isFirstPage={currentPage === 0}
        isLastPage={currentPage === totalPages - 1}
      />
    </div>
  );
};

export default FormContainer;

