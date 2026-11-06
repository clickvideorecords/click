import React, { useState } from 'react';
import { 
  Plus, Search, Filter, Phone, Mail, Calendar, DollarSign, 
  MessageSquare, Sparkles, Edit2, Trash2, ArrowRight, CheckCircle2,
  Paperclip 
} from 'lucide-react';
import { Prospect, ProspectStatus } from '../types';
import { openWhatsApp, generateWhatsAppMessage } from '../utils/whatsapp';

interface ProspectsViewProps {
  prospects: Prospect[];
  onOpenNewProspect: () => void;
  onEditProspect: (prospect: Prospect) => void;
  onDeleteProspect: (prospectId: string) => void;
  onSelectProspect: (prospect: Prospect) => void;
  onConvertToClient: (prospect: Prospect) => void;
  onUpdateStatus: (prospectId: string, status: ProspectStatus) => void;
  onNavigateToProspectsCalendar?: () => void;
}

export const ProspectsView: React.FC<ProspectsViewProps> = ({
  prospects,
  onOpenNewProspect,
  onEditProspect,
  onDeleteProspect,
  onSelectProspect,
  onConvertToClient,
  onUpdateStatus,
  onNavigateToProspectsCalendar
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'kanban'>('cards');

  const [sortOrder, setSortOrder] = useState<'date_asc' | 'date_desc'>('date_asc');

  // Filter and sort prospects strictly by date
  const filteredProspects = prospects
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.interestedPackage.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm);

      const matchesStatus = filterStatus === 'all' || p.status === filterStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dtA = a.estimatedDate || a.createdAt;
      const dtB = b.estimatedDate || b.createdAt;
      return sortOrder === 'date_asc' ? dtA.localeCompare(dtB) : dtB.localeCompare(dtA);
    });

  const stages: ProspectStatus[] = ['Nuevo', 'Contactado', 'Cotizado', 'Ganado', 'Perdido'];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-bold text-2xl text-[#181715]">Ver Todos los Prospectos</h1>
            <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-full">
              {prospects.length} en seguimiento
            </span>
          </div>
          <p className="text-xs text-[#78716C] mt-0.5">
            Ordenados por fecha estimada de evento y fecha de registro
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex bg-[#F4EFEA] p-1 rounded-xl text-xs font-bold text-[#57534E]">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'cards' ? 'bg-white text-[#181715] shadow-xs' : ''
              }`}
            >
              Tarjetas
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'kanban' ? 'bg-white text-[#181715] shadow-xs' : ''
              }`}
            >
              Columnas (Kanban)
            </button>
          </div>
          {onNavigateToProspectsCalendar && (
            <button
              onClick={onNavigateToProspectsCalendar}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-bold transition border border-blue-200"
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Ver en Calendario</span>
            </button>
          )}
          <button
            onClick={onOpenNewProspect}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#C85A32] hover:bg-[#B24B25] text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Nuevo Prospecto
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por prospecto, paquete o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3.5 py-2.5 bg-white border border-[#E8E2D8] rounded-xl text-xs font-bold text-[#57534E] focus:outline-none focus:border-[#C85A32]"
        >
          <option value="all">Todos los Estados</option>
          <option value="Nuevo">Nuevos</option>
          <option value="Contactado">Contactados</option>
          <option value="Cotizado">Cotizados</option>
          <option value="Ganado">Ganados</option>
          <option value="Perdido">Perdidos</option>
        </select>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 overflow-x-auto pb-4">
          {stages.map((st) => {
            const stageProspects = filteredProspects.filter((p) => p.status === st);
            return (
              <div key={st} className="bg-[#FBF9F5] rounded-2xl p-3 border border-[#E8E2D8] min-w-[240px] flex flex-col">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E8E2D8]">
                  <span className="font-bold text-xs text-[#181715]">{st}</span>
                  <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full border border-[#E8E2D8] text-[#78716C]">
                    {stageProspects.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {stageProspects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => onSelectProspect(p)}
                      className="bg-white p-3 rounded-xl border border-[#E8E2D8] hover:border-[#C85A32] shadow-2xs hover:shadow-xs transition cursor-pointer space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold uppercase text-[#C85A32]">{p.eventType}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          p.priority === 'Alta' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {p.priority}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-[#181715] leading-snug">{p.name}</h4>
                      <p className="text-[11px] text-[#78716C] truncate">{p.interestedPackage}</p>

                      <div className="pt-2 border-t border-[#E8E2D8] flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onConvertToClient(p)}
                          className="px-2 py-1 bg-[#C85A32] text-white rounded-lg text-[10px] font-bold hover:bg-[#B24B25]"
                        >
                          Convertir
                        </button>
                        <div className="flex items-center gap-1">
                          <a
                            href={`tel:${p.phone}`}
                            className="p-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                            title={`Llamar a ${p.name}`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => {
                              const msg = generateWhatsAppMessage('quote', { clientName: p.name, eventType: p.eventType });
                              openWhatsApp(p.phone, msg);
                            }}
                            className="p-1 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : filteredProspects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[#E8E2D8] p-12 text-center space-y-3">
          <p className="font-serif text-lg text-[#181715] font-bold">No hay prospectos registrados</p>
          <p className="text-xs text-[#78716C] max-w-sm mx-auto">
            Registra una nueva cotización o contacto interesado para dar seguimiento a fechas tentativas y presupuestos.
          </p>
          <button
            onClick={onOpenNewProspect}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C85A32] text-white rounded-xl text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            Nuevo Prospecto
          </button>
        </div>
      ) : (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProspects.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-[#E8E2D8] hover:border-[#C85A32] p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
                      {p.status}
                    </span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-[#FAF0EB] text-[#8F3717]">
                      {p.eventType}
                    </span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    p.priority === 'Alta' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {p.priority} prioridad
                  </span>
                </div>

                <h3
                  onClick={() => onSelectProspect(p)}
                  className="font-serif font-bold text-lg text-[#181715] leading-snug cursor-pointer hover:text-[#C85A32] transition"
                >
                  {p.name}
                </h3>

                <div className="mt-2 text-xs text-[#78716C] space-y-1">
                  <p>📅 Tentativa: <strong>{p.estimatedDate || 'Por confirmar'}</strong></p>
                  <p>📞 {p.phone}</p>
                </div>

                <div className="my-3 p-3 bg-[#F4EFEA] rounded-xl text-xs space-y-1 border border-[#E8E2D8]">
                  <p className="font-semibold text-[#181715] truncate">{p.interestedPackage}</p>
                  {p.budget && (
                    <p className="text-[#78716C] pt-1 border-t border-[#E8E2D8]/60 font-mono">
                      Presupuesto estimado: ${p.budget.toLocaleString('es-MX')} MXN
                    </p>
                  )}
                </div>

                {p.files && p.files.length > 0 && (
                  <div className="flex items-center gap-1 text-[11px] text-[#78716C] mb-2 font-medium bg-stone-50 px-2 py-1 rounded-lg border border-stone-200 w-fit">
                    <Paperclip className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>{p.files.length} {p.files.length === 1 ? 'archivo adjunto' : 'archivos adjuntos'}</span>
                  </div>
                )}

                {p.notes && (
                  <p className="text-xs text-[#78716C] italic line-clamp-2 mb-3">
                    &ldquo;{p.notes}&rdquo;
                  </p>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-[#E8E2D8] flex items-center justify-between gap-2">
                <button
                  onClick={() => onConvertToClient(p)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#C85A32] hover:bg-[#B24B25] text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Convertir a Cliente
                </button>

                <div className="flex items-center gap-1">
                  <a
                    href={`tel:${p.phone}`}
                    className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                    title={`Llamar a ${p.name} (${p.phone})`}
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => {
                      const msg = generateWhatsAppMessage('quote', { clientName: p.name, eventType: p.eventType });
                      openWhatsApp(p.phone, msg);
                    }}
                    className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                    title="WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEditProspect(p)}
                    className="p-2 rounded-xl hover:bg-[#E8E2D8] text-[#78716C] transition"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar al prospecto ${p.name}?`)) {
                        onDeleteProspect(p.id);
                      }
                    }}
                    className="p-2 rounded-xl hover:bg-rose-50 text-rose-500 transition"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
