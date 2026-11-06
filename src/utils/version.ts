/**
 * Genera el nombre de versión combinando Día, Mes, Año y Hora
 * Formato: vDD.MM.YYYY-HH:mm (ej. v05.11.2026-20:30)
 */
export function generateVersionName(date: Date = new Date()): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `v${day}.${month}.${year}-${hours}:${minutes}`;
}

export const APP_VERSION = generateVersionName(new Date(2026, 10, 5, 20, 30));
