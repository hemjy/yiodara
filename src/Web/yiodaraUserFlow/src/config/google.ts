// Google Authentication Configuration
export const GOOGLE_CONFIG = {
  // You'll need to replace this with your actual Google Client ID
  // Get it from: https://console.cloud.google.com/
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id-here.apps.googleusercontent.com',
  
  // Scopes for Google Authentication
  SCOPES: [
    'email',
    'profile'
  ],
  
  // Button configuration
  BUTTON_CONFIG: {
    type: 'standard' as const,
    theme: 'outline' as const,
    size: 'large' as const,
    text: 'continue_with' as const,
    shape: 'rectangular' as const,
    logo_alignment: 'left' as const,
    width: '300' as const,
  }
};

export default GOOGLE_CONFIG; 