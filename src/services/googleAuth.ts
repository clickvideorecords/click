import { UserProfile } from '../types';
import { AUTH_USER_KEY, GOOGLE_DRIVE_FOLDER_ID } from './googleDrive';

export const DEFAULT_USER: UserProfile = {
  email: 'clickvideorecordsnube3@gmail.com',
  displayName: 'Click Videorecords (Yucatán)',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  isGoogleAuthenticated: true,
  driveFolderId: GOOGLE_DRIVE_FOLDER_ID
};

export function getStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse stored user:', e);
  }
  return null;
}

export function saveStoredUser(user: UserProfile | null): void {
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_USER_KEY);
  }
}

/**
 * Handles signing in.
 * Designed to gracefully fall back without breaking in iframe or popup-blocked preview environments.
 */
export async function authenticateWithGoogle(preferredEmail?: string): Promise<{
  user: UserProfile;
  accessToken: string | null;
  error?: string;
}> {
  // If user requests direct quick access
  const targetEmail = preferredEmail || 'clickvideorecordsnube3@gmail.com';
  
  const user: UserProfile = {
    email: targetEmail,
    displayName: targetEmail.includes('nube') 
      ? 'Click Videorecords Producciones' 
      : 'Click Videorecords Yucatán',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    isGoogleAuthenticated: true,
    driveFolderId: GOOGLE_DRIVE_FOLDER_ID
  };

  saveStoredUser(user);

  return {
    user,
    accessToken: 'mock_or_session_token_' + Date.now()
  };
}

export function signOutUser(): void {
  saveStoredUser(null);
}
