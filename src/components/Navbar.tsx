import React from 'react';
import { 
  Cloud, RefreshCw, Camera, Sparkles, LogOut, 
  ExternalLink, Clock, ShieldCheck, CheckCircle2, Globe 
} from 'lucide-react';
import { UserProfile, CRMDatabase } from '../types';
import { GOOGLE_DRIVE_FOLDER_URL, GOOGLE_DRIVE_FOLDER_ID } from '../services/googleDrive';
import { APP_VERSION } from '../utils/version';

interface NavbarProps {
  user: UserProfile;
  database: CRMDatabase;
  activeView: string;
  onNavigate: (view: string) => void;
  onOpenCamera: () => void;
  onOpenBackupModal: () => void;
  onForceDriveSync: () => Promise<void>;
  driveSyncStatus: {
    state: 'synced' | 'syncing' | 'error' | 'local_only';
    lastSyncedAt: string | null;
  };
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  database,
  activeView,
  onNavigate,
  onOpenCamera,
  onOpenBackupModal,
  onForceDriveSync,
  driveSyncStatus,
  onSignOut
}) => {
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleSyncClick = async () => {
    setIsSyncing(true);
    await onForceDriveSync();
    setIsSyncing(false);
  };

  const appointmentsCount = database.appointments.length;

  return (
    <header className="sticky top-0 z-30 bg-[#181715] text-white border-b border-[#33302B] px-4 py-2.5 sm:px-6">
      <div className="flex items-center justify-between">
        
        {/* Brand Title & Website Link */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div
            onClick={() => onNavigate('dashboard')}
            className="cursor-pointer flex items-center gap-2 group"
          >
            <span className="font-serif text-base sm:text-lg font-bold tracking-tight text-white hover:text-[#C85A32] transition">
              CRM Click Videorecords
            </span>
          </div>

          {/* Versión combinando Día.Mes.Año y Hora */}
          <span
            className="text-[10px] bg-[#24221F] text-[#D8D0C5] border border-[#3E3A35] px-2 py-0.5 rounded-md font-mono font-bold tracking-tight shrink-0"
            title="Versión del sistema (Día.Mes.Año - Hora)"
          >
            {database.version || APP_VERSION}
          </span>

          <a
            href="https://www.clickvideorecords.com.mx"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden xl:inline-flex items-center gap-1.5 text-xs text-[#A8A29E] hover:text-white px-2.5 py-1 rounded-lg hover:bg-[#282624] transition border border-[#33302B]"
            title="Ir a www.clickvideorecords.com.mx"
          >
            <Globe className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>www.clickvideorecords.com.mx</span>
            <ExternalLink className="w-3 h-3 text-[#78716C]" />
          </a>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Botón Control Interno */}
          <a
            href="https://clickvideorecords.com.mx/control.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#282624] hover:bg-[#33302B] text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition shadow-xs hover:border-amber-400"
            title="Abrir sistema de control interno (clickvideorecords.com.mx/control.html)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Control Interno</span>
            <span className="sm:hidden">Control</span>
            <ExternalLink className="w-3 h-3 text-amber-400/70" />
          </a>

          {/* Citas counter quick badge (requested in prompt for upper view) */}
          <button
            onClick={() => onNavigate('appointments')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#282624] hover:bg-[#33302B] text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition shadow-2xs"
            title="Ver citas agendadas"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{appointmentsCount} {appointmentsCount === 1 ? 'Cita' : 'Citas'}</span>
          </button>

          {/* Quick Mobile / Desktop Camera Button */}
          <button
            onClick={onOpenCamera}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#C85A32] hover:bg-[#B24B25] text-white rounded-xl text-xs font-bold transition shadow-xs"
            title="Tomar foto con cámara del móvil"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cámara</span>
          </button>

          {/* Google Drive Status & Manual Sync Button */}
          <div className="hidden lg:flex items-center gap-2 bg-[#22201D] px-3 py-1.5 rounded-xl border border-[#33302B] text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[#A8A29E] text-[11px]">Drive:</span>
            <span className="font-bold text-emerald-400 text-[11px]">Guardado</span>
            <button
              onClick={handleSyncClick}
              disabled={isSyncing}
              className="ml-1 p-1 hover:text-white text-[#A8A29E] transition"
              title="Actualizar con Google Drive"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#C85A32]' : ''}`} />
            </button>
          </div>


          {/* User & Sign Out */}
          <div className="flex items-center gap-2 pl-1 border-l border-[#33302B]">
            <img
              src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={user.displayName}
              className="w-7 h-7 rounded-full object-cover border border-[#C85A32]"
              title={user.email}
            />
            <button
              onClick={onSignOut}
              className="p-1.5 rounded-lg hover:bg-[#282624] text-[#A8A29E] hover:text-white transition"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
