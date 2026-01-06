import { useEffect, useState } from 'react';

const ErrorMessage = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="error-message">
      {message}
    </div>
  );
};

export default ErrorMessage;
