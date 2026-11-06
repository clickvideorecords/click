import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  MapPin, Clock, Video, UserCheck, MessageSquare, 
  Users, Sparkles, Phone, Edit2 
} from 'lucide-react';
import { Client, Appointment, Session, Prospect } from '../types';
import { openWhatsApp, generateWhatsAppMessage } from '../utils/whatsapp';
import { ProspectsCalendarView } from './ProspectsCalendarView';

interface CalendarViewProps {
  clients: Client[];
  prospects: Prospect[];
  appointments: Appointment[];
  sessions: Session[];
  initialTab?: 'clients' | 'prospects';
  onSelectClient?: (client: Client) => void;
  onEditClient?: (client: Client) => void;
  onSelectProspect?: (prospect: Prospect) => void;
  onEditProspect?: (prospect: Prospect) => void;
  onUnlockProspectDate?: (prospectId: string) => void;
  onConvertToClient?: (prospect: Prospect) => void;
  onOpenNewProspect?: () => void;
  onOpenNewAppointment?: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  clients,
  prospects,
  appointments,
  sessions,
  initialTab = 'clients',
  onSelectClient,
  onEditClient,
  onSelectProspect,
  onEditProspect,
  onUnlockProspectDate,
  onConvertToClient,
  onOpenNewProspect,
  onOpenNewAppointment
}) => {
  const [calendarMode, setCalendarMode] = useState<'clients' | 'prospects'>(initialTab);

  // Calendar state for Clients Calendar (0-indexed month)
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDayStr, setSelectedDayStr] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'events' | 'appointments' | 'sessions'>('all');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Days in month
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Day list items
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const formattedDay = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push(formattedDay);
  }

  // Get items for a given date
  const getItemsForDate = (dateStr: string) => {
    const dayClients = categoryFilter === 'all' || categoryFilter === 'events'
      ? clients.filter((c) => c.eventDate === dateStr)
      : [];

    const dayAppointments = categoryFilter === 'all' || categoryFilter === 'appointments'
      ? appointments.filter((a) => a.date === dateStr).sort((a, b) => a.time.localeCompare(b.time))
      : [];

    const daySessions = categoryFilter === 'all' || categoryFilter === 'sessions'
      ? sessions.filter((s) => s.date === dateStr).sort((a, b) => a.time.localeCompare(b.time))
      : [];

    return {
      clients: dayClients,
      appointments: dayAppointments,
      sessions: daySessions,
      total: dayClients.length + dayAppointments.length + daySessions.length
    };
  };

  const selectedDayItems = getItemsForDate(selectedDayStr);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Top Mode Selector Tabs */}
      <div className="flex border-b border-[#E8E2D8] bg-white p-2 rounded-2xl shadow-2xs gap-2">
        <button
          onClick={() => setCalendarMode('clients')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
            calendarMode === 'clients'
              ? 'bg-[#C85A32] text-white shadow-sm'
              : 'text-[#78716C] hover:text-[#181715] hover:bg-[#FAF0EB]'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Calendario de Clientes (Eventos Confirmados)</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            calendarMode === 'clients' ? 'bg-white/20 text-white' : 'bg-[#FAF0EB] text-[#8F3717]'
          }`}>
            {clients.length}
          </span>
        </button>

        <button
          onClick={() => setCalendarMode('prospects')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
            calendarMode === 'prospects'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-[#78716C] hover:text-[#181715] hover:bg-blue-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Calendario de Prospectos (Fechas Tentativas)</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            calendarMode === 'prospects' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
          }`}>
            {prospects.filter((p) => p.estimatedDate).length}
          </span>
        </button>
      </div>

      {/* RENDER PROSPECTS CALENDAR */}
      {calendarMode === 'prospects' ? (
        <ProspectsCalendarView
          prospects={prospects}
          appointments={appointments}
          clients={clients}
          onSelectProspect={onSelectProspect || (() => {})}
          onEditProspect={onEditProspect}
          onUnlockDate={onUnlockProspectDate}
          onConvertToClient={onConvertToClient || (() => {})}
          onOpenNewProspect={onOpenNewProspect || (() => {})}
          onOpenNewAppointment={onOpenNewAppointment || (() => {})}
        />
      ) : (
        /* RENDER CLIENTS CALENDAR */
        <div className="space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-xs">
            <div>
              <h1 className="font-serif font-bold text-2xl text-[#181715]">Calendario de Eventos &amp; Bodas</h1>
              <p className="text-xs text-[#78716C] mt-0.5">
                Agenda de producciones confirmadas, sesiones fotográficas y reuniones en Yucatán
              </p>
            </div>

            {/* Month Navigation & Category Filter */}
            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="px-3 py-2 bg-[#FBF9F5] border border-[#E8E2D8] rounded-xl text-xs font-bold text-[#57534E]"
              >
                <option value="all">Todo el Calendario</option>
                <option value="events">Solo Bodas &amp; XV</option>
                <option value="appointments">Solo Citas</option>
                <option value="sessions">Solo Sesiones</option>
              </select>

              <div className="flex items-center gap-1.5 bg-[#FAF0EB] p-1 rounded-xl">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-lg hover:bg-[#F0DDD4] text-[#C85A32] transition"
                  title="Mes anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-serif font-bold text-sm text-[#181715] px-2 min-w-[130px] text-center">
                  {monthNames[month]} {year}
                </span>
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-lg hover:bg-[#F0DDD4] text-[#C85A32] transition"
                  title="Mes siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Grid: Calendar + Agenda Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            
            {/* Calendar Grid (2 cols on lg) */}
            <div className="lg:col-span-2 bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D8] shadow-xs">
              
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[#78716C] uppercase pb-2 border-b border-[#E8E2D8]">
                <span>Dom</span>
                <span>Lun</span>
                <span>Mar</span>
                <span>Mié</span>
                <span>Jue</span>
                <span>Vie</span>
                <span>Sáb</span>
              </div>

              {/* Calendar Cells */}
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pt-2">
                {days.map((dayStr, idx) => {
                  if (!dayStr) {
                    return <div key={`empty-${idx}`} className="h-16 sm:h-24 bg-[#FBF9F5]/40 rounded-xl" />;
                  }

                  const dayNum = parseInt(dayStr.split('-')[2], 10);
                  const items = getItemsForDate(dayStr);
                  const isSelected = selectedDayStr === dayStr;
                  const hasEvents = items.total > 0;

                  return (
                    <div
                      key={dayStr}
                      onClick={() => setSelectedDayStr(dayStr)}
                      className={`h-16 sm:h-24 p-1 sm:p-1.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#C85A32] bg-[#FAF0EB]/60 ring-2 ring-[#C85A32]/20'
                          : hasEvents
                          ? 'border-[#E8E2D8] bg-white hover:border-[#C85A32]'
                          : 'border-[#F0DDD4]/50 bg-white hover:bg-[#FBF9F5]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isSelected ? 'text-[#C85A32]' : 'text-[#181715]'}`}>
                          {dayNum}
                        </span>
                        {items.total > 0 && (
                          <span className="text-[10px] bg-[#181715] text-white px-1.5 py-0.2 rounded-full font-bold">
                            {items.total}
                          </span>
                        )}
                      </div>

                      {/* Desktop Badges / Mobile dots */}
                      <div className="space-y-0.5 overflow-hidden">
                        {/* Mobile dot indicators */}
                        <div className="flex sm:hidden gap-1 mt-1 justify-center">
                          {items.clients.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]" />}
                          {items.appointments.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                          {items.sessions.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                        </div>

                        {/* Desktop detailed chips */}
                        <div className="hidden sm:block space-y-0.5">
                          {items.clients.slice(0, 1).map((c) => (
                            <div key={c.id} className="text-[10px] bg-[#FAF0EB] text-[#8F3717] font-semibold px-1 rounded truncate">
                              💍 {c.name.split(' ')[0]}
                            </div>
                          ))}
                          {items.appointments.slice(0, 1).map((a) => (
                            <div key={a.id} className="text-[10px] bg-amber-50 text-amber-800 font-semibold px-1 rounded truncate">
                              ⏰ {a.time}
                            </div>
                          ))}
                          {items.sessions.slice(0, 1).map((s) => (
                            <div key={s.id} className="text-[10px] bg-indigo-50 text-indigo-800 font-semibold px-1 rounded truncate">
                              📸 {s.type.split(' ')[0]}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Day Agenda Drawer */}
            <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-3">
                <div>
                  <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">Agenda del Día</p>
                  <h3 className="font-serif font-bold text-lg text-[#181715]">{selectedDayStr}</h3>
                </div>
                <span className="text-xs font-bold bg-[#FAF0EB] text-[#C85A32] px-2.5 py-1 rounded-full">
                  {selectedDayItems.total} actividades
                </span>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {selectedDayItems.total === 0 ? (
                  <p className="text-xs text-[#A8A29E] italic py-8 text-center">
                    No hay eventos o citas programadas para esta fecha.
                  </p>
                ) : (
                  <>
                    {/* Clients / Events */}
                    {selectedDayItems.clients.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => onSelectClient && onSelectClient(c)}
                        className="p-3.5 bg-[#FAF0EB]/60 border border-[#F0DDD4] rounded-xl text-xs space-y-2 cursor-pointer hover:border-[#C85A32] transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#8F3717] uppercase tracking-wider text-[10px]">
                            🎉 Evento: {c.eventType}
                          </span>
                          <span className="text-[10px] font-bold text-[#C85A32]">
                            {c.eventTime || '17:00'} hrs
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-sm text-[#181715]">{c.name}</h4>
                        {c.location && <p className="text-[#57534E]">📍 {c.location}</p>}
                        {c.church && <p className="text-[#57534E]">⛪ Iglesia: {c.church}</p>}
                        {c.sessionLocation && <p className="text-[#57534E]">📸 Locación Sesión: {c.sessionLocation}</p>}
                        <p className="text-[11px] text-[#78716C]">{c.packageContracted}</p>

                        <div className="pt-2 border-t border-[#F0DDD4] flex items-center justify-between gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`tel:${c.phone}`}
                              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-bold text-[11px] flex items-center gap-1"
                              title={`Llamar a ${c.name}`}
                            >
                              <Phone className="w-3 h-3" />
                              Llamar
                            </a>
                            <button
                              onClick={() => {
                                const msg = `¡Hola ${c.name}! Te saludamos de Click Videorecords respecto a tu evento programado para el ${c.eventDate}. Quedamos atentos a cualquier detalle. ✨`;
                                openWhatsApp(c.phone, msg);
                              }}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                              title="WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {onEditClient && (
                            <button
                              onClick={() => onEditClient(c)}
                              className="px-2.5 py-1.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                              title="Editar cliente"
                            >
                              <Edit2 className="w-3 h-3" />
                              Editar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Appointments */}
                    {selectedDayItems.appointments.map((a) => (
                      <div key={a.id} className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-800 text-[10px] uppercase">
                            ⏰ Cita: {a.type}
                          </span>
                          <span className="font-bold text-amber-700">{a.time} hrs</span>
                        </div>
                        <h4 className="font-serif font-bold text-sm text-[#181715]">{a.title}</h4>
                        <p className="text-[#57534E]">Con: <strong>{a.relatedTo.name}</strong></p>
                        <p className="text-[11px] text-[#78716C] truncate">📍 {a.locationOrLink}</p>

                        <div className="pt-2 border-t border-amber-200 flex items-center gap-1.5">
                          {a.relatedTo.phone && (
                            <>
                              <a
                                href={`tel:${a.relatedTo.phone}`}
                                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-bold text-[11px] flex items-center gap-1"
                                title={`Llamar a ${a.relatedTo.name}`}
                              >
                                <Phone className="w-3 h-3" />
                                Llamar
                              </a>
                              <button
                                onClick={() => {
                                  const msg = `¡Hola ${a.relatedTo.name}! Te confirmamos tu cita "${a.title}" programada para hoy ${a.date} a las ${a.time} hrs. ¡Nos vemos pronto! 🎥`;
                                  openWhatsApp(a.relatedTo.phone || '', msg);
                                }}
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                                title="WhatsApp"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Sessions */}
                    {selectedDayItems.sessions.map((s) => {
                      const matchedClient = clients.find(c => c.id === s.clientId || c.name === s.clientName);
                      return (
                        <div key={s.id} className="p-3.5 bg-indigo-50/60 border border-indigo-200 rounded-xl text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-indigo-800 text-[10px] uppercase">
                              📸 Sesión: {s.type}
                            </span>
                            <span className="font-bold text-indigo-700">{s.time} hrs</span>
                          </div>
                          <h4 className="font-serif font-bold text-sm text-[#181715]">{s.clientName}</h4>
                          <p className="text-[#57534E]">📍 {s.location}</p>
                          <p className="text-[11px] text-[#78716C]">Fotógrafo: {s.photographer}</p>

                          {matchedClient && (
                            <div className="pt-2 border-t border-indigo-200 flex items-center gap-1.5">
                              <a
                                href={`tel:${matchedClient.phone}`}
                                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-bold text-[11px] flex items-center gap-1"
                                title={`Llamar a ${matchedClient.name}`}
                              >
                                <Phone className="w-3 h-3" />
                                Llamar
                              </a>
                              <button
                                onClick={() => {
                                  const msg = `¡Hola ${matchedClient.name}! Te confirmamos los detalles de tu ${s.type} para el día ${s.date} a las ${s.time} hrs en ${s.location}. 📷✨`;
                                  openWhatsApp(matchedClient.phone, msg);
                                }}
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                                title="WhatsApp"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
