import React, { useEffect } from 'react';
import { useIsFetching } from '@tanstack/react-query';

const GlobalLoadingIndicator: React.FC = () => {
  const isFetching = useIsFetching();
  
  useEffect(() => {
    if (isFetching) {
      document.body.classList.add('loading');
    } else {
      document.body.classList.remove('loading');
    }
    // Cleanup function to remove the class if the component unmounts
    return () => {
      document.body.classList.remove('loading');
    };
  }, [isFetching]);

  if (!isFetching) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-purple-600 text-white px-4 py-2 rounded-md shadow-md flex items-center">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Loading...</span>
      </div>
    </div>
  );
};

export default GlobalLoadingIndicator; 