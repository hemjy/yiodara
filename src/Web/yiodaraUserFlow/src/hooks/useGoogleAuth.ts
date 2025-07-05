import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import GOOGLE_CONFIG from '../config/google';

export const useGoogleAuth = () => {
  const { initializeGoogleAuth } = useAuth();

  useEffect(() => {
    // Initialize Google Auth when the component mounts
    const initializeGoogle = () => {
      if (typeof window !== 'undefined' && window.google && GOOGLE_CONFIG.CLIENT_ID !== 'your-google-client-id-here.apps.googleusercontent.com') {
        initializeGoogleAuth(GOOGLE_CONFIG.CLIENT_ID);
      }
    };

    // Check if Google library is already loaded
    if (typeof window !== 'undefined' && window.google) {
      initializeGoogle();
    } else {
      // Wait for Google library to load
      const checkGoogleLoaded = () => {
        if (typeof window !== 'undefined' && window.google) {
          initializeGoogle();
        } else {
          setTimeout(checkGoogleLoaded, 100);
        }
      };
      checkGoogleLoaded();
    }
  }, [initializeGoogleAuth]);

  const renderGoogleButton = (elementId: string, customOptions?: any) => {
    if (typeof window !== 'undefined' && window.google && GOOGLE_CONFIG.CLIENT_ID !== 'your-google-client-id-here.apps.googleusercontent.com') {
      const element = document.getElementById(elementId);
      if (element) {
        window.google.accounts.id.renderButton(element, {
          ...GOOGLE_CONFIG.BUTTON_CONFIG,
          ...customOptions
        });
      }
    }
  };

  return {
    renderGoogleButton,
    isGoogleReady: typeof window !== 'undefined' && !!window.google && GOOGLE_CONFIG.CLIENT_ID !== 'your-google-client-id-here.apps.googleusercontent.com'
  };
};

export default useGoogleAuth;
 