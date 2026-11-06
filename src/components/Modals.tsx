import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, MapPin, DollarSign, Phone, Mail, Clock, FileText, Camera, Tag, AlertCircle } from 'lucide-react';
import { Client, Prospect, Appointment, Session, NoteItem, EventType, ProspectStatus, PriorityLevel, AppointmentType, AppointmentStatus, SessionType, FileAttachment } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// -------------------------------------------------------------
// CLIENT MODAL (CREATE / EDIT)
// -------------------------------------------------------------
interface ClientModalProps extends ModalProps {
  clientToEdit?: Client | null;
  existingClients?: Client[];
  existingProspects?: Prospect[];
  onSave: (client: Client) => void;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  clientToEdit,
  existingClients = [],
  existingProspects = [],
  onSave
}) => {
  const [name, setName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [eventType, setEventType] = useState<EventType>('Boda');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [location, setLocation] = useState('');
  const [church, setChurch] = useState('');
  const [sessionLocation, setSessionLocation] = useState('');
  const [city, setCity] = useState('');
  const [packageContracted, setPackageContracted] = useState('');
  const [totalPrice, setTotalPrice] = useState<number | ''>('');
  const [advancePaid, setAdvancePaid] = useState<number | ''>('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isVip, setIsVip] = useState(false);
  const [notes, setNotes] = useState('');

  // Reset form when opening for new client, or populate when editing
  useEffect(() => {
    if (isOpen) {
      if (clientToEdit) {
        setName(clientToEdit.name || '');
        setPartnerName(clientToEdit.partnerName || '');
        setEventType(clientToEdit.eventType || 'Boda');
        setEventDate(clientToEdit.eventDate || '');
        setEventTime(clientToEdit.eventTime || '');
        setLocation(clientToEdit.location || '');
        setChurch(clientToEdit.church || '');
        setSessionLocation(clientToEdit.sessionLocation || '');
        setCity(clientToEdit.city || '');
        setPackageContracted(clientToEdit.packageContracted || '');
        setTotalPrice(clientToEdit.totalPrice ?? '');
        setAdvancePaid(clientToEdit.advancePaid ?? '');
        setPhone(clientToEdit.phone || '');
        setEmail(clientToEdit.email || '');
        setIsVip(clientToEdit.isVip || false);
        setNotes(clientToEdit.notes || '');
      } else {
        // Fresh reset for new client: all fields start completely blank
        setName('');
        setPartnerName('');
        setEventType('Boda');
        setEventDate('');
        setEventTime('');
        setLocation('');
        setChurch('');
        setSessionLocation('');
        setCity('');
        setPackageContracted('');
        setTotalPrice('');
        setAdvancePaid('');
        setPhone('');
        setEmail('');
        setIsVip(false);
        setNotes('');
      }
    }
  }, [isOpen, clientToEdit]);

  if (!isOpen) return null;

  // Duplicate checks
  const cleanName = name.trim().toLowerCase();
  const duplicateClient = cleanName.length > 2
    ? existingClients.find((c) => c.id !== clientToEdit?.id && c.name.trim().toLowerCase() === cleanName)
    : null;
  const duplicateProspect = cleanName.length > 2 && !duplicateClient
    ? existingProspects.find((p) => p.name.trim().toLowerCase() === cleanName)
    : null;
  const isSameAsMain = partnerName.trim().length > 2 && partnerName.trim().toLowerCase() === cleanName;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(totalPrice) || 0;
    const advance = Number(advancePaid) || 0;
    const balanceDue = Math.max(0, total - advance);
    const client: Client = {
      id: clientToEdit?.id || `cli-${Date.now()}`,
      name: name.trim(),
      partnerName: partnerName.trim() || undefined,
      eventType,
      eventDate,
      eventTime: eventTime.trim() || undefined,
      location: location.trim() || undefined,
      church: church.trim() || undefined,
      sessionLocation: sessionLocation.trim() || undefined,
      city: city.trim() || undefined,
      packageContracted: packageContracted.trim() || 'Por definir',
      totalPrice: total,
      advancePaid: advance,
      balanceDue,
      phone: phone.trim(),
      email: email.trim(),
      isVip,
      notes,
      createdAt: clientToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sessions: clientToEdit?.sessions || [],
      files: clientToEdit?.files || []
    };
    onSave(client);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#E8E2D8] max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E2D8] bg-[#FBF9F5]">
          <h2 className="font-serif font-bold text-xl text-[#181715]">
            {clientToEdit ? 'Editar Cliente' : 'Nuevo Cliente / Contrato'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[#E8E2D8] text-[#78716C]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Primary Name Field */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#57534E] mb-1">
                Nombre de cliente *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Sofía Morales"
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none transition ${
                  duplicateClient ? 'border-amber-400 bg-amber-50/20' : 'border-[#E8E2D8] focus:border-[#C85A32]'
                }`}
              />
              {duplicateClient && (
                <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>
                    Ya existe un cliente con este nombre: <strong>{duplicateClient.name}</strong> ({duplicateClient.eventType}). Verifica para evitar duplicarlo.
                  </span>
                </div>
              )}
              {duplicateProspect && (
                <div className="mt-1.5 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-blue-600" />
                  <span>
                    Este nombre ya está registrado en Prospectos como <strong>{duplicateProspect.name}</strong>.
                  </span>
                </div>
              )}
            </div>

            {/* Celebrated name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#57534E] mb-1">
                Nombre de celebrado o celebrados <span className="text-[#A8A29E] font-normal">(Opcional)</span>
              </label>
              <input
                type="text"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="Ej. Carlos Mendoza (Novio) o Valentina (Quinceañera)"
                className={`w-full px-3.5 py-2 bg-white border rounded-xl text-sm focus:outline-none transition ${
                  isSameAsMain ? 'border-amber-400 bg-amber-50/20' : 'border-[#E8E2D8] focus:border-[#C85A32]'
                }`}
              />
              {isSameAsMain ? (
                <p className="mt-1 text-[11px] text-amber-600 font-medium">
                  * Este nombre ya está en el contacto principal; no es necesario repetirlo en este campo.
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-[#A8A29E]">
                  * Nombre del novio/novia, festejada o festejados.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">
                Tipo de Evento *
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                className="w-full px-3.5 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
              >
                <option value="Boda">Boda</option>
                <option value="XV Años">XV Años</option>
                <option value="Graduación">Graduación</option>
                <option value="Social">Social</option>
                <option value="Empresarial">Empresarial</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">
                Fecha del Evento *
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">
                Hora de Inicio
              </label>
              <input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">
                Locación (Hacienda, Salón, Quinta) <span className="text-[#A8A29E] font-normal">(Opcional)</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej. Hacienda Teya, Quinta Montes Molina"
                className="w-full px-3.5 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            {/* Nuevo campo Iglesia */}
            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">
                Iglesia / Parroquia / Capilla <span className="text-[#A8A29E] font-normal">(Opcional)</span>
              </label>
              <input
                type="text"
                value={church}
                onChange={(e) => setChurch(e.target.value)}
                placeholder="Ej. Parroquia de Itzimná, Iglesia Santa Ana"
                className="w-full px-3.5 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            {/* Nuevo campo Lugar de Sesión */}
            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">
                Lugar de sesión <span className="text-[#A8A29E] font-normal">(Opcional)</span>
              </label>
              <input
                type="text"
                value={sessionLocation}
                onChange={(e) => setSessionLocation(e.target.value)}
                placeholder="Ej. Cenote Noh Mozon, Playa Sisal, Estudio"
                className="w-full px-3.5 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">
                Ciudad / Zona
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Mérida, Progreso, Sisal..."
                className="w-full px-3.5 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#57534E] mb-1">
                Paquete de Video / Fotografía Contratado *
              </label>
              <input
                type="text"
                required
                value={packageContracted}
                onChange={(e) => setPackageContracted(e.target.value)}
                placeholder="Ej. Paquete Cinematográfico 4K + Dron + Same Day Edit"
                className="w-full px-3.5 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">
                Precio Total del Contrato ($ MXN) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={totalPrice}
                onChange={(e) => setTotalPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">
                Anticipo Pagado ($ MXN)
              </label>
              <input
                type="number"
                min="0"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">
                Teléfono / WhatsApp *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+52 999 123 4567"
                className="w-full px-3.5 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contacto@ejemplo.com"
                className="w-full px-3.5 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isVip}
                  onChange={(e) => setIsVip(e.target.checked)}
                  className="rounded text-[#C85A32] focus:ring-[#C85A32] w-4 h-4"
                />
                <span className="text-xs font-bold text-[#181715]">
                  Cliente VIP / Producción de Alta Prioridad
                </span>
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#57534E] mb-1">
                Notas del Evento, Requerimientos Técnicos y Cronograma
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Horario de misa, permisos de dron, wedding planner, canciones clave..."
                className="w-full px-3.5 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8E2D8] flex items-center justify-between">
            <div className="text-xs text-[#78716C]">
              Saldo pendiente calculado:{' '}
              <strong className="text-[#C85A32] font-mono">
                ${Math.max(0, Number(totalPrice) - Number(advancePaid)).toLocaleString('es-MX')} MXN
              </strong>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#57534E] hover:bg-[#E8E2D8]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#C85A32] hover:bg-[#B24B25] text-white shadow"
              >
                {clientToEdit ? 'Guardar Cambios' : 'Registrar Cliente'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// PROSPECT MODAL (CREATE / EDIT)
// -------------------------------------------------------------
interface ProspectModalProps extends ModalProps {
  prospectToEdit?: Prospect | null;
  existingProspects?: Prospect[];
  existingClients?: Client[];
  onSave: (prospect: Prospect) => void;
}

export const ProspectModal: React.FC<ProspectModalProps> = ({
  isOpen,
  onClose,
  prospectToEdit,
  existingProspects = [],
  existingClients = [],
  onSave
}) => {
  const [name, setName] = useState('');
  const [eventType, setEventType] = useState<EventType>('Boda');
  const [estimatedDate, setEstimatedDate] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [interestedPackage, setInterestedPackage] = useState('');
  const [status, setStatus] = useState<ProspectStatus>('Nuevo');
  const [priority, setPriority] = useState<PriorityLevel>('Media');
  const [notes, setNotes] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);
  const [fileUrlInput, setFileUrlInput] = useState('');

  // Reset form when opening for new prospect, or populate when editing
  useEffect(() => {
    if (isOpen) {
      if (prospectToEdit) {
        setName(prospectToEdit.name || '');
        setEventType(prospectToEdit.eventType || 'Boda');
        setEstimatedDate(prospectToEdit.estimatedDate || '');
        setPhone(prospectToEdit.phone || '');
        setEmail(prospectToEdit.email || '');
        setInterestedPackage(prospectToEdit.interestedPackage || '');
        setStatus(prospectToEdit.status || 'Nuevo');
        setPriority(prospectToEdit.priority || 'Media');
        setNotes(prospectToEdit.notes || '');
        setAttachedFiles(prospectToEdit.files || []);
        setFileUrlInput('');
      } else {
        // Fresh reset for new prospect: all fields start completely blank
        setName('');
        setEventType('Boda');
        setEstimatedDate('');
        setPhone('');
        setEmail('');
        setInterestedPackage('');
        setStatus('Nuevo');
        setPriority('Media');
        setNotes('');
        setAttachedFiles([]);
        setFileUrlInput('');
      }
    }
  }, [isOpen, prospectToEdit]);

  if (!isOpen) return null;

  // Duplicate checks
  const cleanName = name.trim().toLowerCase();
  const duplicateProspect = cleanName.length > 2
    ? existingProspects.find((p) => p.id !== prospectToEdit?.id && p.name.trim().toLowerCase() === cleanName)
    : null;
  const duplicateClient = cleanName.length > 2
    ? existingClients.find((c) => c.name.trim().toLowerCase() === cleanName)
    : null;

  const handleAddFileLink = () => {
    if (!fileUrlInput.trim()) return;
    const newFile: FileAttachment = {
      id: `pro-fil-${Date.now()}`,
      name: fileUrlInput.includes('http') ? 'Enlace / Cotización Drive' : fileUrlInput.trim(),
      url: fileUrlInput.includes('http') ? fileUrlInput.trim() : undefined,
      uploadedAt: new Date().toISOString(),
      relatedType: 'prospect',
      size: 'Enlace web'
    };
    setAttachedFiles((prev) => [...prev, newFile]);
    setFileUrlInput('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const newFile: FileAttachment = {
          id: `pro-fil-${Date.now()}`,
          name: file.name,
          dataUrl: typeof reader.result === 'string' ? reader.result : undefined,
          size: file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${(file.size / 1024).toFixed(0)} KB`,
          mimeType: file.type,
          uploadedAt: new Date().toISOString(),
          relatedType: 'prospect',
          isFromCamera: false
        };
        setAttachedFiles((prev) => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prospect: Prospect = {
      id: prospectToEdit?.id || `pro-${Date.now()}`,
      name: name.trim(),
      eventType,
      estimatedDate: estimatedDate || undefined,
      phone: phone.trim(),
      email: email.trim(),
      budget: prospectToEdit?.budget,
      interestedPackage: interestedPackage.trim() || 'Por definir',
      status,
      priority,
      notes: notes.trim(),
      files: attachedFiles,
      createdAt: prospectToEdit?.createdAt || new Date().toISOString()
    };
    onSave(prospect);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#E8E2D8] max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E2D8] bg-[#FBF9F5]">
          <h2 className="font-serif font-bold text-xl text-[#181715]">
            {prospectToEdit ? 'Editar Prospecto' : 'Nuevo Prospecto'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[#E8E2D8] text-[#78716C]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#57534E] mb-1">
              Nombre del Prospecto o Pareja *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Valeria López o Mariana & Rodrigo"
              className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none transition ${
                duplicateProspect ? 'border-amber-400 bg-amber-50/20' : 'border-[#E8E2D8] focus:border-[#C85A32]'
              }`}
            />
            {duplicateProspect && (
              <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  Ya tienes registrado un prospecto con este nombre: <strong>{duplicateProspect.name}</strong> ({duplicateProspect.status}).
                </span>
              </div>
            )}
            {duplicateClient && (
              <div className="mt-1.5 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>
                  Este contacto ya es un <strong>Cliente con contrato</strong> ({duplicateClient.name}).
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">Tipo de Evento *</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                className="w-full px-3 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
              >
                <option value="Boda">Boda</option>
                <option value="XV Años">XV Años</option>
                <option value="Graduación">Graduación</option>
                <option value="Social">Social</option>
                <option value="Empresarial">Empresarial</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">Fecha Tentativa</label>
              <input
                type="date"
                value={estimatedDate}
                onChange={(e) => setEstimatedDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">Teléfono / WhatsApp *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej. 999 123 4567"
                className="w-full px-3 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full px-3 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">Estado de Seguimiento *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProspectStatus)}
                className="w-full px-3 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
              >
                <option value="Nuevo">Nuevo</option>
                <option value="Contactado">Contactado</option>
                <option value="Cotizado">Cotizado</option>
                <option value="Ganado">Ganado</option>
                <option value="Perdido">Perdido</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">Prioridad *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
              >
                <option value="Alta">Alta 🔥</option>
                <option value="Media">Media ⚡</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#57534E] mb-1">Paquete de Interés</label>
            <input
              type="text"
              value={interestedPackage}
              onChange={(e) => setInterestedPackage(e.target.value)}
              placeholder="Ej. Paquete Quinceañera Deluxe (Video + Cenote)"
              className="w-full px-3.5 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#57534E] mb-1">Notas de la conversación</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Preguntas sobre locaciones, preferencias de audio o música..."
              className="w-full px-3.5 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
            />
          </div>

          {/* ÁREA DE ADJUNTAR ARCHIVOS / COTIZACIONES EN PROSPECTOS */}
          <div className="space-y-2 pt-2 border-t border-[#E8E2D8]">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#57534E] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>Adjuntar Cotización o Archivos (PDF, JPEG, TXT)</span>
              </label>

              <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF0EB] text-[#C85A32] hover:bg-[#F4DDD3] rounded-lg text-xs font-bold transition">
                <span>+ Subir Archivo</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,text/plain,application/pdf,image/*"
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="O pega link de Google Drive (cotización, carpeta)..."
                value={fileUrlInput}
                onChange={(e) => setFileUrlInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-[#E8E2D8] rounded-xl text-xs focus:outline-none focus:border-[#C85A32]"
              />
              <button
                type="button"
                onClick={handleAddFileLink}
                className="px-3 py-2 bg-[#C85A32] hover:bg-[#B24B25] text-white rounded-xl text-xs font-bold transition shrink-0"
              >
                Adjuntar Enlace
              </button>
            </div>

            {attachedFiles.length > 0 && (
              <div className="space-y-1.5 mt-2">
                {attachedFiles.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-2 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[#C85A32]">📎</span>
                      <span className="font-medium text-[#181715] truncate">{f.name}</span>
                      <span className="text-[10px] text-[#A8A29E]">({f.size || 'Archivo'})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(f.id)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                      title="Eliminar archivo adjunto"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#E8E2D8] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#57534E] hover:bg-[#E8E2D8]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#C85A32] hover:bg-[#B24B25] text-white shadow"
            >
              {prospectToEdit ? 'Guardar Cambios' : 'Registrar Prospecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// APPOINTMENT MODAL (CREATE / EDIT)
// -------------------------------------------------------------
interface AppointmentModalProps extends ModalProps {
  appointmentToEdit?: Appointment | null;
  clients: Client[];
  prospects: Prospect[];
  onSave: (appointment: Appointment) => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  appointmentToEdit,
  clients,
  prospects,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<AppointmentType>('Videollamada');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('18:00');
  const [status, setStatus] = useState<AppointmentStatus>('Confirmada');
  const [relatedType, setRelatedType] = useState<'client' | 'prospect'>('prospect');
  const [relatedId, setRelatedId] = useState('');
  const [locationOrLink, setLocationOrLink] = useState('https://meet.google.com/clk-vdeo-crm');
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [fileUrlInput, setFileUrlInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);

  const defaultTagPresets = [
    'Firma de Contrato',
    'Presentación de Paquetes',
    'Revisión de Notas',
    'Cotización',
    'Urgente',
    'Llamada WhatsApp',
    'Presencial en Estudio',
    'Seguimiento'
  ];

  useEffect(() => {
    if (isOpen) {
      if (appointmentToEdit) {
        setTitle(appointmentToEdit.title || '');
        setType(appointmentToEdit.type || 'Videollamada');
        setDate(appointmentToEdit.date || '');
        setTime(appointmentToEdit.time || '18:00');
        setStatus(appointmentToEdit.status || 'Confirmada');
        setRelatedType(appointmentToEdit.relatedTo?.type === 'client' ? 'client' : 'prospect');
        setRelatedId(appointmentToEdit.relatedTo?.id || (clients[0]?.id || ''));
        setLocationOrLink(appointmentToEdit.locationOrLink || 'https://meet.google.com/clk-vdeo-crm');
        setNotes(appointmentToEdit.notes || '');
        setSelectedTags(appointmentToEdit.tags || []);
        setAttachedFiles(appointmentToEdit.files || []);
      } else {
        setTitle('');
        setType('Videollamada');
        setDate(new Date().toISOString().split('T')[0]);
        setTime('18:00');
        setStatus('Confirmada');
        const defaultType = prospects.length > 0 ? 'prospect' : 'client';
        setRelatedType(defaultType);
        setRelatedId(defaultType === 'prospect' ? (prospects[0]?.id || '') : (clients[0]?.id || ''));
        setLocationOrLink('https://meet.google.com/clk-vdeo-crm');
        setNotes('');
        setSelectedTags(['Presentación de Paquetes']);
        setAttachedFiles([]);
      }
      setFileUrlInput('');
      setCustomTagInput('');
    }
  }, [isOpen, appointmentToEdit, clients, prospects]);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const clean = customTagInput.trim();
    if (clean && !selectedTags.includes(clean)) {
      setSelectedTags((prev) => [...prev, clean]);
      setCustomTagInput('');
    }
  };

  const handleAddFileLink = () => {
    const trimmed = fileUrlInput.trim();
    if (!trimmed) return;
    const newFile: FileAttachment = {
      id: `file-${Date.now()}`,
      name: trimmed.includes('drive.google.com') ? 'Documento / Carpeta Google Drive' : trimmed.split('/').pop() || 'Archivo adjunto',
      url: trimmed,
      uploadedAt: new Date().toISOString(),
      relatedType: 'general'
    };
    setAttachedFiles((prev) => [...prev, newFile]);
    setFileUrlInput('');
  };

  const handleRemoveFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let relatedName = '';
    let phone = '';

    if (relatedType === 'client') {
      const c = clients.find((x) => x.id === relatedId);
      relatedName = c?.name || 'Cliente';
      phone = c?.phone || '';
    } else {
      const p = prospects.find((x) => x.id === relatedId);
      relatedName = p?.name || 'Prospecto';
      phone = p?.phone || '';
    }

    const savedAppointment: Appointment = {
      id: appointmentToEdit?.id || `app-${Date.now()}`,
      title: title.trim(),
      type,
      date,
      time,
      relatedTo: {
        type: relatedType,
        id: relatedId,
        name: relatedName,
        phone
      },
      locationOrLink: locationOrLink.trim(),
      status,
      notes: notes.trim(),
      tags: selectedTags,
      files: attachedFiles,
      callHistory: appointmentToEdit?.callHistory || []
    };

    onSave(savedAppointment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#E8E2D8] max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E2D8] bg-[#FBF9F5]">
          <h2 className="font-serif font-bold text-xl text-[#181715]">
            {appointmentToEdit ? 'Editar Cita' : 'Agendar Nueva Cita'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[#E8E2D8] text-[#78716C]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#57534E] mb-1">Motivo de la Cita *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Presentación de Paquetes / Firma de Contrato"
              className="w-full px-3.5 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">Modalidad *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AppointmentType)}
                className="w-full px-3 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
              >
                <option value="Videollamada">Videollamada (Meet)</option>
                <option value="Presencial">Presencial (Estudio)</option>
                <option value="Llamada telefónica">Llamada telefónica</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">Estado *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                className="w-full px-3 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
              >
                <option value="Confirmada">Confirmada</option>
                <option value="Programada">Programada</option>
                <option value="Realizada">Realizada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">Fecha *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">Hora *</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">Tipo de Contacto *</label>
              <select
                value={relatedType}
                onChange={(e) => {
                  const nt = e.target.value as any;
                  setRelatedType(nt);
                  if (nt === 'client' && clients[0]) setRelatedId(clients[0].id);
                  if (nt === 'prospect' && prospects[0]) setRelatedId(prospects[0].id);
                }}
                className="w-full px-3 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
              >
                <option value="prospect">Prospecto</option>
                <option value="client">Cliente</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">
                Seleccionar {relatedType === 'client' ? 'Cliente' : 'Prospecto'} *
              </label>
              <select
                value={relatedId}
                onChange={(e) => setRelatedId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
              >
                {relatedType === 'client'
                  ? clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.eventType})
                      </option>
                    ))
                  : prospects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.eventType})
                      </option>
                    ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#57534E] mb-1">Lugar o Enlace de Reunión *</label>
            <input
              type="text"
              required
              value={locationOrLink}
              onChange={(e) => setLocationOrLink(e.target.value)}
              placeholder="https://meet.google.com/... o Dirección de estudio"
              className="w-full px-3.5 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
            />
          </div>

          {/* ETIQUETAS DE LA CITA */}
          <div className="space-y-2 pt-1 border-t border-[#E8E2D8]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#57534E]">
              <Tag className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>Etiquetas de la Cita</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {defaultTagPresets.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#C85A32] text-white shadow-xs font-bold'
                        : 'bg-[#F4EFEA] text-[#57534E] hover:bg-[#E8E2D8]'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Nueva etiqueta personalizada..."
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={handleAddCustomTag}
                className="flex-1 px-3 py-1.5 bg-white border border-[#E8E2D8] rounded-lg text-xs focus:outline-none focus:border-[#C85A32]"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="px-3 py-1.5 bg-[#FAF0EB] text-[#C85A32] hover:bg-[#F4DDD3] font-bold rounded-lg text-xs transition"
              >
                Agregar
              </button>
            </div>
          </div>

          {/* ADJUNTAR NOTAS */}
          <div>
            <label className="block text-xs font-bold text-[#57534E] mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#78716C]" />
              <span>Notas de la Cita / Acuerdos</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Puntos a tratar, paquete a cotizar, dudas técnicas de los festejados..."
              className="w-full px-3.5 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
            />
          </div>

          {/* ADJUNTAR ARCHIVOS O ENLACES DE DRIVE */}
          <div className="space-y-2 pt-1 border-t border-[#E8E2D8]">
            <label className="block text-xs font-bold text-[#57534E] mb-1 flex items-center gap-1.5">
              <span>📎</span>
              <span>Adjuntar Archivo o Enlace de Google Drive</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Pega link de Google Drive (carpeta, PDF cotización) o nombre..."
                value={fileUrlInput}
                onChange={(e) => setFileUrlInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-[#E8E2D8] rounded-xl text-xs focus:outline-none focus:border-[#C85A32]"
              />
              <button
                type="button"
                onClick={handleAddFileLink}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shrink-0"
              >
                Adjuntar
              </button>
            </div>

            {attachedFiles.length > 0 && (
              <div className="space-y-1.5 mt-2">
                {attachedFiles.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-2 bg-[#FBF9F5] border border-[#E8E2D8] rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>📄</span>
                      <span className="font-medium text-[#181715] truncate">{f.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(f.id)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#E8E2D8] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#57534E] hover:bg-[#E8E2D8]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#C85A32] hover:bg-[#B24B25] text-white shadow"
            >
              {appointmentToEdit ? 'Guardar Cambios' : 'Agendar Cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// SESSION MODAL
// -------------------------------------------------------------
interface SessionModalProps extends ModalProps {
  sessionToEdit?: Session | null;
  clients: Client[];
  onSave: (session: Session) => void;
}

export const SessionModal: React.FC<SessionModalProps> = ({
  isOpen,
  onClose,
  sessionToEdit,
  clients,
  onSave
}) => {
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [type, setType] = useState<SessionType>('Casual Pre-Boda');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [photographer, setPhotographer] = useState('Roberto Canché');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (sessionToEdit) {
        setClientId(sessionToEdit.clientId || (clients[0]?.id || ''));
        setType(sessionToEdit.type || 'Casual Pre-Boda');
        setDate(sessionToEdit.date || '');
        setTime(sessionToEdit.time || '');
        setLocation(sessionToEdit.location || '');
        setPhotographer(sessionToEdit.photographer || 'Roberto Canché');
        setNotes(sessionToEdit.notes || '');
      } else {
        setClientId(clients[0]?.id || '');
        setType('Casual Pre-Boda');
        setDate('');
        setTime('');
        setLocation('');
        setPhotographer('Roberto Canché');
        setNotes('');
      }
    }
  }, [isOpen, sessionToEdit, clients]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = clients.find((x) => x.id === clientId);
    const savedSession: Session = {
      id: sessionToEdit?.id || `ses-${Date.now()}`,
      clientId,
      clientName: c?.name || sessionToEdit?.clientName || 'Cliente',
      type,
      date,
      time,
      location: location.trim(),
      photographer: photographer.trim(),
      status: sessionToEdit?.status || 'Confirmada',
      notes: notes.trim()
    };
    onSave(savedSession);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#E8E2D8] max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E2D8] bg-[#FBF9F5]">
          <h2 className="font-serif font-bold text-xl text-[#181715]">
            {sessionToEdit ? 'Editar Sesión de Foto / Video' : 'Agendar Sesión de Foto / Video'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[#E8E2D8] text-[#78716C]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#57534E] mb-1">Cliente Vinculado *</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.eventType} - {c.eventDate})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#57534E] mb-1">Tipo de Sesión *</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as SessionType)}
              className="w-full px-3 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
            >
              <option value="Casual Pre-Boda">Casual Pre-Boda</option>
              <option value="Vestido XV Años">Vestido XV Años</option>
              <option value="Save the Date">Save the Date</option>
              <option value="Trash the Dress">Trash the Dress</option>
              <option value="Playa / Cenote">Playa / Cenote (Sisal, Progreso, Noh Mozon)</option>
              <option value="Estudio">Estudio Click Videorecords</option>
              <option value="Scouting de Locación">Scouting de Locación</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">Fecha de la Sesión *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">Hora de Citación *</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#57534E] mb-1">Locación de la Sesión *</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej. Hacienda Dzibikak, Cenote San Ignacio, Playa Sisal"
              className="w-full px-3.5 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#57534E] mb-1">Fotógrafo / Videógrafo Responsable</label>
            <input
              type="text"
              value={photographer}
              onChange={(e) => setPhotographer(e.target.value)}
              placeholder="Roberto Canché, Mariana Sosa..."
              className="w-full px-3.5 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#57534E] mb-1">Notas y Equipo Especial</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Llevar reflectores, dron, permisos pagados de hacienda..."
              className="w-full px-3.5 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
            />
          </div>

          <div className="pt-4 border-t border-[#E8E2D8] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#57534E] hover:bg-[#E8E2D8]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#C85A32] hover:bg-[#B24B25] text-white shadow"
            >
              {sessionToEdit ? 'Guardar Cambios' : 'Programar Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
