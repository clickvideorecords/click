import { CRMDatabase } from './types';
import { APP_VERSION } from './utils/version';

export const INITIAL_DATABASE: CRMDatabase = {
  version: APP_VERSION,
  lastUpdated: new Date().toISOString(),
  clients: [],
  prospects: [],
  appointments: [],
  sessions: [],
  notes: [],
  files: []
};
