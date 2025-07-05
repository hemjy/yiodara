// Google Identity Services TypeScript declarations
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (input: IdConfiguration) => void;
          prompt: (momentListener?: (res: PromptMomentNotification) => void) => void;
          renderButton: (parent: HTMLElement, options: GsiButtonConfiguration) => void;
          disableAutoSelect: () => void;
          storeCredential: (credentials: { id: string; password: string }, callback: () => void) => void;
          cancel: () => void;
          onGoogleLibraryLoad: () => void;
          revoke: (accessToken: string, done: () => void) => void;
        };
      };
    };
  }
}

interface IdConfiguration {
  client_id: string;
  callback: (handleCredentialResponse: CredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  prompt_parent_id?: string;
  nonce?: string;
  context?: string;
  state_cookie_domain?: string;
  ux_mode?: 'popup' | 'redirect';
  allowed_parent_origin?: string | string[];
  intermediate_iframe_close_callback?: () => void;
}

export interface CredentialResponse {
  credential: string;
  select_by: string;
  client_id?: string;
}

interface GsiButtonConfiguration {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: string;
  local?: string;
}

interface PromptMomentNotification {
  isDisplayMoment: () => boolean;
  isDisplayed: () => boolean;
  isNotDisplayed: () => boolean;
  getNotDisplayedReason: () => string;
  isSkippedMoment: () => boolean;
  getSkippedReason: () => string;
  isDismissedMoment: () => boolean;
  getDismissedReason: () => string;
  getMomentType: () => string;
}

export {}; 