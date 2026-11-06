import React, { useState } from 'react';
import { 
  Users, UserCheck, Calendar, Clock, Video, Camera, Plus, 
  ExternalLink, Sparkles, MessageSquare, Download, ArrowUpRight, 
  CheckCircle, ChevronRight, FileSpreadsheet, MapPin, Phone, Search
} from 'lucide-react';
import { Client, Prospect, Appointment, Session, CRMDatabase } from '../types';
import { openWhatsApp, generateWhatsAppMessage } from '../utils/whatsapp';

interface DashboardViewProps {
  database: CRMDatabase;
  onNavigate: (view: string) => void;
  onOpenNewClient: () => void;
  onOpenNewProspect: () => void;
  onOpenNewAppointment: () => void;
  onOpenNewSession?: () => void;
  onOpenCamera: () => void;
  onOpenBackupModal: () => void;
  onSelectClient: (client: Client) => void;
  onSelectProspect: (prospect: Prospect) => void;
  onConvertToClient: (prospect: Prospect) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  database,
  onNavigate,
  onOpenNewClient,
  onOpenNewProspect,
  onOpenNewAppointment,
  onOpenNewSession,
  onOpenCamera,
  onOpenBackupModal,
  onSelectClient,
  onSelectProspect,
  onConvertToClient
}) => {
  const { clients, prospects, appointments, sessions } = database;

  const [showAllClientsInDashboard, setShowAllClientsInDashboard] = useState(false);
  const [clientSearchInDashboard, setClientSearchInDashboard] = useState('');

  // Sort ALL clients strictly by eventDate ascending
  const allClientsSortedByDate = [...clients].sort((a, b) => a.eventDate.localeCompare(b.eventDate));

  // Filtered clients for Resumen view
  const dashboardClientsToDisplay = allClientsSortedByDate.filter((c) => {
    if (!clientSearchInDashboard.trim()) return true;
    const term = clientSearchInDashboard.toLowerCase();
    return c.name.toLowerCase().includes(term) || (c.location || '').toLowerCase().includes(term) || c.packageContracted.toLowerCase().includes(term);
  });

  // Top upcoming clients
  const upcomingClients = allClientsSortedByDate.slice(0, 4);

  // Sort upcoming appointments chronologically by date and time
  const upcomingAppointments = [...appointments]
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .slice(0, 4);

  // Priority prospects sorted by date
  const priorityProspects = [...prospects]
    .filter((p) => p.status !== 'Ganado' && p.status !== 'Perdido')
    .sort((a, b) => (a.estimatedDate || a.createdAt).localeCompare(b.estimatedDate || b.createdAt))
    .slice(0, 4);

  const formatBadgeDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
        const day = parts[2];
        const month = months[parseInt(parts[1], 10) - 1] || 'MES';
        return { day, month };
      }
    } catch (e) {}
    return { day: '15', month: 'NOV' };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Top 5 KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* Prospectos */}
        <button
          onClick={() => onNavigate('prospects')}
          className="text-left bg-white p-4 rounded-2xl border border-[#E8E2D8] hover:border-[#C85A32] shadow-xs hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">Prospectos</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif font-bold text-2xl sm:text-3xl text-[#181715] mt-2">
            {prospects.length}
          </p>
          <p className="text-[11px] text-[#78716C] mt-0.5">En seguimiento activo</p>
        </button>

        {/* Clientes */}
        <button
          onClick={() => onNavigate('clients')}
          className="text-left bg-white p-4 rounded-2xl border border-[#E8E2D8] hover:border-[#C85A32] shadow-xs hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">Clientes</span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF0EB] text-[#C85A32] flex items-center justify-center group-hover:scale-110 transition">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif font-bold text-2xl sm:text-3xl text-[#C85A32] mt-2">
            {clients.length}
          </p>
          <p className="text-[11px] text-[#78716C] mt-0.5">Contratos vigentes</p>
        </button>

        {/* Próximos Eventos */}
        <button
          onClick={() => onNavigate('calendar')}
          className="text-left bg-white p-4 rounded-2xl border border-[#E8E2D8] hover:border-[#C85A32] shadow-xs hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">Próx. Eventos</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif font-bold text-2xl sm:text-3xl text-[#181715] mt-2">
            {clients.length}
          </p>
          <p className="text-[11px] text-[#78716C] mt-0.5">Bodas y XV agendados</p>
        </button>

        {/* Citas Agendadas */}
        <button
          onClick={() => onNavigate('appointments')}
          className="text-left bg-white p-4 rounded-2xl border border-amber-200 bg-gradient-to-br from-white to-amber-50/30 hover:border-amber-400 shadow-xs hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Citas Activas</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif font-bold text-2xl sm:text-3xl text-amber-700 mt-2">
            {appointments.length}
          </p>
          <p className="text-[11px] text-[#78716C] mt-0.5">Llamadas y citas en estudio</p>
        </button>

        {/* Sesiones Foto/Video */}
        <button
          onClick={() => onNavigate('sessions')}
          className="col-span-2 sm:col-span-1 text-left bg-white p-4 rounded-2xl border border-[#E8E2D8] hover:border-[#C85A32] shadow-xs hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">Sesiones</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif font-bold text-2xl sm:text-3xl text-[#181715] mt-2">
            {sessions.length}
          </p>
          <p className="text-[11px] text-[#78716C] mt-0.5">Pre-bodas y vestidos XV</p>
        </button>

      </div>

      {/* 2. Expanded Quick Actions Panel */}
      <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#FAF0EB] text-[#C85A32] flex items-center justify-center font-bold text-xs">
              ⚡
            </div>
            <h3 className="font-serif font-bold text-base text-[#181715]">Accesos Rápidos</h3>
          </div>
          <span className="text-xs text-[#78716C]">Acciones directas de un toque</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {/* 1. Nuevo Cliente */}
          <button
            onClick={onOpenNewClient}
            className="p-3 bg-[#FAF0EB]/60 hover:bg-[#FAF0EB] border border-[#F0DDD4] hover:border-[#C85A32] rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition group shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-[#C85A32] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#181715] leading-tight">Nuevo Cliente</span>
            <span className="text-[10px] text-[#78716C]">Contrato Boda/XV</span>
          </button>

          {/* 2. Nuevo Prospecto */}
          <button
            onClick={onOpenNewProspect}
            className="p-3 bg-blue-50/50 hover:bg-blue-50 border border-blue-200 hover:border-blue-500 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition group shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#181715] leading-tight">Nuevo Prospecto</span>
            <span className="text-[10px] text-[#78716C]">Cotización</span>
          </button>

          {/* 3. Agendar Cita */}
          <button
            onClick={onOpenNewAppointment}
            className="p-3 bg-amber-50/50 hover:bg-amber-50 border border-amber-200 hover:border-amber-500 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition group shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#181715] leading-tight">Agendar Cita</span>
            <span className="text-[10px] text-[#78716C]">Meet / Estudio</span>
          </button>

          {/* 4. Programar Sesión */}
          <button
            onClick={() => onOpenNewSession ? onOpenNewSession() : onNavigate('sessions')}
            className="p-3 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-200 hover:border-indigo-500 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition group shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition">
              <Video className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#181715] leading-tight">Nueva Sesión</span>
            <span className="text-[10px] text-[#78716C]">Pre-boda / XV</span>
          </button>

          {/* 5. Foto con Cámara */}
          <button
            onClick={onOpenCamera}
            className="p-3 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-500 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition group shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#181715] leading-tight">Foto Cámara</span>
            <span className="text-[10px] text-[#78716C]">Contrato / Recibo</span>
          </button>

          {/* 6. Cal. Prospectos */}
          <button
            onClick={() => onNavigate('calendar-prospects')}
            className="p-3 bg-purple-50/50 hover:bg-purple-50 border border-purple-200 hover:border-purple-500 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition group shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#181715] leading-tight">Cal. Prospectos</span>
            <span className="text-[10px] text-[#78716C]">Fechas tentativas</span>
          </button>

          {/* 7. Cal. Clientes */}
          <button
            onClick={() => onNavigate('calendar')}
            className="p-3 bg-rose-50/50 hover:bg-rose-50 border border-rose-200 hover:border-rose-500 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition group shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#181715] leading-tight">Cal. Clientes</span>
            <span className="text-[10px] text-[#78716C]">Bodas en Mérida</span>
          </button>

          {/* 8. Respaldar / Exportar */}
          <button
            onClick={onOpenBackupModal}
            className="p-3 bg-amber-50/50 hover:bg-amber-50 border border-amber-200 hover:border-amber-500 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition group shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#181715] leading-tight">Exportar / Migrar</span>
            <span className="text-[10px] text-[#78716C]">Excel y JSON</span>
          </button>
        </div>
      </div>


      {/* 4. Upcoming Events Grid with Date Badges & Ver Clientes en Resumen */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-serif font-bold text-lg text-[#181715]">Cartera de Clientes &amp; Eventos en Yucatán</h2>
            <p className="text-xs text-[#78716C]">Haciendas y fechas ordenadas cronológicamente por fecha de evento</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAllClientsInDashboard(!showAllClientsInDashboard)}
              className="px-3.5 py-1.5 bg-[#FAF0EB] hover:bg-[#F4DDD3] text-[#C85A32] rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{showAllClientsInDashboard ? 'Mostrar solo próximos 4' : `Ver clientes en resumen (${clients.length})`}</span>
            </button>
            <button
              onClick={() => onNavigate('clients')}
              className="text-xs font-bold text-[#78716C] hover:text-[#C85A32] flex items-center gap-1"
            >
              <span>Ir a Cartera</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {showAllClientsInDashboard && (
          <div className="relative animate-in fade-in">
            <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar cliente en resumen por nombre, hacienda o paquete..."
              value={clientSearchInDashboard}
              onChange={(e) => setClientSearchInDashboard(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E8E2D8] rounded-xl text-xs focus:outline-none focus:border-[#C85A32]"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {(showAllClientsInDashboard ? dashboardClientsToDisplay : upcomingClients).map((c) => {
            const { day, month } = formatBadgeDate(c.eventDate);
            return (
              <div
                key={c.id}
                onClick={() => onSelectClient(c)}
                className="bg-white p-4 rounded-2xl border border-[#E8E2D8] hover:border-[#C85A32] transition shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3">
                    {/* Date Badge */}
                    <div className="w-12 h-14 rounded-xl bg-[#FAF0EB] border border-[#F0DDD4] flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-[#C85A32] leading-none uppercase">{month}</span>
                      <span className="font-serif font-extrabold text-xl text-[#181715] leading-none mt-1">{day}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        c.eventType === 'Boda' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {c.eventType}
                      </span>
                      <h4 className="font-serif font-bold text-sm text-[#181715] truncate mt-1">
                        {c.name}
                      </h4>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-[#57534E] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />
                    <span className="truncate">{c.location}</span>
                  </div>

                  <div className="mt-3 p-2.5 bg-[#FBF9F5] rounded-xl text-xs space-y-1 border border-[#E8E2D8]/60">
                    <p className="text-[11px] font-semibold text-[#8F3717] truncate">{c.packageContracted}</p>
                    <div className="flex justify-between items-center text-[11px] pt-1 border-t border-[#E8E2D8]">
                      <span className="text-[#78716C]">Saldo:</span>
                      <span className={`font-mono font-bold ${c.balanceDue > 0 ? 'text-[#C85A32]' : 'text-emerald-600'}`}>
                        ${c.balanceDue.toLocaleString('es-MX')} MXN
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#E8E2D8] flex items-center justify-between">
                  <span className="text-[11px] text-[#78716C]">{c.city || 'Mérida'}</span>
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {c.phone && (
                      <a
                        href={`tel:${c.phone}`}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                        title="Llamar"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => {
                        const msg = generateWhatsAppMessage('greeting', { clientName: c.name });
                        openWhatsApp(c.phone, msg);
                      }}
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                      title="Enviar WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Split Section: Upcoming Appointments & Priority Prospects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Next Appointments */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="font-serif font-bold text-base text-[#181715]">Próximas Citas y Videollamadas</h3>
            </div>
            <button
              onClick={() => onNavigate('appointments')}
              className="text-xs font-bold text-[#C85A32] hover:underline"
            >
              Ver agenda
            </button>
          </div>

          <div className="space-y-2.5">
            {upcomingAppointments.length === 0 ? (
              <p className="text-xs text-[#A8A29E] italic py-4 text-center">No hay citas agendadas.</p>
            ) : (
              upcomingAppointments.map((app) => (
                <div
                  key={app.id}
                  className="p-3 bg-[#FBF9F5] border border-[#E8E2D8] rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#181715] truncate">{app.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800">
                        {app.type}
                      </span>
                    </div>
                    <p className="text-[#78716C] mt-0.5">
                      📅 {app.date} a las {app.time} hrs • <strong>{app.relatedTo.name}</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {app.relatedTo.phone && (
                      <a
                        href={`tel:${app.relatedTo.phone}`}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition"
                        title={`Llamar a ${app.relatedTo.name}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => {
                        const msg = generateWhatsAppMessage('appointment', {
                          clientName: app.relatedTo.name,
                          date: app.date,
                          time: app.time,
                          location: app.locationOrLink,
                          appointmentTitle: app.title
                        });
                        openWhatsApp(app.relatedTo.phone || '', msg);
                      }}
                      className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition"
                      title="Recordatorio por WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Priority Prospects */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <h3 className="font-serif font-bold text-base text-[#181715]">Prospectos Prioritarios</h3>
            </div>
            <button
              onClick={() => onNavigate('prospects')}
              className="text-xs font-bold text-[#C85A32] hover:underline"
            >
              Ver todos
            </button>
          </div>

          <div className="space-y-2.5">
            {priorityProspects.length === 0 ? (
              <p className="text-xs text-[#A8A29E] italic py-4 text-center">No hay prospectos en seguimiento.</p>
            ) : (
              priorityProspects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProspect(p)}
                  className="p-3 bg-[#FBF9F5] border border-[#E8E2D8] hover:border-[#C85A32] rounded-xl flex items-center justify-between gap-3 text-xs cursor-pointer transition"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#181715] truncate">{p.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-blue-100 text-blue-800">
                        {p.status}
                      </span>
                    </div>
                    <p className="text-[#78716C] mt-0.5 truncate">
                      {p.eventType} • {p.interestedPackage}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onConvertToClient(p)}
                      className="px-2.5 py-1.5 bg-[#C85A32] hover:bg-[#B24B25] text-white rounded-lg text-[11px] font-bold transition shadow-xs"
                      title="Convertir a cliente"
                    >
                      Convertir
                    </button>
                    {p.phone && (
                      <a
                        href={`tel:${p.phone}`}
                        className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                        title={`Llamar a ${p.name}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => {
                        const msg = generateWhatsAppMessage('quote', { clientName: p.name, eventType: p.eventType });
                        openWhatsApp(p.phone, msg);
                      }}
                      className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition"
                      title="WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
