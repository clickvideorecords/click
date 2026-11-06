import React, { useState } from 'react';
import { 
  X, Phone, Mail, Calendar, MapPin, DollarSign, Camera, 
  FileText, Plus, CheckCircle, Clock, Sparkles, MessageSquare, Eye, Download 
} from 'lucide-react';
import { Client, Prospect, Session, FileAttachment } from '../types';
import { openWhatsApp, generateWhatsAppMessage } from '../utils/whatsapp';
import { DocumentViewerModal } from './DocumentViewerModal';

interface ContactDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  prospect?: Prospect | null;
  sessions?: Session[];
  files?: FileAttachment[];
  onOpenAddSession?: (clientId: string) => void;
  onOpenCameraForContact?: (type: 'client' | 'prospect', id: string) => void;
  onConvertToClient?: (prospect: Prospect) => void;
  onRecordPayment?: (client: Client, amount: number) => void;
}

export const ContactDrawer: React.FC<ContactDrawerProps> = ({
  isOpen,
  onClose,
  client,
  prospect,
  sessions = [],
  files = [],
  onOpenAddSession,
  onOpenCameraForContact,
  onConvertToClient,
  onRecordPayment
}) => {
  if (!isOpen || (!client && !prospect)) return null;

  const isClient = !!client;
  const item = client || prospect!;

  const handleWhatsApp = () => {
    if (isClient && client) {
      const msg = generateWhatsAppMessage('greeting', { clientName: client.name });
      openWhatsApp(client.phone, msg);
    } else if (prospect) {
      const msg = generateWhatsAppMessage('quote', {
        clientName: prospect.name,
        eventType: prospect.eventType
      });
      openWhatsApp(prospect.phone, msg);
    }
  };

  const handleBalanceReminderWhatsApp = () => {
    if (client) {
      const msg = generateWhatsAppMessage('balance', {
        clientName: client.name,
        eventType: client.eventType,
        eventDate: client.eventDate,
        balanceDue: client.balanceDue
      });
      openWhatsApp(client.phone, msg);
    }
  };

  const [selectedViewerFile, setSelectedViewerFile] = useState<FileAttachment | null>(null);

  const contactFiles = [
    ...files.filter(
      (f) => (isClient && f.relatedType === 'client' && f.relatedId === client?.id) ||
             (!isClient && f.relatedType === 'prospect' && f.relatedId === prospect?.id)
    ),
    ...((!isClient && prospect?.files) ? prospect.files : [])
  ];

  const contactSessions = isClient 
    ? sessions.filter((s) => s.clientId === client?.id) 
    : [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-md h-full shadow-2xl flex flex-col border-l border-[#E8E2D8] overflow-hidden animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-6 bg-[#181715] text-white flex items-start justify-between border-b border-[#33302B]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isClient ? 'bg-[#C85A32] text-white' : 'bg-blue-600 text-white'
              }`}>
                {isClient ? 'Cliente Activo' : `Prospecto • ${prospect?.status}`}
              </span>
              {client?.isVip && (
                <span className="text-[10px] px-2 py-0.5 bg-yellow-400 text-black font-extrabold rounded">
                  VIP
                </span>
              )}
            </div>
            <h2 className="font-serif font-bold text-2xl tracking-tight leading-snug">
              {item.name}
            </h2>
            <p className="text-xs text-[#A8A29E] mt-0.5">
              {item.eventType} {client ? `• ${client.eventDate}` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#282624] flex items-center justify-center text-white/70 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick action bar */}
        <div className="flex border-b border-[#E8E2D8] bg-[#FAF0EB]/60 p-2.5 gap-2">
          <button
            onClick={handleWhatsApp}
            className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            WhatsApp
          </button>
          <a
            href={`tel:${item.phone}`}
            className="py-2 px-3 bg-white hover:bg-[#F4EFEA] text-[#181715] border border-[#E8E2D8] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5 text-[#C85A32]" />
            Llamar
          </a>
          {onOpenCameraForContact && (
            <button
              onClick={() => onOpenCameraForContact(isClient ? 'client' : 'prospect', item.id)}
              className="py-2 px-3 bg-[#C85A32] hover:bg-[#B24B25] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
              title="Fotografiar contrato o recibo"
            >
              <Camera className="w-3.5 h-3.5" />
              Cámara
            </button>
          )}
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Prospect Conversion Prompt */}
          {!isClient && prospect && onConvertToClient && (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C85A32]" />
                <h4 className="font-serif font-bold text-sm text-[#181715]">¿Listo para contratar?</h4>
              </div>
              <p className="text-xs text-[#78716C]">
                Pasa automáticamente este prospecto a tu cartera activa de clientes con contrato.
              </p>
              <button
                onClick={() => onConvertToClient(prospect)}
                className="w-full py-2 bg-[#C85A32] hover:bg-[#B24B25] text-white rounded-xl text-xs font-bold transition shadow"
              >
                Convertir a Cliente Ahora
              </button>
            </div>
          )}

          {/* Details Card */}
          <div className="bg-[#FBF9F5] p-4 rounded-2xl border border-[#E8E2D8] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#78716C]">Información del Evento</h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5 text-[#57534E]">
                <Calendar className="w-4 h-4 text-[#C85A32]" />
                <span>
                  <strong>Fecha:</strong> {isClient ? client?.eventDate : (prospect?.estimatedDate || 'Por definir')} 
                  {client?.eventTime ? ` a las ${client.eventTime} hrs` : ''}
                </span>
              </div>

              {isClient && client?.location && (
                <div className="flex items-start gap-2.5 text-[#57534E]">
                  <MapPin className="w-4 h-4 text-[#C85A32] shrink-0 mt-0.5" />
                  <span>
                    <strong>Locación:</strong> {client.location} ({client.city || 'Mérida'})
                  </span>
                </div>
              )}

              {isClient && client?.partnerName && (
                <div className="flex items-center gap-2.5 text-[#57534E]">
                  <span className="text-xs">💍</span>
                  <span><strong>Celebrado(s):</strong> {client.partnerName}</span>
                </div>
              )}

              {isClient && client?.church && (
                <div className="flex items-start gap-2.5 text-[#57534E]">
                  <span className="text-xs shrink-0 mt-0.5">⛪</span>
                  <span><strong>Iglesia:</strong> {client.church}</span>
                </div>
              )}

              {isClient && client?.sessionLocation && (
                <div className="flex items-start gap-2.5 text-[#57534E]">
                  <span className="text-xs shrink-0 mt-0.5">📷</span>
                  <span><strong>Locación de Sesión:</strong> {client.sessionLocation}</span>
                </div>
              )}

              <div className="flex items-center gap-2.5 text-[#57534E]">
                <Phone className="w-4 h-4 text-[#C85A32]" />
                <span><strong>Teléfono:</strong> {item.phone}</span>
              </div>

              {item.email && (
                <div className="flex items-center gap-2.5 text-[#57534E]">
                  <Mail className="w-4 h-4 text-[#C85A32]" />
                  <span><strong>Email:</strong> {item.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Financial Breakdown (Clients) */}
          {isClient && client && (
            <div className="bg-white p-4 rounded-2xl border border-[#E8E2D8] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#78716C]">Control Financiero</h3>
                <span className="text-[11px] font-bold text-[#8F3717] bg-[#FAF0EB] px-2 py-0.5 rounded-full">
                  {client.packageContracted}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2.5 bg-[#FBF9F5] rounded-xl border border-[#E8E2D8]">
                  <p className="text-[10px] text-[#78716C] font-semibold">Total</p>
                  <p className="font-serif font-bold text-sm text-[#181715] mt-0.5">
                    ${Number(client.totalPrice).toLocaleString('es-MX')}
                  </p>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-[10px] text-emerald-700 font-semibold">Anticipo</p>
                  <p className="font-serif font-bold text-sm text-emerald-700 mt-0.5">
                    ${Number(client.advancePaid).toLocaleString('es-MX')}
                  </p>
                </div>
                <div className="p-2.5 bg-[#FAF0EB] rounded-xl border border-rose-100">
                  <p className="text-[10px] text-[#8F3717] font-semibold">Saldo</p>
                  <p className="font-serif font-bold text-sm text-[#C85A32] mt-0.5">
                    ${Number(client.balanceDue).toLocaleString('es-MX')}
                  </p>
                </div>
              </div>

              {client.balanceDue > 0 && (
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={handleBalanceReminderWhatsApp}
                    className="flex-1 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition"
                  >
                    Recordar Saldo por WhatsApp
                  </button>
                  {onRecordPayment && (
                    <button
                      onClick={() => {
                        const amt = prompt('Ingresa el monto del abono recibido ($ MXN):', '5000');
                        if (amt && !isNaN(Number(amt))) {
                          onRecordPayment(client, Number(amt));
                        }
                      }}
                      className="px-3 py-2 text-xs font-bold text-white bg-[#C85A32] hover:bg-[#B24B25] rounded-xl shadow-xs transition"
                    >
                      + Abono
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Linked Sessions (Clients) */}
          {isClient && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                  Sesiones Fotográficas ({contactSessions.length})
                </h3>
                {onOpenAddSession && client && (
                  <button
                    onClick={() => onOpenAddSession(client.id)}
                    className="inline-flex items-center gap-1 text-xs text-[#C85A32] hover:underline font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Agendar
                  </button>
                )}
              </div>

              {contactSessions.length === 0 ? (
                <p className="text-xs text-[#A8A29E] italic bg-[#FBF9F5] p-3 rounded-xl border border-dashed border-[#E8E2D8]">
                  No hay sesiones de foto o video programadas aún para este cliente.
                </p>
              ) : (
                <div className="space-y-2">
                  {contactSessions.map((s) => (
                    <div key={s.id} className="p-3 bg-white border border-[#E8E2D8] rounded-xl text-xs space-y-1">
                      <div className="flex justify-between font-bold text-[#181715]">
                        <span>{s.type}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                          {s.status}
                        </span>
                      </div>
                      <p className="text-[#78716C]">📅 {s.date} a las {s.time} hrs</p>
                      <p className="text-[#57534E]">📍 {s.location}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Files / Attached Documents & Camera Photos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                Expediente &amp; Fotos ({contactFiles.length})
              </h3>
            </div>

            {contactFiles.length === 0 ? (
              <p className="text-xs text-[#A8A29E] italic bg-[#FBF9F5] p-3 rounded-xl border border-dashed border-[#E8E2D8]">
                No hay contratos o fotografías capturadas aún. Usa el botón Cámara arriba para añadir.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {contactFiles.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => setSelectedViewerFile(f)}
                    className="p-2.5 bg-white border border-[#E8E2D8] hover:border-[#C85A32] rounded-xl text-xs flex flex-col justify-between cursor-pointer transition shadow-2xs hover:shadow-xs group"
                  >
                    {f.dataUrl ? (
                      <div className="aspect-4/3 rounded-lg overflow-hidden mb-2 bg-neutral-100 border border-[#E8E2D8] relative">
                        <img src={f.dataUrl} alt={f.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                        <span className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                          <Eye className="w-4 h-4" />
                        </span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-[#FAF0EB] group-hover:bg-[#F0DDD4] text-[#C85A32] flex items-center justify-center mb-2 transition">
                        <FileText className="w-4 h-4" />
                      </div>
                    )}
                    <p className="font-semibold text-[#181715] truncate text-[11px] group-hover:text-[#C85A32] transition">
                      {f.name}
                    </p>
                    <div className="flex items-center justify-between text-[9px] text-[#A8A29E] mt-0.5">
                      <span>{f.size || 'Archivo'}</span>
                      <span className="text-[#C85A32] font-semibold flex items-center gap-0.5">
                        <Eye className="w-2.5 h-2.5" /> Ver
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          {item.notes && (
            <div className="p-3.5 bg-[#FAF0EB]/60 border border-[#E8E2D8] rounded-2xl text-xs space-y-1">
              <h4 className="font-bold text-[#8F3717]">Notas y Observaciones:</h4>
              <p className="text-[#57534E] whitespace-pre-wrap leading-relaxed">{item.notes}</p>
            </div>
          )}

        </div>

      </div>

      {/* Universal Document Viewer Modal (PDF, JPEG, TXT) */}
      {selectedViewerFile && (
        <DocumentViewerModal
          file={selectedViewerFile}
          onClose={() => setSelectedViewerFile(null)}
        />
      )}
    </div>
  );
};
