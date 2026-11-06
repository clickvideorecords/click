import React, { useState, useRef } from 'react';
import { 
  X, Download, Upload, Cloud, FileSpreadsheet, FileJson, 
  CheckCircle, AlertTriangle, RefreshCw, ExternalLink, Sparkles, Trash2 
} from 'lucide-react';
import { CRMDatabase } from '../types';
import { 
  exportClientsToCSV, exportDatabaseToJSON, 
  analyzeImportFile, ImportPreviewData, mergeDatabases 
} from '../utils/backupUtils';
import { GOOGLE_DRIVE_FOLDER_ID, GOOGLE_DRIVE_FOLDER_URL, saveDatabaseToDriveAndLocal } from '../services/googleDrive';
import { APP_VERSION } from '../utils/version';

interface BackupMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  database: CRMDatabase;
  onUpdateDatabase: (newDb: CRMDatabase) => void;
  onForceDriveSync: () => Promise<void>;
  driveSyncStatus: {
    state: 'synced' | 'syncing' | 'error' | 'local_only';
    lastSyncedAt: string | null;
  };
}

export const BackupMigrationModal: React.FC<BackupMigrationModalProps> = ({
  isOpen,
  onClose,
  database,
  onUpdateDatabase,
  onForceDriveSync,
  driveSyncStatus
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'drive'>('export');
  const [importPreview, setImportPreview] = useState<ImportPreviewData | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [isDriveSyncing, setIsDriveSyncing] = useState(false);
  const [driveSuccessMessage, setDriveSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(null);

    try {
      const preview = await analyzeImportFile(file, database);
      setImportPreview(preview);
    } catch (err: any) {
      setImportError(err.message || 'No se pudo leer el archivo seleccionado.');
      setImportPreview(null);
    }
  };

  const applyImport = () => {
    if (!importPreview) return;

    if (importMode === 'merge') {
      const merged = mergeDatabases(database, importPreview.database);
      onUpdateDatabase(merged);
      setImportSuccess(
        `¡Fusión exitosa! Se han combinado ${importPreview.clientsCount} clientes y ${importPreview.prospectsCount} prospectos.`
      );
    } else {
      onUpdateDatabase(importPreview.database);
      setImportSuccess('¡Base de datos restaurada por completo con éxito!');
    }
    setImportPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadDriveSnapshot = async () => {
    setIsDriveSyncing(true);
    setDriveSuccessMessage(null);
    try {
      await saveDatabaseToDriveAndLocal(database);
      setDriveSuccessMessage('¡Copia de seguridad subida exitosamente a tu carpeta de Google Drive!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsDriveSyncing(false);
    }
  };

  const handleClearAllContacts = () => {
    if (window.confirm('¿Deseas eliminar los contactos de ejemplo y dejar la base de datos limpia para tus clientes reales?')) {
      onUpdateDatabase({
        ...database,
        clients: [],
        prospects: [],
        appointments: [],
        sessions: [],
        notes: [],
        files: []
      });
      setImportSuccess('¡Base de datos limpia! Se eliminaron los contactos de ejemplo.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#E8E2D8] max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E2D8] bg-[#FBF9F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C85A32] to-[#8F3717] text-white flex items-center justify-center shadow">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-xl text-[#181715]">Centro de Respaldo &amp; Migración</h2>
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-[#E8E2D8] text-stone-700 font-bold" title="Versión de base de datos (Día.Mes.Año - Hora)">
                  {database.version || APP_VERSION}
                </span>
              </div>
              <p className="text-xs text-[#78716C]">Exporta, importa y sincroniza tu base de datos con Google Drive</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#E8E2D8] text-[#78716C] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-[#E8E2D8] bg-[#FAF0EB]/40 px-6 gap-3">
          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'export'
                ? 'border-[#C85A32] text-[#C85A32]'
                : 'border-transparent text-[#78716C] hover:text-[#181715]'
            }`}
          >
            <Download className="w-4 h-4" />
            Exportar Información
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'import'
                ? 'border-[#C85A32] text-[#C85A32]'
                : 'border-transparent text-[#78716C] hover:text-[#181715]'
            }`}
          >
            <Upload className="w-4 h-4" />
            Importar / Restaurar
          </button>
          <button
            onClick={() => setActiveTab('drive')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'drive'
                ? 'border-[#C85A32] text-[#C85A32]'
                : 'border-transparent text-[#78716C] hover:text-[#181715]'
            }`}
          >
            <Cloud className="w-4 h-4" />
            Google Drive
          </button>
        </div>

        {/* Tab contents */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          {/* TAB 1: EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#FBF9F5] rounded-2xl border border-[#E8E2D8]">
                <h3 className="font-serif font-bold text-base text-[#181715] mb-1">Opciones de Descarga Directa</h3>
                <p className="text-xs text-[#78716C]">
                  Elige el formato adecuado según tus requerimientos de análisis en hojas de cálculo o respaldo completo del sistema.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Excel CSV */}
                <div className="p-4 bg-white border border-[#E8E2D8] rounded-2xl flex flex-col justify-between hover:border-emerald-400 hover:shadow-sm transition">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-[#181715]">Clientes en Excel (CSV)</h4>
                    <p className="text-xs text-[#78716C] mt-1">
                      Descarga la cartera completa con fechas, locaciones y saldos compatible con Excel (UTF-8 BOM).
                    </p>
                  </div>
                  <button
                    onClick={() => exportClientsToCSV(database.clients)}
                    className="mt-4 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar CSV
                  </button>
                </div>

                {/* JSON Database */}
                <div className="p-4 bg-white border border-[#E8E2D8] rounded-2xl flex flex-col justify-between hover:border-[#C85A32] hover:shadow-sm transition">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#FAF0EB] text-[#C85A32] flex items-center justify-center mb-3">
                      <FileJson className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-[#181715]">Respaldo Total (JSON)</h4>
                    <p className="text-xs text-[#78716C] mt-1">
                      Copia completa estructurada: clientes, prospectos, citas, sesiones de foto y notas.
                    </p>
                  </div>
                  <button
                    onClick={() => exportDatabaseToJSON(database)}
                    className="mt-4 w-full py-2.5 bg-[#C85A32] hover:bg-[#B24B25] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar JSON
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#FBF9F5] rounded-2xl border border-[#E8E2D8]">
                <h3 className="font-serif font-bold text-base text-[#181715] mb-1">Cargar o Restaurar Base de Datos</h3>
                <p className="text-xs text-[#78716C]">
                  Sube un archivo de respaldo previo en formato <code className="bg-[#FAF0EB] px-1 py-0.5 rounded text-[#C85A32]">.json</code> o un archivo <code className="bg-[#FAF0EB] px-1 py-0.5 rounded text-[#C85A32]">.csv</code> de clientes.
                </p>
              </div>

              {importSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{importSuccess}</span>
                </div>
              )}

              {importError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#D8D0C5] hover:border-[#C85A32] bg-[#FAF0EB]/20 rounded-2xl p-6 text-center cursor-pointer transition"
              >
                <Upload className="w-8 h-8 text-[#C85A32] mx-auto mb-2" />
                <p className="text-sm font-bold text-[#181715]">Haz clic para seleccionar archivo</p>
                <p className="text-xs text-[#78716C] mt-1">Archivos soportados: .json, .csv</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Preview & Choice */}
              {importPreview && (
                <div className="p-4 bg-white border border-[#E8E2D8] rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-3">
                    <span className="font-bold text-sm text-[#181715]">Registros detectados en el archivo:</span>
                    <span className="text-xs bg-[#FAF0EB] text-[#C85A32] px-2.5 py-1 rounded-full font-bold">
                      Listo para procesar
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2.5 bg-[#FBF9F5] rounded-xl border border-[#E8E2D8]">
                      <span className="font-serif font-bold text-base text-[#C85A32]">{importPreview.clientsCount}</span>
                      <p className="text-[#78716C] mt-0.5">Clientes</p>
                    </div>
                    <div className="p-2.5 bg-[#FBF9F5] rounded-xl border border-[#E8E2D8]">
                      <span className="font-serif font-bold text-base text-blue-600">{importPreview.prospectsCount}</span>
                      <p className="text-[#78716C] mt-0.5">Prospectos</p>
                    </div>
                    <div className="p-2.5 bg-[#FBF9F5] rounded-xl border border-[#E8E2D8]">
                      <span className="font-serif font-bold text-base text-amber-600">{importPreview.appointmentsCount}</span>
                      <p className="text-[#78716C] mt-0.5">Citas</p>
                    </div>
                    <div className="p-2.5 bg-[#FBF9F5] rounded-xl border border-[#E8E2D8]">
                      <span className="font-serif font-bold text-base text-purple-600">{importPreview.sessionsCount}</span>
                      <p className="text-[#78716C] mt-0.5">Sesiones</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-bold text-[#57534E]">Selecciona la modalidad de importación:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label
                        className={`p-3 rounded-xl border cursor-pointer text-xs flex items-start gap-2.5 transition ${
                          importMode === 'merge'
                            ? 'border-[#C85A32] bg-[#FAF0EB]'
                            : 'border-[#E8E2D8] bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="importMode"
                          checked={importMode === 'merge'}
                          onChange={() => setImportMode('merge')}
                          className="mt-0.5 text-[#C85A32]"
                        />
                        <div>
                          <p className="font-bold text-[#181715]">Fusionar (Recomendado)</p>
                          <p className="text-[#78716C] text-[11px] mt-0.5">
                            Agrega los nuevos registros sin borrar tus clientes o citas actuales.
                          </p>
                        </div>
                      </label>

                      <label
                        className={`p-3 rounded-xl border cursor-pointer text-xs flex items-start gap-2.5 transition ${
                          importMode === 'replace'
                            ? 'border-rose-400 bg-rose-50'
                            : 'border-[#E8E2D8] bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="importMode"
                          checked={importMode === 'replace'}
                          onChange={() => setImportMode('replace')}
                          className="mt-0.5 text-rose-600"
                        />
                        <div>
                          <p className="font-bold text-rose-700">Reemplazar Todo</p>
                          <p className="text-[#78716C] text-[11px] mt-0.5">
                            Sobrescribe la base de datos completa con el contenido de este archivo.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={applyImport}
                    className="w-full py-2.5 bg-[#C85A32] hover:bg-[#B24B25] text-white text-xs font-bold rounded-xl transition shadow flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Confirmar e Importar Ahora
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DRIVE */}
          {activeTab === 'drive' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#FBF9F5] rounded-2xl border border-[#E8E2D8] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-[#181715]">Carpeta de Google Drive Vinculada</span>
                  </div>
                  <a
                    href={GOOGLE_DRIVE_FOLDER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#C85A32] hover:underline font-bold"
                  >
                    Abrir en Drive
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="bg-white p-3 rounded-xl border border-[#E8E2D8] text-xs font-mono break-all text-[#57534E]">
                  ID: {GOOGLE_DRIVE_FOLDER_ID}
                </div>

                <p className="text-xs text-[#78716C]">
                  El archivo <strong className="text-[#181715]">click_videorecords_database.json</strong> se actualiza automáticamente con cada cambio y se consulta cada vez que inicias sesión.
                </p>
              </div>

              {driveSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{driveSuccessMessage}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleUploadDriveSnapshot}
                  disabled={isDriveSyncing}
                  className="flex-1 py-3 bg-[#C85A32] hover:bg-[#B24B25] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow"
                >
                  <RefreshCw className={`w-4 h-4 ${isDriveSyncing ? 'animate-spin' : ''}`} />
                  Subir Instantánea a Google Drive
                </button>
                <button
                  onClick={async () => {
                    setIsDriveSyncing(true);
                    await onForceDriveSync();
                    setIsDriveSyncing(false);
                    setDriveSuccessMessage('¡Sincronizado con éxito con Google Drive!');
                  }}
                  disabled={isDriveSyncing}
                  className="px-4 py-3 bg-white hover:bg-[#F4EFEA] text-[#181715] border border-[#E8E2D8] rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <Cloud className="w-4 h-4 text-emerald-600" />
                  Forzar Lectura de Drive
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E8E2D8] bg-[#FBF9F5] flex items-center justify-between">
          <button
            onClick={handleClearAllContacts}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-rose-200"
            title="Borrar todos los contactos y registros de ejemplo"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Borrar Ejemplos de Contactos
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#F4EFEA] hover:bg-[#E8E2D8] text-[#57534E] text-xs font-bold rounded-xl transition"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
