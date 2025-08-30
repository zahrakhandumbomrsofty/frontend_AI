import React from 'react';

const ErrorMessage = ({ message }) => {
  // If no message is provided, don't render anything
  if (!message) {
    return null;
  }

  return <div style={{ color: 'red' }}>Error: {message}</div>;
};

export default ErrorMessage;