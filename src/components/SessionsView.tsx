import React, { useState } from 'react';
import { 
  Plus, Video, Calendar, Clock, MapPin, User, 
  MessageSquare, Trash2, CheckCircle2, Phone, Edit2 
} from 'lucide-react';
import { Session, SessionStatus, Client } from '../types';
import { openWhatsApp, generateWhatsAppMessage } from '../utils/whatsapp';

interface SessionsViewProps {
  sessions: Session[];
  clients: Client[];
  onOpenNewSession: () => void;
  onEditSession: (session: Session) => void;
  onUpdateStatus: (sessionId: string, status: SessionStatus) => void;
  onDeleteSession: (sessionId: string) => void;
}

export const SessionsView: React.FC<SessionsViewProps> = ({
  sessions,
  clients,
  onOpenNewSession,
  onEditSession,
  onUpdateStatus,
  onDeleteSession
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = sessions
    .filter((s) => {
      return filterType === 'all' || s.type === filterType;
    })
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-bold text-2xl text-[#181715]">Sesiones de Foto &amp; Video</h1>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-full">
              {sessions.length} agendadas
            </span>
          </div>
          <p className="text-xs text-[#78716C] mt-0.5">
            Pre-bodas, sesiones de vestido de XV años, cenotes y playas de Yucatán
          </p>
        </div>

        <button
          onClick={onOpenNewSession}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#C85A32] hover:bg-[#B24B25] text-white rounded-xl text-xs font-bold transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Nueva Sesión
        </button>
      </div>

      {/* Filter by Session Type */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3.5 py-2 bg-white border border-[#E8E2D8] rounded-xl text-xs font-bold text-[#57534E] focus:outline-none focus:border-[#C85A32]"
        >
          <option value="all">Todas las Sesiones</option>
          <option value="Casual Pre-Boda">Casual Pre-Boda</option>
          <option value="Vestido XV Años">Vestido XV Años</option>
          <option value="Save the Date">Save the Date</option>
          <option value="Trash the Dress">Trash the Dress</option>
          <option value="Playa / Cenote">Playa / Cenote</option>
          <option value="Estudio">Estudio</option>
        </select>
      </div>

      {/* Sessions Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[#E8E2D8] p-12 text-center space-y-3">
          <p className="font-serif text-lg text-[#181715] font-bold">No hay sesiones en esta categoría</p>
          <p className="text-xs text-[#78716C]">Programa una sesión pre-boda o sesión de vestido para tus clientes.</p>
          <button
            onClick={onOpenNewSession}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C85A32] text-white rounded-xl text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            Programar Sesión
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => {
            const client = clients.find((c) => c.id === s.clientId);

            return (
              <div
                key={s.id}
                className="bg-white p-5 rounded-2xl border border-[#E8E2D8] hover:border-[#C85A32] shadow-xs hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700">
                      {s.type}
                    </span>
                    <select
                      value={s.status}
                      onChange={(e) => onUpdateStatus(s.id, e.target.value as SessionStatus)}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#E8E2D8] bg-[#FBF9F5] focus:outline-none"
                    >
                      <option value="Confirmada">Confirmada</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="Realizada">Realizada</option>
                      <option value="En edición">En edición</option>
                      <option value="Entregada">Entregada</option>
                    </select>
                  </div>

                  <h3 className="font-serif font-bold text-base text-[#181715] leading-snug">
                    {s.clientName}
                  </h3>

                  <div className="mt-2.5 space-y-1.5 text-xs text-[#57534E]">
                    <div className="flex items-center gap-1.5 font-bold text-[#C85A32]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{s.date} a las {s.time} hrs</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#78716C] shrink-0 mt-0.5" />
                      <span className="truncate">{s.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#78716C]" />
                      <span>{s.photographer}</span>
                    </div>
                  </div>

                  {s.notes && (
                    <p className="mt-3 p-2.5 bg-[#FAF0EB]/60 rounded-xl text-xs text-[#57534E] border border-[#F0DDD4]">
                      {s.notes}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8E2D8] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Botón de Llamada */}
                    {client?.phone ? (
                      <a
                        href={`tel:${client.phone}`}
                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition shadow-2xs"
                        title={`Llamar a ${client.name} (${client.phone})`}
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    ) : null}

                    {/* Botón de WhatsApp */}
                    <button
                      onClick={() => {
                        if (client) {
                          const msg = generateWhatsAppMessage('session', {
                            clientName: client.name,
                            date: s.date,
                            time: s.time,
                            location: s.location
                          });
                          openWhatsApp(client.phone, msg);
                        }
                      }}
                      className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition shadow-2xs"
                      title="Confirmar en WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Botón Editar Sesión */}
                    <button
                      onClick={() => onEditSession(s)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#FAF0EB] hover:bg-[#F4DDD3] text-[#C85A32] rounded-xl text-xs font-bold transition"
                      title="Editar sesión"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>

                    {/* Botón Eliminar Sesión */}
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar la sesión de ${s.clientName}?`)) {
                          onDeleteSession(s.id);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 transition"
                      title="Eliminar sesión"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
