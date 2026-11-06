export type EventType = 'Boda' | 'XV Años' | 'Graduación' | 'Social' | 'Empresarial';

export type ProspectStatus = 'Nuevo' | 'Contactado' | 'Cotizado' | 'Ganado' | 'Perdido';

export type PriorityLevel = 'Alta' | 'Media' | 'Baja';

export type AppointmentType = 'Presencial' | 'Videollamada' | 'Llamada telefónica';

export type AppointmentStatus = 'Programada' | 'Confirmada' | 'Realizada' | 'Cancelada';

export type SessionType = 
  | 'Casual Pre-Boda'
  | 'Vestido XV Años'
  | 'Save the Date'
  | 'Trash the Dress'
  | 'Playa / Cenote'
  | 'Estudio'
  | 'Scouting de Locación'
  | 'Otro';

export type SessionStatus = 'Pendiente' | 'Confirmada' | 'Realizada' | 'En edición' | 'Entregada';

export interface FileAttachment {
  id: string;
  name: string;
  url?: string;
  dataUrl?: string; // For captured camera photos or uploaded local files
  textContent?: string; // For TXT text files to view and edit directly
  size?: string;
  mimeType?: string;
  uploadedAt: string;
  relatedType: 'client' | 'prospect' | 'general';
  relatedId?: string;
  isFromCamera?: boolean;
}

export interface Session {
  id: string;
  clientId: string;
  clientName: string;
  type: SessionType;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
  photographer: string;
  status: SessionStatus;
  notes?: string;
}

export interface Client {
  id: string;
  name: string; // Nombre de cliente
  partnerName?: string; // Nombre de celebrado o celebrados
  eventType: EventType;
  eventDate: string; // YYYY-MM-DD
  eventTime?: string;
  location?: string; // Hacienda, Salón, Quinta (opcional)
  church?: string; // Iglesia / Templo / Capilla
  sessionLocation?: string; // Lugar de sesión fotográfica o de video
  city?: string; // Mérida, Progreso, Valladolid, etc.
  packageContracted: string;
  totalPrice: number;
  advancePaid: number;
  balanceDue: number;
  phone: string;
  email: string;
  isVip?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  sessions?: Session[];
  files?: FileAttachment[];
}

export interface Prospect {
  id: string;
  name: string;
  eventType: EventType;
  estimatedDate?: string;
  phone: string;
  email: string;
  budget?: number;
  interestedPackage: string;
  status: ProspectStatus;
  priority: PriorityLevel;
  notes?: string;
  createdAt: string;
  convertedToClientId?: string;
  files?: FileAttachment[];
}

export interface Appointment {
  id: string;
  title: string;
  type: AppointmentType;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  relatedTo: {
    type: 'client' | 'prospect' | 'general';
    id: string;
    name: string;
    phone?: string;
  };
  locationOrLink: string;
  status: AppointmentStatus;
  notes?: string;
  tags?: string[];
  files?: FileAttachment[];
  callHistory?: {
    id: string;
    date: string;
    time: string;
    notes: string;
    outcome?: string;
  }[];
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  relatedType: 'client' | 'prospect' | 'general';
  relatedId?: string;
  relatedName?: string;
  category: 'General' | 'Contrato' | 'Notas' | 'Requerimiento Técnico' | 'Logística' | 'Guion de Video';
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  email: string;
  displayName: string;
  photoURL?: string;
  isGoogleAuthenticated: boolean;
  driveFolderId: string;
}

export interface CRMDatabase {
  version: string;
  lastUpdated: string;
  clients: Client[];
  prospects: Prospect[];
  appointments: Appointment[];
  sessions: Session[];
  notes: NoteItem[];
  files: FileAttachment[];
}
