import './App.css';
import { useState, useEffect } from 'react';
import FormContainer from './components/FormContainer';
import SuccessPage from './components/SuccessPage';

function App() {
  const [formSessionId, setFormSessionId] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const API_URL = 'http://localhost:8000';

  useEffect(() => {
    initializeForm();
  }, []);

  const initializeForm = async () => {
    try {
      const response = await fetch(`${API_URL}/api/forms/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (!response.ok) throw new Error('Failed to initialize form');
      const data = await response.json();
      setFormSessionId(data.session_id);
      console.log('Form session initialized:', data.session_id);
    } catch (error) {
      console.error('Error initializing form:', error);
    }
  };

  return (
    <>
      {!isSubmitted ? (
        <FormContainer 
          formSessionId={formSessionId} 
          onSubmitSuccess={() => setIsSubmitted(true)}
        />
      ) : (
        <SuccessPage />
      )}
    </>
  );
}

export default App;
