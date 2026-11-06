import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, Users, MapPin, Sparkles, MessageSquare, 
  AlertTriangle, CheckCircle, Plus, Filter, ArrowRight,
  Phone, Edit2, Unlock 
} from 'lucide-react';
import { Prospect, Appointment, Client, ProspectStatus } from '../types';
import { openWhatsApp, generateWhatsAppMessage } from '../utils/whatsapp';

interface ProspectsCalendarViewProps {
  prospects: Prospect[];
  appointments: Appointment[];
  clients: Client[];
  onSelectProspect: (prospect: Prospect) => void;
  onEditProspect?: (prospect: Prospect) => void;
  onUnlockDate?: (prospectId: string) => void;
  onConvertToClient: (prospect: Prospect) => void;
  onOpenNewProspect: () => void;
  onOpenNewAppointment: () => void;
}

export const ProspectsCalendarView: React.FC<ProspectsCalendarViewProps> = ({
  prospects,
  appointments,
  clients,
  onSelectProspect,
  onEditProspect,
  onUnlockDate,
  onConvertToClient,
  onOpenNewProspect,
  onOpenNewAppointment
}) => {
  // Month state (defaults to current date, can navigate into future months)
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDayStr, setSelectedDayStr] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('calendar');

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

  const jumpToDate = (targetYear: number, targetMonth: number, dayStr?: string) => {
    setCurrentDate(new Date(targetYear, targetMonth, 1));
    if (dayStr) setSelectedDayStr(dayStr);
  };

  // Calendar calculations
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push(formatted);
  }

  // Active prospects (not lost or already won unless specified)
  const activeProspects = prospects.filter((p) => {
    const matchesPriority = filterPriority === 'all' || p.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesPriority && matchesStatus;
  });

  // Prospects appointments
  const prospectAppointments = appointments.filter((a) => a.relatedTo.type === 'prospect');

  // Items for date helper
  const getItemsForDate = (dateStr: string) => {
    const dayProspects = activeProspects.filter((p) => p.estimatedDate === dateStr);
    const dayAppointments = prospectAppointments.filter((a) => a.date === dateStr);
    const confirmedClientsOnDate = clients.filter((c) => c.eventDate === dateStr);

    return {
      prospects: dayProspects,
      appointments: dayAppointments,
      confirmedClients: confirmedClientsOnDate,
      hasConflict: confirmedClientsOnDate.length > 0 && dayProspects.length > 0,
      total: dayProspects.length + dayAppointments.length
    };
  };

  const selectedDayItems = getItemsForDate(selectedDayStr);

  // All upcoming tentative dates for timeline view
  const upcomingTentativeProspects = [...activeProspects]
    .filter((p) => p.estimatedDate)
    .sort((a, b) => (a.estimatedDate! > b.estimatedDate! ? 1 : -1));

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-bold text-2xl text-[#181715]">Calendario de Prospectos</h1>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-full">
              Fechas Tentativas
            </span>
          </div>
          <p className="text-xs text-[#78716C] mt-0.5">
            Monitoreo de fechas solicitadas para cotizaciones, citas de venta y disponibilidad de haciendas
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="hidden sm:flex bg-[#F4EFEA] p-1 rounded-xl text-xs font-bold text-[#57534E]">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'calendar' ? 'bg-white text-[#181715] shadow-xs' : ''
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'timeline' ? 'bg-white text-[#181715] shadow-xs' : ''
              }`}
            >
              Lista Cronológica
            </button>
          </div>

          <button
            onClick={onOpenNewAppointment}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#FAF0EB] text-[#181715] border border-[#E8E2D8] rounded-xl text-xs font-bold transition"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Agendar Cita
          </button>

          <button
            onClick={onOpenNewProspect}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#C85A32] hover:bg-[#B24B25] text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Nuevo Prospecto
          </button>
        </div>
      </div>

      {/* Quick Jump Shortcuts for Wedding/XV Season */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FBF9F5] p-3 rounded-2xl border border-[#E8E2D8]">
        <div className="flex items-center gap-2 text-xs text-[#57534E]">
          <span className="font-bold text-[#181715]">Saltar a temporada:</span>
          <button
            onClick={() => jumpToDate(2026, 10, '2026-11-14')}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
              year === 2026 && month === 10 ? 'bg-[#C85A32] text-white' : 'bg-white border border-[#E8E2D8] hover:bg-[#FAF0EB]'
            }`}
          >
            Nov 2026
          </button>
          <button
            onClick={() => jumpToDate(2026, 11, '2026-12-12')}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
              year === 2026 && month === 11 ? 'bg-[#C85A32] text-white' : 'bg-white border border-[#E8E2D8] hover:bg-[#FAF0EB]'
            }`}
          >
            Dic 2026
          </button>
          <button
            onClick={() => jumpToDate(2027, 2, '2027-03-20')}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
              year === 2027 && month === 2 ? 'bg-[#C85A32] text-white' : 'bg-white border border-[#E8E2D8] hover:bg-[#FAF0EB]'
            }`}
          >
            Mar 2027
          </button>
          <button
            onClick={() => jumpToDate(2027, 3, '2027-04-10')}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
              year === 2027 && month === 3 ? 'bg-[#C85A32] text-white' : 'bg-white border border-[#E8E2D8] hover:bg-[#FAF0EB]'
            }`}
          >
            Abr 2027
          </button>
          <button
            onClick={() => jumpToDate(2027, 4, '2027-05-15')}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
              year === 2027 && month === 4 ? 'bg-[#C85A32] text-white' : 'bg-white border border-[#E8E2D8] hover:bg-[#FAF0EB]'
            }`}
          >
            May 2027
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-[#78716C]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            Fecha tentativa
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Cita de venta
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Boda/XV confirmado
          </span>
        </div>
      </div>

      {viewMode === 'timeline' ? (
        /* TIMELINE VIEW */
        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-lg text-[#181715]">
              Próximas Fechas Tentativas Cotizadas ({upcomingTentativeProspects.length})
            </h2>
          </div>

          <div className="space-y-3">
            {upcomingTentativeProspects.map((p) => {
              const confirmedClientsOnDate = clients.filter((c) => c.eventDate === p.estimatedDate);
              const isOccupied = confirmedClientsOnDate.length > 0;

              return (
                <div
                  key={p.id}
                  className="p-4 bg-[#FBF9F5] border border-[#E8E2D8] hover:border-[#C85A32] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#C85A32]">
                        📅 {p.estimatedDate}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
                        {p.eventType} • {p.status}
                      </span>
                      {isOccupied ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Fecha ya apartada por cliente
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                          ✓ Fecha Disponible
                        </span>
                      )}
                    </div>

                    <h3
                      onClick={() => onSelectProspect(p)}
                      className="font-serif font-bold text-base text-[#181715] cursor-pointer hover:text-[#C85A32]"
                    >
                      {p.name}
                    </h3>
                    <p className="text-xs text-[#57534E]">
                      {p.interestedPackage} {p.budget ? `• Presupuesto: $${p.budget.toLocaleString('es-MX')} MXN` : ''}
                    </p>
                    {isOccupied && (
                      <p className="text-xs text-rose-700 font-semibold mt-1">
                        ⚠️ Cliente confirmado en esa fecha: {confirmedClientsOnDate.map((c) => c.name).join(', ')} ({confirmedClientsOnDate[0]?.location})
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onConvertToClient(p)}
                      className="px-2.5 py-1.5 bg-[#C85A32] hover:bg-[#B24B25] text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1"
                      title="Convertir a cliente confirmado"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Apartar Fecha
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`¿Desbloquear la fecha ${p.estimatedDate} para ${p.name}? La fecha quedará disponible nuevamente.`)) {
                          onUnlockDate?.(p.id);
                        }
                      }}
                      className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-xl transition flex items-center gap-1"
                      title="Desbloquear y liberar fecha"
                    >
                      <Unlock className="w-3.5 h-3.5 text-amber-600" />
                      Desbloquear
                    </button>

                    {onEditProspect && (
                      <button
                        onClick={() => onEditProspect(p)}
                        className="p-2 bg-[#FAF0EB] hover:bg-[#F4DDD3] text-[#C85A32] rounded-xl transition"
                        title="Editar prospecto"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {p.phone && (
                      <a
                        href={`tel:${p.phone}`}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition"
                        title={`Llamar a ${p.name} (${p.phone})`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <button
                      onClick={() => {
                        const msg = `¡Hola ${p.name}! Te saludamos de Click Videorecords respecto a la fecha tentativa que nos consultaste (${p.estimatedDate}) para tu ${p.eventType}. Queremos confirmar si te gustaría apartar la fecha o si tienen alguna duda con los paquetes. ¡Quedamos a tus órdenes! 🎬✨`;
                        openWhatsApp(p.phone, msg);
                      }}
                      className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition"
                      title="Enviar seguimiento por WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* CALENDAR GRID VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Main Month Grid (2 cols) */}
          <div className="lg:col-span-2 bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D8] shadow-xs">
            
            {/* Month Header Switcher */}
            <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#E8E2D8]">
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-xl hover:bg-[#FAF0EB] text-[#C85A32] transition"
                  title="Mes anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="font-serif font-bold text-lg text-[#181715] min-w-[140px] text-center">
                  {monthNames[month]} {year}
                </h2>
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-xl hover:bg-[#FAF0EB] text-[#C85A32] transition"
                  title="Mes siguiente"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#FBF9F5] border border-[#E8E2D8] rounded-xl text-xs font-bold text-[#57534E]"
                >
                  <option value="all">Todas las Prioridades</option>
                  <option value="Alta">Prioridad Alta 🔥</option>
                  <option value="Media">Prioridad Media</option>
                  <option value="Baja">Prioridad Baja</option>
                </select>
              </div>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[#78716C] uppercase pb-2 border-b border-[#E8E2D8]">
              <span>Dom</span>
              <span>Lun</span>
              <span>Mar</span>
              <span>Mié</span>
              <span>Jue</span>
              <span>Vie</span>
              <span>Sáb</span>
            </div>

            {/* Grid Cells */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pt-2">
              {days.map((dayStr, idx) => {
                if (!dayStr) {
                  return <div key={`empty-${idx}`} className="h-16 sm:h-24 bg-[#FBF9F5]/40 rounded-xl" />;
                }

                const dayNum = parseInt(dayStr.split('-')[2], 10);
                const items = getItemsForDate(dayStr);
                const isSelected = selectedDayStr === dayStr;
                const hasProspect = items.prospects.length > 0;
                const hasApp = items.appointments.length > 0;
                const hasConflict = items.hasConflict;

                return (
                  <div
                    key={dayStr}
                    onClick={() => setSelectedDayStr(dayStr)}
                    className={`h-16 sm:h-24 p-1 sm:p-1.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#C85A32] bg-[#FAF0EB]/60 ring-2 ring-[#C85A32]/20'
                        : hasConflict
                        ? 'border-amber-300 bg-amber-50/40 hover:border-amber-500'
                        : hasProspect
                        ? 'border-blue-200 bg-blue-50/30 hover:border-blue-400'
                        : 'border-[#E8E2D8]/60 bg-white hover:bg-[#FBF9F5]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSelected ? 'text-[#C85A32]' : 'text-[#181715]'}`}>
                        {dayNum}
                      </span>
                      {items.total > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          hasConflict ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'
                        }`}>
                          {items.total}
                        </span>
                      )}
                    </div>

                    {/* Chips */}
                    <div className="space-y-0.5 overflow-hidden">
                      {/* Mobile dots */}
                      <div className="flex sm:hidden gap-1 mt-1 justify-center">
                        {hasProspect && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                        {hasApp && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                        {items.confirmedClients.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                      </div>

                      {/* Desktop Chips */}
                      <div className="hidden sm:block space-y-0.5">
                        {items.prospects.slice(0, 1).map((p) => (
                          <div key={p.id} className="text-[10px] bg-blue-100 text-blue-900 font-semibold px-1 rounded truncate">
                            🎯 {p.name.split(' ')[0]}
                          </div>
                        ))}
                        {items.appointments.slice(0, 1).map((a) => (
                          <div key={a.id} className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-1 rounded truncate">
                            ⏰ {a.time} Cita
                          </div>
                        ))}
                        {items.confirmedClients.slice(0, 1).map((c) => (
                          <div key={c.id} className="text-[10px] bg-emerald-50 text-emerald-800 font-semibold px-1 rounded truncate">
                            💍 Ocupada
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side Drawer for Selected Day */}
          <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-3 mb-3">
                <div>
                  <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">Detalle del Día</p>
                  <h3 className="font-serif font-bold text-lg text-[#181715]">{selectedDayStr}</h3>
                </div>
                {selectedDayItems.hasConflict && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    En disputa
                  </span>
                )}
              </div>

              {/* Disputed date warning */}
              {selectedDayItems.hasConflict && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1 mb-3">
                  <p className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Fecha con Boda/XV ya contratada
                  </p>
                  <p className="text-[11px] text-amber-800">
                    Ya existe un cliente con contrato para esta fecha: {selectedDayItems.confirmedClients.map(c => c.name).join(', ')}.
                    Asegúrate de tener un segundo equipo de cámara o proponer fecha alternativa.
                  </p>
                </div>
              )}

              {/* Content lists */}
              <div className="space-y-3 max-h-[420px] overflow-y-auto">
                {selectedDayItems.total === 0 && selectedDayItems.confirmedClients.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <p className="text-xs text-[#A8A29E] italic">
                      No hay prospectos cotizando ni citas para esta fecha.
                    </p>
                    <span className="inline-block text-[11px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md">
                      ✓ Fecha 100% Disponible
                    </span>
                  </div>
                ) : (
                  <>
                    {/* Prospects considering this date */}
                    {selectedDayItems.prospects.map((p) => (
                      <div
                        key={p.id}
                        className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-800 uppercase tracking-wider text-[10px]">
                            🎯 Prospecto Tentativo
                          </span>
                          <span className="text-[10px] font-bold text-blue-700">
                            {p.eventType}
                          </span>
                        </div>
                        <h4
                          onClick={() => onSelectProspect(p)}
                          className="font-serif font-bold text-sm text-[#181715] cursor-pointer hover:text-[#C85A32]"
                        >
                          {p.name}
                        </h4>
                        <p className="text-[#57534E]">{p.interestedPackage}</p>
                        {p.budget && (
                          <p className="text-[11px] text-[#78716C]">
                            Presupuesto: ${p.budget.toLocaleString('es-MX')} MXN
                          </p>
                        )}

                        <div className="pt-2 border-t border-blue-200 flex flex-wrap items-center justify-between gap-1.5">
                          <button
                            onClick={() => onConvertToClient(p)}
                            className="px-2.5 py-1.5 bg-[#C85A32] hover:bg-[#B24B25] text-white text-[11px] font-bold rounded-lg transition shadow-xs flex items-center gap-1"
                            title="Apartar fecha convirtiendo a cliente"
                          >
                            <Sparkles className="w-3 h-3" />
                            Apartar Fecha
                          </button>

                          <div className="flex items-center gap-1">
                            {onUnlockDate && (
                              <button
                                onClick={() => onUnlockDate(p.id)}
                                className="px-2 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-semibold rounded-lg transition flex items-center gap-1"
                                title="Desbloquear fecha tentativa de este prospecto"
                              >
                                <Unlock className="w-3 h-3 text-amber-700" />
                                Desbloquear
                              </button>
                            )}

                            {onEditProspect && (
                              <button
                                onClick={() => onEditProspect(p)}
                                className="p-1.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-lg transition"
                                title="Editar Prospecto"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <a
                              href={`tel:${p.phone}`}
                              className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center justify-center"
                              title={`Llamar a ${p.name}`}
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>

                            <button
                              onClick={() => {
                                const msg = `¡Hola ${p.name}! Te saludamos de Click Videorecords respecto a la fecha que estás contemplando (${p.estimatedDate}). ¿Te gustaría agendar una llamada o apartar tu fecha? Quedamos a tus órdenes. 🎥✨`;
                                openWhatsApp(p.phone, msg);
                              }}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                              title="WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Appointments with prospects */}
                    {selectedDayItems.appointments.map((a) => (
                      <div key={a.id} className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-800 text-[10px] uppercase">
                            ⏰ Cita de Venta: {a.type}
                          </span>
                          <span className="font-bold text-amber-700">{a.time} hrs</span>
                        </div>
                        <h4 className="font-serif font-bold text-sm text-[#181715]">{a.title}</h4>
                        <p className="text-[#57534E]">Con: <strong>{a.relatedTo.name}</strong></p>
                        <p className="text-[11px] text-[#78716C] truncate">📍 {a.locationOrLink}</p>
                      </div>
                    ))}

                    {/* Confirmed Clients */}
                    {selectedDayItems.confirmedClients.map((c) => (
                      <div key={c.id} className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs space-y-1">
                        <span className="font-bold text-emerald-800 text-[10px] uppercase">
                          💍 Boda/XV Confirmado
                        </span>
                        <h4 className="font-serif font-bold text-sm text-[#181715]">{c.name}</h4>
                        <p className="text-[#57534E]">📍 {c.location}</p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Quick action at bottom of day drawer */}
            <div className="pt-3 border-t border-[#E8E2D8] flex gap-2">
              <button
                onClick={onOpenNewAppointment}
                className="flex-1 py-2 bg-[#F4EFEA] hover:bg-[#E8E2D8] text-[#181715] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Agendar Cita en este día
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
