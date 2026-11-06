import React, { useState } from 'react';
import { 
  Plus, X, UserCheck, Users, Clock, Video, 
  Camera, Calendar, FileSpreadsheet, Sparkles, Zap 
} from 'lucide-react';

interface QuickActionsFABProps {
  onOpenNewClient: () => void;
  onOpenNewProspect: () => void;
  onOpenNewAppointment: () => void;
  onOpenNewSession: () => void;
  onOpenCamera: () => void;
  onOpenBackupModal: () => void;
  onNavigate: (view: string) => void;
}

export const QuickActionsFAB: React.FC<QuickActionsFABProps> = ({
  onOpenNewClient,
  onOpenNewProspect,
  onOpenNewAppointment,
  onOpenNewSession,
  onOpenCamera,
  onOpenBackupModal,
  onNavigate
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      label: 'Nuevo Cliente',
      desc: 'Contrato de boda o XV',
      icon: UserCheck,
      color: 'bg-[#C85A32] text-white',
      badge: 'Boda / XV',
      onClick: () => {
        setIsOpen(false);
        onOpenNewClient();
      }
    },
    {
      label: 'Nuevo Prospecto',
      desc: 'Cotización en seguimiento',
      icon: Users,
      color: 'bg-blue-600 text-white',
      badge: 'Cotización',
      onClick: () => {
        setIsOpen(false);
        onOpenNewProspect();
      }
    },
    {
      label: 'Agendar Cita',
      desc: 'Videollamada o en estudio',
      icon: Clock,
      color: 'bg-amber-500 text-white',
      badge: 'Meet / Presencial',
      onClick: () => {
        setIsOpen(false);
        onOpenNewAppointment();
      }
    },
    {
      label: 'Programar Sesión',
      desc: 'Pre-boda, vestido XV, cenote',
      icon: Video,
      color: 'bg-indigo-600 text-white',
      badge: 'Foto / Video',
      onClick: () => {
        setIsOpen(false);
        onOpenNewSession();
      }
    },
    {
      label: 'Foto con Cámara',
      desc: 'Fotografiar contrato o recibo',
      icon: Camera,
      color: 'bg-emerald-600 text-white',
      badge: 'Expediente',
      onClick: () => {
        setIsOpen(false);
        onOpenCamera();
      }
    },
    {
      label: 'Cal. Prospectos',
      desc: 'Ver fechas tentativas',
      icon: Calendar,
      color: 'bg-purple-600 text-white',
      badge: 'Disponibilidad',
      onClick: () => {
        setIsOpen(false);
        onNavigate('calendar-prospects');
      }
    }
  ];

  return (
    <>
      {/* Backdrop overlay when open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
        />
      )}

      {/* Floating Menu Popover / Bottom Sheet */}
      {isOpen && (
        <div className="fixed bottom-24 lg:bottom-8 right-4 sm:right-8 z-50 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-3xl shadow-2xl border border-[#E8E2D8] p-4 animate-in slide-in-from-bottom-5 zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#E8E2D8]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FAF0EB] text-[#C85A32] flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-[#181715]">Accesos Rápidos</h3>
                <p className="text-[10px] text-[#78716C]">Acciones frecuentes de Click Videorecords</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-[#F4EFEA] text-[#78716C] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {actions.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.label}
                  onClick={act.onClick}
                  className="p-2.5 bg-[#FBF9F5] hover:bg-[#FAF0EB] hover:border-[#C85A32] border border-[#E8E2D8] rounded-2xl text-left transition flex flex-col justify-between group shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className={`w-8 h-8 rounded-xl ${act.color} flex items-center justify-center shadow-xs group-hover:scale-105 transition`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold text-[#78716C] bg-white px-1.5 py-0.2 rounded border border-[#E8E2D8]">
                      {act.badge}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#181715] leading-tight group-hover:text-[#C85A32] transition">
                      {act.label}
                    </h4>
                    <p className="text-[10px] text-[#78716C] mt-0.5 leading-tight line-clamp-1">
                      {act.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#E8E2D8] flex items-center justify-between text-xs">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenBackupModal();
              }}
              className="text-[11px] font-bold text-[#78716C] hover:text-[#181715] flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Respaldar en Excel / JSON
            </button>
            <span className="text-[10px] text-[#A8A29E] font-mono">Click CRM</span>
          </div>
        </div>
      )}

      {/* Trigger FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all duration-200 group ${
          isOpen
            ? 'bg-[#181715] text-white rotate-45 scale-95 border-2 border-[#C85A32]'
            : 'bg-gradient-to-br from-[#C85A32] to-[#8F3717] hover:from-[#B24B25] hover:to-[#782E12] text-white hover:scale-105 shadow-[#C85A32]/30'
        }`}
        title="Accesos rápidos"
        aria-label="Accesos rápidos"
      >
        {isOpen ? (
          <Plus className="w-6 h-6" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Zap className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-300 ring-2 ring-[#C85A32]" />
          </div>
        )}
      </button>
    </>
  );
};
