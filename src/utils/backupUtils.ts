import { Client, CRMDatabase, Prospect, Appointment, Session } from '../types';
import { APP_VERSION, generateVersionName } from './version';

/**
 * Exports clients to Excel-compatible CSV with UTF-8 BOM
 */
export function exportClientsToCSV(clients: Client[]): void {
  const headers = [
    'ID',
    'Cliente / Pareja',
    'Festejado(a) / Pareja',
    'Tipo de Evento',
    'Fecha de Evento',
    'Hora',
    'Locación (Hacienda/Salón)',
    'Ciudad',
    'Paquete Contratado',
    'Precio Total (MXN)',
    'Anticipo Pagado (MXN)',
    'Saldo Pendiente (MXN)',
    'Teléfono',
    'Email',
    'Es VIP',
    'Notas y Requerimientos',
    'Fecha de Registro'
  ];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = clients.map((c) => [
    escapeCSV(c.id),
    escapeCSV(c.name),
    escapeCSV(c.partnerName || ''),
    escapeCSV(c.eventType),
    escapeCSV(c.eventDate),
    escapeCSV(c.eventTime || ''),
    escapeCSV(c.location),
    escapeCSV(c.city || 'Mérida, Yucatán'),
    escapeCSV(c.packageContracted),
    escapeCSV(c.totalPrice),
    escapeCSV(c.advancePaid),
    escapeCSV(c.balanceDue),
    escapeCSV(c.phone),
    escapeCSV(c.email),
    escapeCSV(c.isVip ? 'SÍ' : 'NO'),
    escapeCSV(c.notes || ''),
    escapeCSV(c.createdAt)
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `clientes_click_videorecords_${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports complete database to JSON
 */
export function exportDatabaseToJSON(db: CRMDatabase): void {
  const dataStr = JSON.stringify(db, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `respaldo_click_videorecords_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface ImportPreviewData {
  clientsCount: number;
  prospectsCount: number;
  appointmentsCount: number;
  sessionsCount: number;
  notesCount: number;
  database: CRMDatabase;
}

/**
 * Reads and analyzes an imported file (.json or .csv)
 */
export async function analyzeImportFile(file: File, currentDb: CRMDatabase): Promise<ImportPreviewData> {
  const text = await file.text();

  if (file.name.endsWith('.json') || text.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(text);
      const clients: Client[] = Array.isArray(parsed.clients) ? parsed.clients : [];
      const prospects: Prospect[] = Array.isArray(parsed.prospects) ? parsed.prospects : [];
      const appointments: Appointment[] = Array.isArray(parsed.appointments) ? parsed.appointments : [];
      const sessions: Session[] = Array.isArray(parsed.sessions) ? parsed.sessions : [];
      const notes = Array.isArray(parsed.notes) ? parsed.notes : [];
      const files = Array.isArray(parsed.files) ? parsed.files : [];

      const newDb: CRMDatabase = {
        version: parsed.version || APP_VERSION,
        lastUpdated: new Date().toISOString(),
        clients,
        prospects,
        appointments,
        sessions,
        notes,
        files
      };

      return {
        clientsCount: clients.length,
        prospectsCount: prospects.length,
        appointmentsCount: appointments.length,
        sessionsCount: sessions.length,
        notesCount: notes.length,
        database: newDb
      };
    } catch (err) {
      throw new Error('El archivo JSON no tiene un formato válido.');
    }
  } else if (file.name.endsWith('.csv') || text.includes(',')) {
    // Parse CSV simple client rows
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) {
      throw new Error('El archivo CSV está vacío.');
    }

    const importedClients: Client[] = [];
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Basic CSV token parser
      const cols: string[] = [];
      let inQuotes = false;
      let currentVal = '';
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"' && (j === 0 || line[j - 1] !== '\\')) {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          cols.push(currentVal.trim().replace(/^"|"$/g, ''));
          currentVal = '';
        } else {
          currentVal += char;
        }
      }
      cols.push(currentVal.trim().replace(/^"|"$/g, ''));

      if (cols.length >= 2 && cols[1]) {
        const name = cols[1];
        const eventType = (cols[3] as any) || 'Boda';
        const eventDate = cols[4] || new Date().toISOString().split('T')[0];
        const location = cols[6] || 'Mérida, Yucatán';
        const packageContracted = cols[8] || 'Paquete Básico';
        const totalPrice = Number(cols[9]) || 25000;
        const advancePaid = Number(cols[10]) || 10000;
        const phone = cols[12] || '+52 999 000 0000';
        const email = cols[13] || '';

        importedClients.push({
          id: cols[0] || `cli-imp-${Date.now()}-${i}`,
          name,
          partnerName: cols[2] || '',
          eventType,
          eventDate,
          eventTime: cols[5] || '17:00',
          location,
          city: cols[7] || 'Mérida',
          packageContracted,
          totalPrice,
          advancePaid,
          balanceDue: Math.max(0, totalPrice - advancePaid),
          phone,
          email,
          isVip: cols[14] === 'SÍ',
          notes: cols[15] || '',
          createdAt: new Date().toISOString()
        });
      }
    }

    const newDb: CRMDatabase = {
      ...currentDb,
      lastUpdated: new Date().toISOString(),
      clients: importedClients
    };

    return {
      clientsCount: importedClients.length,
      prospectsCount: currentDb.prospects.length,
      appointmentsCount: currentDb.appointments.length,
      sessionsCount: currentDb.sessions.length,
      notesCount: currentDb.notes.length,
      database: newDb
    };
  }

  throw new Error('Formato no compatible. Por favor sube un archivo .json o .csv.');
}

/**
 * Merges imported database into current database without deleting existing data
 */
export function mergeDatabases(current: CRMDatabase, imported: CRMDatabase): CRMDatabase {
  const clientMap = new Map<string, Client>();
  current.clients.forEach((c) => clientMap.set(c.id, c));
  imported.clients.forEach((c) => {
    // If id exists, update or assign new id if different name
    if (clientMap.has(c.id) && clientMap.get(c.id)!.name !== c.name) {
      const newId = `cli-merged-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      clientMap.set(newId, { ...c, id: newId });
    } else {
      clientMap.set(c.id, c);
    }
  });

  const prospectMap = new Map<string, Prospect>();
  current.prospects.forEach((p) => prospectMap.set(p.id, p));
  imported.prospects.forEach((p) => prospectMap.set(p.id, p));

  const appointmentMap = new Map<string, Appointment>();
  current.appointments.forEach((a) => appointmentMap.set(a.id, a));
  imported.appointments.forEach((a) => appointmentMap.set(a.id, a));

  const sessionMap = new Map<string, Session>();
  current.sessions.forEach((s) => sessionMap.set(s.id, s));
  imported.sessions.forEach((s) => sessionMap.set(s.id, s));

  return {
    version: generateVersionName(),
    lastUpdated: new Date().toISOString(),
    clients: Array.from(clientMap.values()),
    prospects: Array.from(prospectMap.values()),
    appointments: Array.from(appointmentMap.values()),
    sessions: Array.from(sessionMap.values()),
    notes: [...current.notes, ...imported.notes.filter((n) => !current.notes.some((cn) => cn.id === n.id))],
    files: [...current.files, ...imported.files.filter((f) => !current.files.some((cf) => cf.id === f.id))]
  };
}
