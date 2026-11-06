import React, { useState } from 'react';
import { 
  LayoutDashboard, UserCheck, Users, Clock, 
  MoreHorizontal, Calendar, Video, FileText, 
  Database, Cloud, X, Sparkles, ExternalLink 
} from 'lucide-react';
import { CRMDatabase } from '../types';
import { GOOGLE_DRIVE_FOLDER_URL } from '../services/googleDrive';

interface BottomNavProps {
  activeView: string;
  onNavigate: (view: string) => void;
  database: CRMDatabase;
  onOpenBackupModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeView,
  onNavigate,
  database,
  onOpenBackupModal
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainItems = [
    { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
    { id: 'clients', label: 'Clientes', icon: UserCheck, count: database.clients.length },
    { id: 'prospects', label: 'Prospectos', icon: Users, count: database.prospects.length },
    { id: 'appointments', label: 'Citas', icon: Clock, count: database.appointments.length }
  ];

  const handleSelectMoreItem = (viewId: string) => {
    onNavigate(viewId);
    setIsMoreOpen(false);
  };

  return (
    <>
      {/* Mobile Slide-Up More Menu */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end lg:hidden animate-in fade-in duration-200">
          <div className="bg-[#181715] text-white rounded-t-3xl border-t border-[#33302B] p-5 space-y-4 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#33302B]">
              <span className="font-serif font-bold text-base">Más Opciones y Herramientas</span>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="w-8 h-8 rounded-full bg-[#282624] flex items-center justify-center text-white/70"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleSelectMoreItem('calendar-prospects')}
                className="p-3 bg-[#22201D] hover:bg-[#282624] border border-blue-500/40 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center"
              >
                <Calendar className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-bold text-blue-300">Cal. Prospectos</span>
                <span className="text-[10px] text-[#A8A29E]">{database.prospects.filter(p => p.estimatedDate).length} fechas tentativas</span>
              </button>

              <button
                onClick={() => handleSelectMoreItem('calendar')}
                className="p-3 bg-[#22201D] hover:bg-[#282624] border border-[#33302B] rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center"
              >
                <Calendar className="w-5 h-5 text-purple-400" />
                <span className="text-xs font-bold">Cal. Clientes</span>
                <span className="text-[10px] text-[#A8A29E]">{database.clients.length} bodas/XV</span>
              </button>

              <button
                onClick={() => handleSelectMoreItem('sessions')}
                className="p-3 bg-[#22201D] hover:bg-[#282624] border border-[#33302B] rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center"
              >
                <Video className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-bold">Sesiones Foto/Video</span>
                <span className="text-[10px] text-[#A8A29E]">{database.sessions.length} agendadas</span>
              </button>

              <button
                onClick={() => handleSelectMoreItem('notes')}
                className="p-3 bg-[#22201D] hover:bg-[#282624] border border-[#33302B] rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center"
              >
                <FileText className="w-5 h-5 text-[#C85A32]" />
                <span className="text-xs font-bold">Notas &amp; Expediente</span>
                <span className="text-[10px] text-[#A8A29E]">Notas y contratos</span>
              </button>

              <button
                onClick={() => {
                  setIsMoreOpen(false);
                  onOpenBackupModal();
                }}
                className="p-3 bg-[#22201D] hover:bg-[#282624] border border-[#33302B] rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center"
              >
                <Database className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold">Respaldar / Migrar</span>
                <span className="text-[10px] text-[#A8A29E]">Excel, JSON, Drive</span>
              </button>
            </div>

            {/* Drive link */}
            <div className="pt-2">
              <a
                href={GOOGLE_DRIVE_FOLDER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-4 bg-[#282624] text-emerald-400 border border-[#3E3A35] rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Cloud className="w-4 h-4" />
                Abrir Carpeta Oficial en Google Drive
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#181715]/95 backdrop-blur-md border-t border-[#33302B] lg:hidden px-2 py-2 flex items-center justify-around safe-bottom">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition relative ${
                isActive ? 'text-[#C85A32]' : 'text-[#A8A29E] hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-1.5 -right-2 text-[9px] bg-[#C85A32] text-white font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {item.count}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold mt-1 leading-none">{item.label}</span>
            </button>
          );
        })}

        {/* "Más" Button */}
        <button
          onClick={() => setIsMoreOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            isMoreOpen ? 'text-[#C85A32]' : 'text-[#A8A29E] hover:text-white'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1 leading-none">Más</span>
        </button>
      </nav>
    </>
  );
};
