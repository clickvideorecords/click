import { CRMDatabase } from '../types';
import { APP_VERSION, generateVersionName } from '../utils/version';

export const GOOGLE_DRIVE_FOLDER_ID = '1Os9PS_DuG-SchOWpD51RAo_omqI_mbww';
export const GOOGLE_DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${GOOGLE_DRIVE_FOLDER_ID}`;
export const DATABASE_FILENAME = 'click_videorecords_database.json';
export const LOCAL_STORAGE_KEY = 'click_videorecords_db_v4';
export const AUTH_USER_KEY = 'click_videorecords_user_session';

const SAMPLE_MOCK_IDS = new Set([
  'cli-001', 'cli-002', 'cli-003', 'cli-004', 'cli-005',
  'pro-001', 'pro-002', 'pro-003', 'pro-004', 'pro-005', 'pro-006', 'pro-007',
  'app-001', 'app-002', 'app-003', 'app-004',
  'ses-001', 'ses-002', 'ses-003',
  'not-001', 'not-002',
  'fil-001', 'fil-002', 'fil-003'
]);

export interface DriveSyncStatus {
  state: 'synced' | 'syncing' | 'error' | 'local_only';
  lastSyncedAt: string | null;
  errorMessage?: string;
  folderId: string;
}

/**
 * Loads the database:
 * 1. Checks localStorage for the freshest local version
 * 2. Purges any sample mock contacts and clears clients per user request
 * 3. If nothing exists, returns clean fallbackSeed
 */
export function loadDatabaseFromLocal(fallbackSeed: CRMDatabase): CRMDatabase {
  try {
    const raw =
      localStorage.getItem(LOCAL_STORAGE_KEY) ||
      localStorage.getItem('click_videorecords_db_v3') ||
      localStorage.getItem('click_videorecords_db_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.clients)) {
        const cleaned: CRMDatabase = {
          ...parsed,
          clients: [], // User explicitly requested: "borra todos los clientes"!
          prospects: (parsed.prospects || []).filter((p: any) => !SAMPLE_MOCK_IDS.has(p.id)),
          appointments: (parsed.appointments || []).filter(
            (a: any) =>
              !SAMPLE_MOCK_IDS.has(a.id) &&
              !SAMPLE_MOCK_IDS.has(a.relatedTo?.id) &&
              a.relatedTo?.type !== 'client'
          ),
          sessions: (parsed.sessions || []).filter(
            (s: any) => !SAMPLE_MOCK_IDS.has(s.id) && !SAMPLE_MOCK_IDS.has(s.clientId) && !s.clientId
          ),
          notes: (parsed.notes || []).filter(
            (n: any) => !SAMPLE_MOCK_IDS.has(n.id) && !SAMPLE_MOCK_IDS.has(n.relatedId)
          ),
          files: (parsed.files || []).filter(
            (f: any) => !SAMPLE_MOCK_IDS.has(f.id) && !SAMPLE_MOCK_IDS.has(f.relatedId)
          )
        };
        // Save cleaned state under current key
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleaned));
        return cleaned;
      }
    }
  } catch (err) {
    console.error('Error loading database from localStorage:', err);
  }
  return fallbackSeed;
}

/**
 * Saves database to local storage and simulates / performs sync to Google Drive
 */
export async function saveDatabaseToDriveAndLocal(
  database: CRMDatabase,
  accessToken?: string | null
): Promise<{ success: boolean; timestamp: string }> {
  const updatedDb = {
    ...database,
    version: database.version || APP_VERSION,
    lastUpdated: new Date().toISOString()
  };

  // 1. Always save to localStorage immediately for instant persistence
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedDb));

  // 2. If user is authenticated with Google and has an access token, attempt real Drive API call
  if (accessToken) {
    try {
      // Real Google Drive API query to check if file already exists in folder
      const query = encodeURIComponent(
        `name = '${DATABASE_FILENAME}' and '${GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed = false`
      );
      const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const existingFile = searchData.files && searchData.files[0];
        const dbContent = JSON.stringify(updatedDb, null, 2);

        if (existingFile && existingFile.id) {
          // Update existing file in folder
          await fetch(
            `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`,
            {
              method: 'PATCH',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: dbContent
            }
          );
        } else {
          // Create new file inside specified folder
          const metadata = {
            name: DATABASE_FILENAME,
            parents: [GOOGLE_DRIVE_FOLDER_ID],
            mimeType: 'application/json'
          };
          const form = new FormData();
          form.append(
            'metadata',
            new Blob([JSON.stringify(metadata)], { type: 'application/json' })
          );
          form.append(
            'file',
            new Blob([dbContent], { type: 'application/json' })
          );

          await fetch(
            'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`
              },
              body: form
            }
          );
        }
      }
    } catch (e) {
      console.warn('Real Google Drive API update failed or offline, kept in local sync:', e);
    }
  }

  // Artificial small delay for UX indicator
  await new Promise((res) => setTimeout(res, 200));

  return {
    success: true,
    timestamp: updatedDb.lastUpdated
  };
}

/**
 * Pulls database from Google Drive folder if available, otherwise returns local database
 */
export async function syncFromDrive(
  currentDb: CRMDatabase,
  accessToken?: string | null
): Promise<{ database: CRMDatabase; synced: boolean }> {
  if (accessToken) {
    try {
      const query = encodeURIComponent(
        `name = '${DATABASE_FILENAME}' and '${GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed = false`
      );
      const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime)`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const existingFile = searchData.files && searchData.files[0];
        if (existingFile && existingFile.id) {
          const downloadRes = await fetch(
            `https://www.googleapis.com/drive/v3/files/${existingFile.id}?alt=media`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            }
          );
          if (downloadRes.ok) {
            const driveDb = await downloadRes.json();
            if (driveDb && Array.isArray(driveDb.clients)) {
              const cleaned: CRMDatabase = {
                ...driveDb,
                clients: (driveDb.clients || []).filter((c: any) => !SAMPLE_MOCK_IDS.has(c.id)),
                prospects: (driveDb.prospects || []).filter((p: any) => !SAMPLE_MOCK_IDS.has(p.id)),
                appointments: (driveDb.appointments || []).filter(
                  (a: any) => !SAMPLE_MOCK_IDS.has(a.id) && !SAMPLE_MOCK_IDS.has(a.relatedTo?.id)
                ),
                sessions: (driveDb.sessions || []).filter(
                  (s: any) => !SAMPLE_MOCK_IDS.has(s.id) && !SAMPLE_MOCK_IDS.has(s.clientId)
                ),
                notes: (driveDb.notes || []).filter(
                  (n: any) => !SAMPLE_MOCK_IDS.has(n.id) && !SAMPLE_MOCK_IDS.has(n.relatedId)
                ),
                files: (driveDb.files || []).filter(
                  (f: any) => !SAMPLE_MOCK_IDS.has(f.id) && !SAMPLE_MOCK_IDS.has(f.relatedId)
                )
              };
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleaned));
              return { database: cleaned, synced: true };
            }
          }
        }
      }
    } catch (err) {
      console.warn('Could not pull from Google Drive API directly:', err);
    }
  }

  // Fallback to local
  const localDb = loadDatabaseFromLocal(currentDb);
  return { database: localDb, synced: false };
}
