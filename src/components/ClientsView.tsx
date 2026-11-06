import React, { useState } from 'react';
import { 
  Plus, Search, Filter, Phone, Mail, Calendar, MapPin, 
  DollarSign, Camera, FileText, Edit2, Trash2, Video, 
  MessageSquare, FileSpreadsheet, CheckCircle, Sparkles 
} from 'lucide-react';
import { Client, Session, FileAttachment } from '../types';
import { openWhatsApp, generateWhatsAppMessage } from '../utils/whatsapp';

interface ClientsViewProps {
  clients: Client[];
  sessions: Session[];
  files: FileAttachment[];
  onOpenNewClient: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onDeleteAllClients?: () => void;
  onSelectClient: (client: Client) => void;
  onOpenAddSession: (clientId: string) => void;
  onOpenCamera: (clientId: string) => void;
  onOpenBackupModal: () => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  sessions,
  files,
  onOpenNewClient,
  onEditClient,
  onDeleteClient,
  onDeleteAllClients,
  onSelectClient,
  onOpenAddSession,
  onOpenCamera,
  onOpenBackupModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all'); // all, with_balance, paid
  const [sortOrder, setSortOrder] = useState<'date_asc' | 'date_desc'>('date_asc');

  // Filter and sort clients strictly by eventDate
  const filteredClients = clients
    .filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.packageContracted.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm);

      const matchesType = selectedType === 'all' || c.eventType === selectedType;

      const matchesStatus =
        selectedStatus === 'all'
          ? true
          : selectedStatus === 'with_balance'
          ? c.balanceDue > 0
          : c.balanceDue === 0;

      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      return sortOrder === 'date_asc'
        ? a.eventDate.localeCompare(b.eventDate)
        : b.eventDate.localeCompare(a.eventDate);
    });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-bold text-2xl text-[#181715]">Cartera de Clientes</h1>
            <span className="text-xs bg-[#FAF0EB] text-[#C85A32] font-bold px-2.5 py-1 rounded-full">
              {clients.length} {clients.length === 1 ? 'evento' : 'eventos'}
            </span>
          </div>
          <p className="text-xs text-[#78716C] mt-0.5">
            Control de contratos, saldos pendientes y producción de bodas y XV años en Yucatán
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onDeleteAllClients && clients.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('¿Estás seguro de que deseas eliminar TODOS los clientes de la cartera? Esta acción no se puede deshacer.')) {
                  onDeleteAllClients();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition border border-rose-200"
              title="Borrar todos los clientes de la cartera"
            >
              <Trash2 className="w-4 h-4" />
              Borrar Todos
            </button>
          )}
          <button
            onClick={onOpenBackupModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#F4EFEA] hover:bg-[#E8E2D8] text-[#181715] rounded-xl text-xs font-bold transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Exportar / Importar
          </button>
          <button
            onClick={onOpenNewClient}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#C85A32] hover:bg-[#B24B25] text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, hacienda o paquete..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3.5 py-2.5 bg-white border border-[#E8E2D8] rounded-xl text-xs font-bold text-[#57534E] focus:outline-none focus:border-[#C85A32]"
          >
            <option value="all">Todos los Eventos</option>
            <option value="Boda">Bodas</option>
            <option value="XV Años">XV Años</option>
            <option value="Graduación">Graduaciones</option>
            <option value="Social">Social</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3.5 py-2.5 bg-white border border-[#E8E2D8] rounded-xl text-xs font-bold text-[#57534E] focus:outline-none focus:border-[#C85A32]"
          >
            <option value="all">Todos los Estados</option>
            <option value="with_balance">Con Saldo Pendiente</option>
            <option value="paid">Liquidados al 100%</option>
          </select>
        </div>
      </div>

      {/* Clients Cards Grid */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[#E8E2D8] p-12 text-center space-y-3">
          <p className="font-serif text-lg text-[#181715] font-bold">No se encontraron clientes</p>
          <p className="text-xs text-[#78716C] max-w-sm mx-auto">
            Prueba ajustando los filtros de búsqueda o agrega un nuevo cliente a la cartera.
          </p>
          <button
            onClick={onOpenNewClient}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C85A32] text-white rounded-xl text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            Crear Cliente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const clientSessions = sessions.filter((s) => s.clientId === client.id);
            const clientFiles = files.filter((f) => f.relatedType === 'client' && f.relatedId === client.id);

            return (
              <div
                key={client.id}
                className="bg-white rounded-2xl border border-[#E8E2D8] hover:border-[#C85A32] p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Badge Row */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      client.eventType === 'Boda' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {client.eventType}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {client.isVip && (
                        <span className="text-[10px] px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded font-bold">
                          VIP
                        </span>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        client.balanceDue > 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {client.balanceDue > 0 ? 'Saldo pendiente' : 'Liquidado'}
                      </span>
                    </div>
                  </div>

                  {/* Client Title & Partner */}
                  <div>
                    <h3
                      onClick={() => onSelectClient(client)}
                      className="font-serif font-bold text-lg text-[#181715] leading-snug cursor-pointer hover:text-[#C85A32] transition"
                    >
                      {client.name}
                    </h3>
                    {client.partnerName && (
                      <p className="text-xs text-[#78716C] italic mt-0.5">
                        Celebrado(s): <span className="text-[#181715] font-medium">{client.partnerName}</span>
                      </p>
                    )}
                  </div>

                  {/* Date, Location & Church */}
                  <div className="mt-2 space-y-1 text-xs text-[#57534E]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span className="font-semibold">{client.eventDate}</span>
                      {client.eventTime && <span className="text-[#78716C]">({client.eventTime} hrs)</span>}
                    </div>
                    {client.location && (
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C85A32] shrink-0 mt-0.5" />
                        <span className="truncate">{client.location}</span>
                      </div>
                    )}
                    {client.church && (
                      <div className="flex items-start gap-1.5 text-stone-600">
                        <span className="text-xs shrink-0 mt-0.5">⛪</span>
                        <span className="truncate">Iglesia: {client.church}</span>
                      </div>
                    )}
                    {client.sessionLocation && (
                      <div className="flex items-start gap-1.5 text-stone-600">
                        <span className="text-xs shrink-0 mt-0.5">📷</span>
                        <span className="truncate">Sesión: {client.sessionLocation}</span>
                      </div>
                    )}
                  </div>

                  {/* Package & Financial Info */}
                  <div className="my-3 p-3 bg-[#FAF0EB]/60 rounded-xl text-xs space-y-1.5 border border-[#F0DDD4]">
                    <p className="font-bold text-[#8F3717] truncate">{client.packageContracted}</p>
                    <div className="flex justify-between items-center text-[11px] pt-1 border-t border-[#E8E2D8]">
                      <span className="text-[#78716C]">Total: ${client.totalPrice.toLocaleString('es-MX')}</span>
                      <span className={`font-mono font-bold ${client.balanceDue > 0 ? 'text-[#C85A32]' : 'text-emerald-700'}`}>
                        Saldo: ${client.balanceDue.toLocaleString('es-MX')}
                      </span>
                    </div>
                  </div>

                  {/* Sessions and Files summary pills */}
                  <div className="flex items-center gap-2 text-[11px] text-[#78716C] mb-3">
                    <span className="inline-flex items-center gap-1 bg-[#FBF9F5] px-2 py-0.5 rounded-lg border border-[#E8E2D8]">
                      <Video className="w-3 h-3 text-indigo-600" />
                      {clientSessions.length} {clientSessions.length === 1 ? 'sesión' : 'sesiones'}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-[#FBF9F5] px-2 py-0.5 rounded-lg border border-[#E8E2D8]">
                      <FileText className="w-3 h-3 text-[#C85A32]" />
                      {clientFiles.length} {clientFiles.length === 1 ? 'archivo' : 'archivos'}
                    </span>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-[#E8E2D8] flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <a
                      href={`tel:${client.phone}`}
                      className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                      title={`Llamar a ${client.name} (${client.phone})`}
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => {
                        const msg = generateWhatsAppMessage('greeting', { clientName: client.name });
                        openWhatsApp(client.phone, msg);
                      }}
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                      title="Abrir WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenCamera(client.id)}
                      className="p-2 rounded-xl bg-[#FAF0EB] text-[#C85A32] hover:bg-[#F0DDD4] transition"
                      title="Tomar foto / adjuntar comprobante"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenAddSession(client.id)}
                      className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
                      title="Agendar sesión fotográfica"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onSelectClient(client)}
                      className="px-2.5 py-1.5 rounded-xl bg-[#F4EFEA] hover:bg-[#E8E2D8] text-[#181715] text-xs font-bold transition"
                    >
                      Expediente
                    </button>
                    <button
                      onClick={() => onEditClient(client)}
                      className="p-1.5 rounded-lg hover:bg-[#E8E2D8] text-[#78716C] transition"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar al cliente ${client.name}?`)) {
                          onDeleteClient(client.id);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 transition"
                      title="Eliminar"
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
