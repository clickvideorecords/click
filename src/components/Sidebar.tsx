import React from 'react';
import { 
  LayoutDashboard, Users, UserCheck, Clock, Video, 
  Calendar, FileText, Database, Cloud, ExternalLink, 
  RefreshCw, Sparkles, LogOut, Globe, ShieldCheck 
} from 'lucide-react';
import { CRMDatabase, UserProfile } from '../types';
import { GOOGLE_DRIVE_FOLDER_URL, GOOGLE_DRIVE_FOLDER_ID } from '../services/googleDrive';
import { APP_VERSION } from '../utils/version';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  database: CRMDatabase;
  user: UserProfile;
  onOpenBackupModal: () => void;
  onForceDriveSync: () => Promise<void>;
  driveSyncStatus: {
    state: 'synced' | 'syncing' | 'error' | 'local_only';
    lastSyncedAt: string | null;
  };
  onSignOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  database,
  user,
  onOpenBackupModal,
  onForceDriveSync,
  driveSyncStatus,
  onSignOut
}) => {
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    await onForceDriveSync();
    setIsSyncing(false);
  };

  const tentativeProspectsCount = database.prospects.filter((p) => p.estimatedDate).length;

  const navItems = [
    { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
    { id: 'clients', label: 'Clientes', icon: UserCheck, count: database.clients.length },
    { id: 'prospects', label: 'Prospectos', icon: Users, count: database.prospects.length },
    { id: 'calendar-prospects', label: 'Cal. Prospectos', icon: Calendar, count: tentativeProspectsCount, isHighlight: true },
    { id: 'calendar', label: 'Cal. Clientes', icon: Calendar, count: database.clients.length },
    { id: 'appointments', label: 'Citas', icon: Clock, count: database.appointments.length },
    { id: 'sessions', label: 'Sesiones Foto/Video', icon: Video, count: database.sessions.length },
    { id: 'notes', label: 'Notas & Drive', icon: FileText, count: database.notes.length }
  ];

  return (
    <aside className="w-64 bg-[#181715] text-[#D8D0C5] flex flex-col justify-between border-r border-[#33302B] shrink-0 h-screen sticky top-0 overflow-y-auto">
      
      {/* Top Google Drive Status */}
      <div className="p-5 space-y-4">

        {/* Google Drive Card */}
        <div className="p-3.5 bg-[#22201D] border border-[#33302B] rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">Google Drive</span>
            </div>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="text-[#A8A29E] hover:text-white transition p-1"
              title="Forzar sincronización ahora"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#C85A32]' : ''}`} />
            </button>
          </div>

          <p className="text-[10px] text-[#A8A29E] truncate">
            Carpeta: <strong className="text-white font-mono">{GOOGLE_DRIVE_FOLDER_ID.substring(0, 10)}...</strong>
          </p>

          <a
            href={GOOGLE_DRIVE_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-1.5 px-2 bg-[#282624] hover:bg-[#33302B] text-emerald-400 border border-[#3E3A35] rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5"
          >
            <Cloud className="w-3.5 h-3.5" />
            Abrir en Drive
            <ExternalLink className="w-3 h-3 text-[#A8A29E]" />
          </a>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-[#C85A32] text-white shadow-sm'
                    : 'text-[#A8A29E] hover:text-white hover:bg-[#22201D]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#282624] text-[#A8A29E]'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Backup Modal Shortcut */}
        <button
          onClick={onOpenBackupModal}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#A8A29E] hover:text-white hover:bg-[#22201D] transition"
        >
          <Database className="w-4 h-4 text-emerald-500" />
          <span>Respaldar &amp; Migrar</span>
        </button>

        {/* Enlaces Externos del Estudio */}
        <div className="pt-2 border-t border-[#33302B]/60 space-y-1.5">
          <p className="px-3.5 text-[10px] font-bold text-[#78716C] uppercase tracking-wider">
            Portales Click
          </p>
          <a
            href="https://clickvideorecords.com.mx/control.html"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition group"
            title="Abrir Control Interno (clickvideorecords.com.mx/control.html)"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Control Interno</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-amber-400/70 group-hover:text-amber-400" />
          </a>
          <a
            href="https://www.clickvideorecords.com.mx"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-[#A8A29E] hover:text-white hover:bg-[#22201D] transition group"
            title="Ir al sitio web oficial"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#C85A32]" />
              <span className="truncate">Sitio Web Oficial</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-[#78716C] group-hover:text-white" />
          </a>
        </div>

      </div>

      {/* Bottom Profile */}
      <div className="p-4 border-t border-[#33302B]">

        {/* User Card */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={user.displayName}
              className="w-8 h-8 rounded-full object-cover border border-[#C85A32] shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.displayName}</p>
              <p className="text-[10px] text-[#A8A29E] truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="p-1.5 rounded-lg hover:bg-[#282624] text-[#A8A29E] hover:text-white transition shrink-0"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Versión del Sistema (Día.Mes.Año - Hora) */}
        <div className="pt-2.5 mt-2 border-t border-[#2A2723] flex items-center justify-between text-[10px] text-[#78716C] font-mono">
          <span>Versión:</span>
          <span className="text-[#D8D0C5] bg-[#22201D] px-2 py-0.5 rounded border border-[#33302B] font-semibold">
            {database.version || APP_VERSION}
          </span>
        </div>
      </div>

    </aside>
  );
};
