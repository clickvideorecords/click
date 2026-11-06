import React, { useState } from 'react';
import { 
  Plus, Calendar, Clock, Video, Phone, MapPin, 
  CheckCircle, XCircle, MessageSquare, Trash2, ExternalLink, 
  Tag, Edit2, FileText, Paperclip, ChevronDown, ChevronUp, 
  PhoneCall, ArrowUpDown, X, Link as LinkIcon 
} from 'lucide-react';
import { Appointment, AppointmentStatus, FileAttachment } from '../types';
import { openWhatsApp, generateWhatsAppMessage } from '../utils/whatsapp';

interface AppointmentsViewProps {
  appointments: Appointment[];
  onOpenNewAppointment: () => void;
  onEditAppointment: (appointment: Appointment) => void;
  onUpdateStatus: (appointmentId: string, status: AppointmentStatus) => void;
  onDeleteAppointment: (appointmentId: string) => void;
  onSaveAppointment: (appointment: Appointment) => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  onOpenNewAppointment,
  onEditAppointment,
  onUpdateStatus,
  onDeleteAppointment,
  onSaveAppointment
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'date_asc' | 'date_desc'>('date_asc');
  
  // Interactive mini-states for each appointment card
  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);
  const [quickNoteInputs, setQuickNoteInputs] = useState<{ [id: string]: string }>({});
  const [quickFileInputs, setQuickFileInputs] = useState<{ [id: string]: string }>({});
  const [isAddingFileId, setIsAddingFileId] = useState<string | null>(null);
  const [callModalApp, setCallModalApp] = useState<Appointment | null>(null);
  const [callNoteText, setCallNoteText] = useState('');

  // Collect all unique tags for filter
  const allTags = Array.from(
    new Set(appointments.flatMap((a) => a.tags || []).filter(Boolean))
  );

  // Filter and sort appointments strictly by date
  const filtered = appointments
    .filter((a) => {
      const matchesType = filterType === 'all' || a.type === filterType;
      const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
      const matchesTag = selectedTag === 'all' || (a.tags && a.tags.includes(selectedTag));
      return matchesType && matchesStatus && matchesTag;
    })
    .sort((a, b) => {
      const dtA = `${a.date} ${a.time}`;
      const dtB = `${b.date} ${b.time}`;
      return sortOrder === 'date_asc' ? dtA.localeCompare(dtB) : dtB.localeCompare(dtA);
    });

  const getRelativeDateBadge = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return { label: 'Hoy', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    
    const d1 = new Date(dateStr);
    const d2 = new Date(today);
    const diffDays = Math.ceil((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return { label: 'Mañana', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    if (diffDays > 1 && diffDays <= 7) return { label: `En ${diffDays} días`, color: 'bg-amber-100 text-amber-800 border-amber-200' };
    if (diffDays < 0) return { label: 'Pasada', color: 'bg-gray-100 text-gray-600 border-gray-200' };
    return { label: dateStr, color: 'bg-[#F4EFEA] text-[#57534E] border-[#E8E2D8]' };
  };

  const handleAddQuickNote = (app: Appointment) => {
    const newNote = quickNoteInputs[app.id]?.trim();
    if (!newNote) return;

    const existingNotes = app.notes ? `${app.notes}\n• [${new Date().toLocaleDateString('es-MX')}] ${newNote}` : `• [${new Date().toLocaleDateString('es-MX')}] ${newNote}`;
    
    onSaveAppointment({
      ...app,
      notes: existingNotes
    });

    setQuickNoteInputs((prev) => ({ ...prev, [app.id]: '' }));
  };

  const handleAddQuickFile = (app: Appointment) => {
    const fileUrl = quickFileInputs[app.id]?.trim();
    if (!fileUrl) return;

    const newAttachment: FileAttachment = {
      id: `file-${Date.now()}`,
      name: fileUrl.includes('drive.google.com') ? 'Google Drive / Documento' : fileUrl.split('/').pop() || 'Archivo adjunto',
      url: fileUrl,
      uploadedAt: new Date().toISOString(),
      relatedType: 'general'
    };

    onSaveAppointment({
      ...app,
      files: [...(app.files || []), newAttachment]
    });

    setQuickFileInputs((prev) => ({ ...prev, [app.id]: '' }));
    setIsAddingFileId(null);
  };

  const handleSaveCallLog = () => {
    if (!callModalApp || !callNoteText.trim()) return;

    const newCall = {
      id: `call-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      notes: callNoteText.trim()
    };

    const updatedNotes = callModalApp.notes
      ? `${callModalApp.notes}\n📞 Llamada (${newCall.date} ${newCall.time}): ${newCall.notes}`
      : `📞 Llamada (${newCall.date} ${newCall.time}): ${newCall.notes}`;

    onSaveAppointment({
      ...callModalApp,
      notes: updatedNotes,
      callHistory: [...(callModalApp.callHistory || []), newCall]
    });

    setCallModalApp(null);
    setCallNoteText('');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-bold text-2xl text-[#181715]">Citas &amp; Videollamadas</h1>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full">
              {appointments.length} citas
            </span>
          </div>
          <p className="text-xs text-[#78716C] mt-0.5">
            Organizadas cronológicamente con etiquetas, llamadas, recordatorios de WhatsApp y notas adjuntas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortOrder(sortOrder === 'date_asc' ? 'date_desc' : 'date_asc')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#F4EFEA] hover:bg-[#E8E2D8] text-[#57534E] rounded-xl text-xs font-bold transition"
            title="Cambiar orden de fechas"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortOrder === 'date_asc' ? 'Próximas primero' : 'Recientes primero'}</span>
          </button>
          <button
            onClick={onOpenNewAppointment}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#C85A32] hover:bg-[#B24B25] text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Agendar Cita
          </button>
        </div>
      </div>

      {/* Tag Filter Chips & Dropdowns */}
      <div className="space-y-2.5 bg-white p-4 rounded-2xl border border-[#E8E2D8]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#78716C] flex items-center gap-1 mr-1">
            <Tag className="w-3 h-3 text-[#C85A32]" />
            Etiquetas:
          </span>
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              selectedTag === 'all'
                ? 'bg-[#C85A32] text-white'
                : 'bg-[#F4EFEA] text-[#57534E] hover:bg-[#E8E2D8]'
            }`}
          >
            Todas
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(t)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                selectedTag === t
                  ? 'bg-[#C85A32] text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <span>🏷️</span>
              <span>{t}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2.5 pt-2 border-t border-[#E8E2D8]">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 bg-[#FBF9F5] border border-[#E8E2D8] rounded-xl text-xs font-bold text-[#57534E] focus:outline-none focus:border-[#C85A32]"
          >
            <option value="all">Todas las Modalidades</option>
            <option value="Videollamada">Videollamadas (Meet)</option>
            <option value="Presencial">Presenciales en Estudio</option>
            <option value="Llamada telefónica">Llamadas Telefónicas</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-[#FBF9F5] border border-[#E8E2D8] rounded-xl text-xs font-bold text-[#57534E] focus:outline-none focus:border-[#C85A32]"
          >
            <option value="all">Todos los Estados</option>
            <option value="Confirmada">Confirmadas</option>
            <option value="Programada">Programadas</option>
            <option value="Realizada">Realizadas</option>
            <option value="Cancelada">Canceladas</option>
          </select>
        </div>
      </div>

      {/* Appointments List - strictly sorted by date */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[#E8E2D8] p-12 text-center space-y-3">
          <p className="font-serif text-lg text-[#181715] font-bold">No hay citas que coincidan</p>
          <p className="text-xs text-[#78716C]">Ajusta los filtros de búsqueda o agenda una nueva cita con prospectos o clientes.</p>
          <button
            onClick={onOpenNewAppointment}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C85A32] text-white rounded-xl text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            Agendar Ahora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {filtered.map((app) => {
            const relBadge = getRelativeDateBadge(app.date);
            const isNotesExpanded = expandedNotesId === app.id;

            return (
              <div
                key={app.id}
                className="bg-white p-5 rounded-2xl border border-[#E8E2D8] hover:border-[#C85A32] shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Card Header: Type Badge, Relative Date & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        app.type === 'Videollamada'
                          ? 'bg-blue-100 text-blue-800'
                          : app.type === 'Presencial'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {app.type}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${relBadge.color}`}>
                        {relBadge.label}
                      </span>
                    </div>

                    <select
                      value={app.status}
                      onChange={(e) => onUpdateStatus(app.id, e.target.value as AppointmentStatus)}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#E8E2D8] bg-[#FBF9F5] focus:outline-none"
                    >
                      <option value="Confirmada">Confirmada</option>
                      <option value="Programada">Programada</option>
                      <option value="Realizada">Realizada</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>
                  </div>

                  {/* Title & Date Details */}
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#181715] leading-snug">
                      {app.title}
                    </h3>
                    <div className="mt-2 space-y-1 text-xs text-[#57534E]">
                      <div className="flex items-center gap-1.5 font-bold text-[#C85A32]">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{app.date} • {app.time} hrs</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#78716C]">Con:</span>
                        <strong className="text-[#181715]">{app.relatedTo.name}</strong>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-[#78716C] uppercase font-bold">
                          {app.relatedTo.type === 'client' ? 'Cliente' : 'Prospecto'}
                        </span>
                      </div>
                      {app.locationOrLink && (
                        <div className="flex items-start gap-1.5 text-[11px] text-[#78716C]">
                          <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#C85A32]" />
                          <span className="truncate">{app.locationOrLink}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ETIQUETAS DE LA CITA */}
                  {app.tags && app.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {app.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF0EB] text-[#8F3717] font-semibold border border-[#F0DDD4]"
                        >
                          🏷️ {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* NOTAS Y ACUERDOS */}
                  <div className="pt-2 border-t border-[#E8E2D8] text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#57534E] flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-[#78716C]" />
                        Notas ({app.notes ? '1' : '0'})
                      </span>
                      <button
                        onClick={() => setExpandedNotesId(isNotesExpanded ? null : app.id)}
                        className="text-[11px] text-[#C85A32] font-bold hover:underline flex items-center gap-0.5"
                      >
                        {isNotesExpanded ? 'Ocultar' : 'Ver notas'}
                        {isNotesExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>

                    {isNotesExpanded && (
                      <div className="mt-2 space-y-2 p-2.5 bg-[#FAF0EB]/50 rounded-xl border border-[#F0DDD4] animate-in fade-in">
                        {app.notes ? (
                          <p className="text-xs text-[#57534E] whitespace-pre-line leading-relaxed">
                            {app.notes}
                          </p>
                        ) : (
                          <p className="text-[11px] text-[#A8A29E] italic">Sin notas registradas aún.</p>
                        )}

                        {/* Quick Note Input */}
                        <div className="flex gap-1.5 pt-1">
                          <input
                            type="text"
                            placeholder="Agregar apunte rápido..."
                            value={quickNoteInputs[app.id] || ''}
                            onChange={(e) => setQuickNoteInputs({ ...quickNoteInputs, [app.id]: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddQuickNote(app);
                            }}
                            className="flex-1 px-2.5 py-1 bg-white border border-[#E8E2D8] rounded-lg text-xs focus:outline-none focus:border-[#C85A32]"
                          />
                          <button
                            onClick={() => handleAddQuickNote(app)}
                            className="px-2.5 py-1 bg-[#C85A32] text-white text-[11px] font-bold rounded-lg hover:bg-[#B24B25]"
                          >
                            Añadir
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ARCHIVOS Y DOCUMENTOS ADJUNTOS */}
                  <div className="pt-2 border-t border-[#E8E2D8] text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#57534E] flex items-center gap-1">
                        <Paperclip className="w-3.5 h-3.5 text-[#78716C]" />
                        Archivos ({app.files?.length || 0})
                      </span>
                      <button
                        onClick={() => setIsAddingFileId(isAddingFileId === app.id ? null : app.id)}
                        className="text-[11px] text-emerald-700 font-bold hover:underline"
                      >
                        + Adjuntar
                      </button>
                    </div>

                    {/* Attached files list */}
                    {app.files && app.files.length > 0 && (
                      <div className="mt-1.5 space-y-1">
                        {app.files.map((f) => (
                          <a
                            key={f.id}
                            href={f.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 p-1.5 bg-[#FBF9F5] border border-[#E8E2D8] hover:border-emerald-500 rounded-lg text-[11px] text-[#181715] transition truncate"
                          >
                            <LinkIcon className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate flex-1 font-medium">{f.name}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-[#78716C] shrink-0" />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Quick attach file form */}
                    {isAddingFileId === app.id && (
                      <div className="mt-2 p-2 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-1.5 animate-in fade-in">
                        <input
                          type="text"
                          placeholder="Link de Drive o nombre de archivo..."
                          value={quickFileInputs[app.id] || ''}
                          onChange={(e) => setQuickFileInputs({ ...quickFileInputs, [app.id]: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-[#E8E2D8] rounded-lg text-xs focus:outline-none focus:border-emerald-600"
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setIsAddingFileId(null)}
                            className="px-2 py-1 text-[11px] text-[#78716C]"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleAddQuickFile(app)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold"
                          >
                            Guardar Archivo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions: WhatsApp, Llamar, Editar, Eliminar */}
                <div className="mt-4 pt-3 border-t border-[#E8E2D8] flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    {/* WhatsApp */}
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
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-2xs"
                      title="Abrir WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>

                    {/* Llamadas */}
                    {app.relatedTo.phone ? (
                      <a
                        href={`tel:${app.relatedTo.phone}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-2xs"
                        title={`Llamar a ${app.relatedTo.phone}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Llamar</span>
                      </a>
                    ) : (
                      <button
                        disabled
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-200 text-gray-400 rounded-xl text-xs font-bold cursor-not-allowed"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Sin tel.</span>
                      </button>
                    )}

                    {/* Registrar llamada realizada */}
                    <button
                      onClick={() => {
                        setCallModalApp(app);
                        setCallNoteText('');
                      }}
                      className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl transition"
                      title="Registrar llamada y notas de seguimiento"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Editar */}
                    <button
                      onClick={() => onEditAppointment(app)}
                      className="p-1.5 bg-[#FAF0EB] text-[#C85A32] hover:bg-[#F4DDD3] rounded-xl transition"
                      title="Editar cita"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Eliminar */}
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar la cita "${app.title}" con ${app.relatedTo.name}?`)) {
                          onDeleteAppointment(app.id);
                        }
                      }}
                      className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-xl transition"
                      title="Eliminar cita"
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

      {/* Mini-Modal para registrar notas de llamada telefónica */}
      {callModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#E8E2D8] space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#181715]">Registrar Llamada</h3>
                  <p className="text-xs text-[#78716C]">{callModalApp.relatedTo.name} • {callModalApp.relatedTo.phone || 'Teléfono no especificado'}</p>
                </div>
              </div>
              <button onClick={() => setCallModalApp(null)} className="p-1 text-[#78716C] hover:bg-[#E8E2D8] rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#57534E]">
                ¿Qué se acordó en la llamada? *
              </label>
              <textarea
                rows={4}
                value={callNoteText}
                onChange={(e) => setCallNoteText(e.target.value)}
                placeholder="Ej. Se le presentó el paquete Cinematográfico, quedaron de confirmar con el novio para el viernes..."
                className="w-full p-3 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E8E2D8]">
              <button
                type="button"
                onClick={() => setCallModalApp(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#57534E] hover:bg-[#E8E2D8]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCallLog}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Guardar en la Cita
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
