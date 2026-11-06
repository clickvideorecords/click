import React, { useState } from 'react';
import { 
  Plus, FileText, Camera, Upload, ExternalLink, 
  Trash2, Folder, Calendar, User, Tag, Sparkles,
  Edit3, Share2, Download, Copy, Check, Eye, X,
  Phone, Send, Search, CheckCircle2, Image as ImageIcon,
  FileCode
} from 'lucide-react';
import { NoteItem, FileAttachment, Client, Prospect } from '../types';
import { GOOGLE_DRIVE_FOLDER_URL, GOOGLE_DRIVE_FOLDER_ID } from '../services/googleDrive';
import { DocumentViewerModal } from './DocumentViewerModal';

interface NotesViewProps {
  notes: NoteItem[];
  files: FileAttachment[];
  clients: Client[];
  prospects: Prospect[];
  onAddNote: (note: NoteItem) => void;
  onUpdateNote?: (note: NoteItem) => void;
  onDeleteNote: (noteId: string) => void;
  onOpenCamera: () => void;
  onSaveFile: (file: FileAttachment) => void;
  onDeleteFile: (fileId: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  files,
  clients,
  prospects,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onOpenCamera,
  onSaveFile,
  onDeleteFile
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'files'>('notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [fileFilter, setFileFilter] = useState<'all' | 'pdf' | 'jpeg' | 'txt'>('all');

  // Add Note Form State
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'Notas' | 'Logística' | 'Contrato' | 'Requerimiento Técnico' | 'General'>('Notas');
  const [relatedType, setRelatedType] = useState<'client' | 'prospect' | 'general'>('client');
  const [relatedId, setRelatedId] = useState(clients[0]?.id || '');

  // Edit Note State
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState<'Notas' | 'Logística' | 'Contrato' | 'Requerimiento Técnico' | 'General'>('Notas');
  const [editRelatedType, setEditRelatedType] = useState<'client' | 'prospect' | 'general'>('client');
  const [editRelatedId, setEditRelatedId] = useState('');

  // Share Note State
  const [sharingNote, setSharingNote] = useState<NoteItem | null>(null);
  const [shareRecipientType, setShareRecipientType] = useState<'client' | 'prospect' | 'custom'>('client');
  const [shareRecipientId, setShareRecipientId] = useState<string>('');
  const [customRecipientName, setCustomRecipientName] = useState('');
  const [customRecipientPhone, setCustomRecipientPhone] = useState('');
  const [includeDriveLink, setIncludeDriveLink] = useState(true);
  const [copiedShareText, setCopiedShareText] = useState(false);

  // Universal Document Viewer Modal (PDF, JPEG, TXT)
  const [selectedViewerFile, setSelectedViewerFile] = useState<FileAttachment | null>(null);

  // Handlers for Creating Note
  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    let relatedName = '';
    if (relatedType === 'client') {
      relatedName = clients.find((c) => c.id === relatedId)?.name || '';
    } else if (relatedType === 'prospect') {
      relatedName = prospects.find((p) => p.id === relatedId)?.name || '';
    }

    const note: NoteItem = {
      id: `not-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      relatedType,
      relatedId: relatedType !== 'general' ? relatedId : undefined,
      relatedName: relatedName || undefined,
      createdAt: new Date().toISOString()
    };

    onAddNote(note);
    setNewTitle('');
    setNewContent('');
    setIsAddingNote(false);
  };

  // Handlers for Editing Note
  const handleStartEditNote = (note: NoteItem) => {
    setEditingNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    const validCategory = (note.category === ('Guion de Video' as any) ? 'Notas' : note.category) as any;
    setEditCategory(validCategory || 'Notas');
    setEditRelatedType(note.relatedType || 'general');
    setEditRelatedId(note.relatedId || (note.relatedType === 'client' ? (clients[0]?.id || '') : (prospects[0]?.id || '')));
  };

  const handleSaveEditNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote || !onUpdateNote) return;

    let relatedName = '';
    if (editRelatedType === 'client') {
      relatedName = clients.find((c) => c.id === editRelatedId)?.name || '';
    } else if (editRelatedType === 'prospect') {
      relatedName = prospects.find((p) => p.id === editRelatedId)?.name || '';
    }

    const updatedNote: NoteItem = {
      ...editingNote,
      title: editTitle.trim(),
      content: editContent.trim(),
      category: editCategory,
      relatedType: editRelatedType,
      relatedId: editRelatedType !== 'general' ? editRelatedId : undefined,
      relatedName: relatedName || undefined,
    };

    onUpdateNote(updatedNote);
    setEditingNote(null);
  };

  // Handlers for Sharing Note
  const handleOpenShareModal = (note: NoteItem) => {
    setSharingNote(note);
    setCopiedShareText(false);

    if (note.relatedType === 'client' && note.relatedId) {
      setShareRecipientType('client');
      setShareRecipientId(note.relatedId);
    } else if (note.relatedType === 'prospect' && note.relatedId) {
      setShareRecipientType('prospect');
      setShareRecipientId(note.relatedId);
    } else if (clients.length > 0) {
      setShareRecipientType('client');
      setShareRecipientId(clients[0].id);
    } else if (prospects.length > 0) {
      setShareRecipientType('prospect');
      setShareRecipientId(prospects[0].id);
    } else {
      setShareRecipientType('custom');
      setCustomRecipientName('');
      setCustomRecipientPhone('');
    }
  };

  const getRecipientInfo = () => {
    if (shareRecipientType === 'client') {
      const client = clients.find((c) => c.id === shareRecipientId);
      return {
        name: client?.name || 'Cliente',
        phone: client?.phone || ''
      };
    }
    if (shareRecipientType === 'prospect') {
      const prospect = prospects.find((p) => p.id === shareRecipientId);
      return {
        name: prospect?.name || 'Prospecto',
        phone: prospect?.phone || ''
      };
    }
    return {
      name: customRecipientName.trim() || 'Estimado(a)',
      phone: customRecipientPhone.trim()
    };
  };

  const generateShareText = () => {
    if (!sharingNote) return '';
    const recipient = getRecipientInfo();

    let text = `*Click Videorecords | Notas de tu Evento* 🎬✨\n`;
    text += `Hola *${recipient.name}*, te compartimos las notas y detalles de tu evento:\n\n`;
    text += `📌 *${sharingNote.title}*\n`;
    text += `🏷️ Categoría: *${sharingNote.category}*\n\n`;
    text += `${sharingNote.content}\n\n`;

    if (includeDriveLink) {
      text += `📁 *Expediente y Archivos en Google Drive:*\n${GOOGLE_DRIVE_FOLDER_URL}\n\n`;
    }

    text += `📍 *Click Videorecords* | Bodas & XV Años en Mérida, Yucatán\n📞 Contacto directo: 999 575 8892`;
    return text;
  };

  const handleShareWhatsApp = () => {
    const recipient = getRecipientInfo();
    const cleanPhone = recipient.phone.replace(/\D/g, '');
    const message = generateShareText();
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone.length === 10 ? '52' + cleanPhone : cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyShareText = () => {
    const text = generateShareText();
    navigator.clipboard.writeText(text);
    setCopiedShareText(true);
    setTimeout(() => setCopiedShareText(false), 3000);
  };

  const handleDownloadNoteAsTxt = (note: NoteItem) => {
    const element = document.createElement('a');
    const noteText = `CLICK VIDEORECORDS - NOTAS DE EVENTO\n` +
      `Título: ${note.title}\n` +
      `Categoría: ${note.category}\n` +
      `Vinculado a: ${note.relatedName || 'General'}\n` +
      `Fecha: ${note.createdAt ? new Date(note.createdAt).toLocaleString('es-MX') : 'Reciente'}\n` +
      `----------------------------------------\n\n` +
      `${note.content}\n\n` +
      `----------------------------------------\n` +
      `Click Videorecords | Mérida, Yucatán\nGoogle Drive Folder ID: ${GOOGLE_DRIVE_FOLDER_ID}\n`;

    const file = new Blob([noteText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    const sanitizedTitle = note.title.replace(/[^a-z0-9áéíóúñ_ -]/gi, '_');
    element.download = `${sanitizedTitle}_notas.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Open note in the universal TXT viewer!
  const handlePreviewNoteInTxtViewer = (note: NoteItem) => {
    const noteText = `CLICK VIDEORECORDS - NOTA DE EVENTO
==================================================
Título: ${note.title}
Categoría: ${note.category}
Vinculado a: ${note.relatedName || 'General'}
Fecha: ${note.createdAt ? new Date(note.createdAt).toLocaleString('es-MX') : 'Reciente'}
==================================================

${note.content}

--------------------------------------------------
Click Videorecords | Mérida, Yucatán
Google Drive Folder ID: ${GOOGLE_DRIVE_FOLDER_ID}`;

    const syntheticFile: FileAttachment = {
      id: `view-note-${note.id}`,
      name: `${note.title}.txt`,
      textContent: noteText,
      dataUrl: `data:text/plain;charset=utf-8,${encodeURIComponent(noteText)}`,
      size: `${(noteText.length / 1024).toFixed(1)} KB`,
      mimeType: 'text/plain',
      uploadedAt: note.createdAt,
      relatedType: note.relatedType,
      relatedId: note.relatedId
    };

    setSelectedViewerFile(syntheticFile);
  };

  // Upload handler supporting PDF, JPEG/images, and TXT
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const isText = file.type.includes('text') || file.name.toLowerCase().endsWith('.txt');
      const isPdf = file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf');
      const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);

      if (isText) {
        const textReader = new FileReader();
        textReader.onload = () => {
          const textContent = typeof textReader.result === 'string' ? textReader.result : '';
          const newFile: FileAttachment = {
            id: `fil-up-${Date.now()}`,
            name: file.name,
            textContent,
            dataUrl: `data:text/plain;charset=utf-8,${encodeURIComponent(textContent)}`,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            mimeType: 'text/plain',
            uploadedAt: new Date().toISOString(),
            relatedType: 'general',
            isFromCamera: false
          };
          onSaveFile(newFile);
          setSelectedViewerFile(newFile);
        };
        textReader.readAsText(file);
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = typeof reader.result === 'string' ? reader.result : undefined;
          const newFile: FileAttachment = {
            id: `fil-up-${Date.now()}`,
            name: file.name,
            dataUrl,
            size: file.size > 1024 * 1024 
              ? `${(file.size / 1024 / 1024).toFixed(1)} MB` 
              : `${(file.size / 1024).toFixed(0)} KB`,
            mimeType: file.type || (isPdf ? 'application/pdf' : isImage ? 'image/jpeg' : 'application/octet-stream'),
            uploadedAt: new Date().toISOString(),
            relatedType: 'general',
            isFromCamera: false
          };
          onSaveFile(newFile);
          setSelectedViewerFile(newFile);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.relatedName && note.relatedName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = 
      categoryFilter === 'all' || 
      note.category === categoryFilter ||
      (categoryFilter === 'Notas' && (note.category === 'Notas' || (note.category as any) === 'Guion de Video'));

    return matchesSearch && matchesCategory;
  });

  // Filter files by type (PDF, JPEG, TXT)
  const filteredFiles = files.filter((file) => {
    const nameLower = file.name.toLowerCase();
    const isPdf = file.mimeType?.includes('pdf') || nameLower.endsWith('.pdf');
    const isImage = file.mimeType?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(nameLower) || file.isFromCamera;
    const isTxt = file.mimeType?.includes('text') || nameLower.endsWith('.txt') || Boolean(file.textContent);

    if (fileFilter === 'pdf') return isPdf;
    if (fileFilter === 'jpeg') return isImage;
    if (fileFilter === 'txt') return isTxt;
    return true;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-bold text-2xl text-[#181715]">Notas &amp; Expediente Drive</h1>
            <span className="text-xs bg-[#FAF0EB] text-[#C85A32] font-bold px-2.5 py-1 rounded-full">
              Visor PDF • JPEG • TXT
            </span>
          </div>
          <p className="text-xs text-[#78716C] mt-0.5">
            Visor integrado de contratos PDF, fotos JPEG y archivos TXT con descarga directa y sincronización Drive
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={GOOGLE_DRIVE_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#F4EFEA] hover:bg-[#E8E2D8] text-[#181715] rounded-xl text-xs font-bold transition"
            title="Abrir carpeta compartida en Google Drive para descargar archivos"
          >
            <Folder className="w-4 h-4 text-emerald-600" />
            Abrir en Drive
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onOpenCamera}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-[#E8E2D8] hover:bg-[#FAF0EB] text-[#181715] rounded-xl text-xs font-bold transition"
          >
            <Camera className="w-4 h-4 text-[#C85A32]" />
            Foto con Cámara
          </button>
          <button
            onClick={() => setIsAddingNote(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#C85A32] hover:bg-[#B24B25] text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Nueva Nota
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E8E2D8] gap-4">
        <button
          onClick={() => setActiveTab('notes')}
          className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'notes'
              ? 'border-[#C85A32] text-[#C85A32]'
              : 'border-transparent text-[#78716C] hover:text-[#181715]'
          }`}
        >
          <FileText className="w-4 h-4" />
          Notas ({notes.length})
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'files'
              ? 'border-[#C85A32] text-[#C85A32]'
              : 'border-transparent text-[#78716C] hover:text-[#181715]'
          }`}
        >
          <Folder className="w-4 h-4" />
          Documentos &amp; Fotos ({files.length})
          <span className="text-[10px] bg-neutral-100 text-[#78716C] px-1.5 py-0.5 rounded font-mono">
            PDF • JPG • TXT
          </span>
        </button>
      </div>

      {/* Form modal to ADD note */}
      {isAddingNote && (
        <div className="p-5 bg-white rounded-2xl border border-[#C85A32] shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-[#181715]">Nueva Nota</h3>
            <button
              onClick={() => setIsAddingNote(false)}
              className="text-xs text-[#78716C] hover:text-[#181715]"
            >
              Cerrar
            </button>
          </div>

          <form onSubmit={handleCreateNote} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#57534E] mb-1">Título de la nota *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej. Cronograma y Requerimientos Boda Sofía & Carlos"
                  className="w-full px-3.5 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#57534E] mb-1">Categoría</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
                >
                  <option value="Notas">Notas</option>
                  <option value="Logística">Logística</option>
                  <option value="Contrato">Contrato</option>
                  <option value="Requerimiento Técnico">Requerimiento Técnico</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#57534E] mb-1">Vincular con</label>
                <select
                  value={relatedType}
                  onChange={(e) => setRelatedType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
                >
                  <option value="client">Cliente</option>
                  <option value="prospect">Prospecto</option>
                  <option value="general">Expediente General</option>
                </select>
              </div>

              {relatedType !== 'general' && (
                <div>
                  <label className="block text-xs font-bold text-[#57534E] mb-1">
                    Seleccionar {relatedType === 'client' ? 'Cliente' : 'Prospecto'}
                  </label>
                  <select
                    value={relatedId}
                    onChange={(e) => setRelatedId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
                  >
                    {relatedType === 'client'
                      ? clients.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))
                      : prospects.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">Contenido / Detalles</label>
              <textarea
                rows={4}
                required
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Escribe el cronograma, notas de audio, canciones del vals, solicitudes especiales..."
                className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingNote(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#57534E] hover:bg-[#E8E2D8]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#C85A32] hover:bg-[#B24B25] text-white shadow-xs"
              >
                Guardar Nota
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal to EDIT note */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#E8E2D8] max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#C85A32]" />
                <h3 className="font-serif font-bold text-xl text-[#181715]">Editar Nota</h3>
              </div>
              <button
                onClick={() => setEditingNote(null)}
                className="p-1 text-[#78716C] hover:text-[#181715] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditNote} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#57534E] mb-1">Título de la nota *</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#57534E] mb-1">Categoría</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
                  >
                    <option value="Notas">Notas</option>
                    <option value="Logística">Logística</option>
                    <option value="Contrato">Contrato</option>
                    <option value="Requerimiento Técnico">Requerimiento Técnico</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#57534E] mb-1">Vincular con</label>
                  <select
                    value={editRelatedType}
                    onChange={(e) => {
                      const newType = e.target.value as any;
                      setEditRelatedType(newType);
                      if (newType === 'client') setEditRelatedId(clients[0]?.id || '');
                      if (newType === 'prospect') setEditRelatedId(prospects[0]?.id || '');
                    }}
                    className="w-full px-3 py-2.5 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
                  >
                    <option value="client">Cliente</option>
                    <option value="prospect">Prospecto</option>
                    <option value="general">Expediente General</option>
                  </select>
                </div>

                {editRelatedType !== 'general' && (
                  <div>
                    <label className="block text-xs font-bold text-[#57534E] mb-1">
                      Seleccionar {editRelatedType === 'client' ? 'Cliente' : 'Prospecto'}
                    </label>
                    <select
                      value={editRelatedId}
                      onChange={(e) => setEditRelatedId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
                    >
                      {editRelatedType === 'client'
                        ? clients.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))
                        : prospects.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#57534E] mb-1">Contenido / Detalles</label>
                <textarea
                  rows={6}
                  required
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32] leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E8E2D8]">
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#57534E] hover:bg-[#E8E2D8] transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#C85A32] hover:bg-[#B24B25] text-white shadow-xs transition"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal to SHARE Note */}
      {sharingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-[#E8E2D8] max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#C85A32]" />
                <h3 className="font-serif font-bold text-xl text-[#181715]">Compartir Nota</h3>
              </div>
              <button
                onClick={() => setSharingNote(null)}
                className="p-1 text-[#78716C] hover:text-[#181715] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#A8A29E]">Nota Seleccionada</span>
                <h4 className="font-serif font-bold text-base text-[#181715]">{sharingNote.title}</h4>
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF0EB] text-[#8F3717] mt-1">
                  {sharingNote.category}
                </span>
              </div>

              {/* Recipient Selection */}
              <div className="p-4 bg-[#FBF9F5] rounded-2xl border border-[#E8E2D8] space-y-3">
                <label className="block text-xs font-bold text-[#181715]">
                  ¿A quién deseas compartir esta nota?
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShareRecipientType('client');
                      if (clients.length > 0) setShareRecipientId(clients[0].id);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      shareRecipientType === 'client'
                        ? 'bg-[#C85A32] text-white border-[#C85A32]'
                        : 'bg-white text-[#57534E] border-[#E8E2D8] hover:bg-[#F4EFEA]'
                    }`}
                  >
                    Cliente ({clients.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShareRecipientType('prospect');
                      if (prospects.length > 0) setShareRecipientId(prospects[0].id);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      shareRecipientType === 'prospect'
                        ? 'bg-[#C85A32] text-white border-[#C85A32]'
                        : 'bg-white text-[#57534E] border-[#E8E2D8] hover:bg-[#F4EFEA]'
                    }`}
                  >
                    Prospecto ({prospects.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setShareRecipientType('custom')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      shareRecipientType === 'custom'
                        ? 'bg-[#C85A32] text-white border-[#C85A32]'
                        : 'bg-white text-[#57534E] border-[#E8E2D8] hover:bg-[#F4EFEA]'
                    }`}
                  >
                    Otro / Manual
                  </button>
                </div>

                {shareRecipientType === 'client' && (
                  <div>
                    <label className="block text-[11px] font-bold text-[#78716C] mb-1">Seleccionar Cliente</label>
                    <select
                      value={shareRecipientId}
                      onChange={(e) => setShareRecipientId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E8E2D8] rounded-xl text-xs font-medium focus:outline-none focus:border-[#C85A32]"
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.phone || 'Sin tel'}) - {c.eventType}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {shareRecipientType === 'prospect' && (
                  <div>
                    <label className="block text-[11px] font-bold text-[#78716C] mb-1">Seleccionar Prospecto</label>
                    <select
                      value={shareRecipientId}
                      onChange={(e) => setShareRecipientId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E8E2D8] rounded-xl text-xs font-medium focus:outline-none focus:border-[#C85A32]"
                    >
                      {prospects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.phone || 'Sin tel'}) - {p.eventType}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {shareRecipientType === 'custom' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-[#78716C] mb-1">Nombre</label>
                      <input
                        type="text"
                        value={customRecipientName}
                        onChange={(e) => setCustomRecipientName(e.target.value)}
                        placeholder="Ej. Sofía Peniche"
                        className="w-full px-3 py-1.5 bg-white border border-[#E8E2D8] rounded-xl text-xs focus:outline-none focus:border-[#C85A32]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#78716C] mb-1">WhatsApp (10 dígitos)</label>
                      <input
                        type="tel"
                        value={customRecipientPhone}
                        onChange={(e) => setCustomRecipientPhone(e.target.value)}
                        placeholder="Ej. 9991234567"
                        className="w-full px-3 py-1.5 bg-white border border-[#E8E2D8] rounded-xl text-xs focus:outline-none focus:border-[#C85A32]"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="includeDrive"
                    checked={includeDriveLink}
                    onChange={(e) => setIncludeDriveLink(e.target.checked)}
                    className="rounded border-[#E8E2D8] text-[#C85A32] focus:ring-[#C85A32]"
                  />
                  <label htmlFor="includeDrive" className="text-xs text-[#57534E] select-none cursor-pointer">
                    Adjuntar enlace a la carpeta de Google Drive en el mensaje
                  </label>
                </div>
              </div>

              {/* Message Preview */}
              <div>
                <label className="block text-xs font-bold text-[#57534E] mb-1">Vista previa del mensaje</label>
                <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xl text-xs text-[#33302B] font-mono whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
                  {generateShareText()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  Enviar por WhatsApp
                </button>

                <button
                  type="button"
                  onClick={handleCopyShareText}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-white border border-[#E8E2D8] hover:bg-[#FAF0EB] text-[#181715] rounded-xl text-xs font-bold transition"
                >
                  {copiedShareText ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">¡Copiado al portapapeles!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#C85A32]" />
                      Copiar Mensaje
                    </>
                  )}
                </button>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[#E8E2D8]">
                <button
                  type="button"
                  onClick={() => handleDownloadNoteAsTxt(sharingNote)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#78716C] hover:text-[#C85A32] font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar nota en formato .TXT
                </button>

                <button
                  type="button"
                  onClick={() => setSharingNote(null)}
                  className="px-4 py-2 text-xs font-bold text-[#78716C] hover:text-[#181715]"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Universal Document Viewer Modal (PDF, JPEG, TXT) */}
      <DocumentViewerModal
        file={selectedViewerFile}
        onClose={() => setSelectedViewerFile(null)}
        onDelete={onDeleteFile}
      />

      {/* Tab 1: Notes List */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          {/* Search & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between bg-white p-3 rounded-2xl border border-[#E8E2D8]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
              <input
                type="text"
                placeholder="Buscar en notas por título, detalle o cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xl text-xs focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['all', 'Notas', 'Contrato', 'Logística', 'Requerimiento Técnico', 'General'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    categoryFilter === cat
                      ? 'bg-[#C85A32] text-white'
                      : 'bg-[#FAF8F5] text-[#78716C] hover:bg-[#E8E2D8] hover:text-[#181715]'
                  }`}
                >
                  {cat === 'all' ? 'Todas' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Notes Grid */}
          {filteredNotes.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#E8E2D8]">
              <FileText className="w-12 h-12 mx-auto text-[#C85A32]/40 mb-3" />
              <h3 className="font-serif font-bold text-lg text-[#181715]">No se encontraron notas</h3>
              <p className="text-xs text-[#78716C] mt-1 max-w-md mx-auto">
                Crea una nueva nota para el evento, cronograma de filmación, logística o acuerdos con tus clientes.
              </p>
              <button
                onClick={() => setIsAddingNote(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#C85A32] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Crear Primera Nota
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white p-5 rounded-2xl border border-[#E8E2D8] hover:border-[#C85A32] shadow-xs hover:shadow-md transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF0EB] text-[#8F3717]">
                        {note.category === ('Guion de Video' as any) ? 'Notas' : note.category}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handlePreviewNoteInTxtViewer(note)}
                          className="p-1.5 text-[#78716C] hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Abrir en Visor TXT"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleStartEditNote(note)}
                          className="p-1.5 text-[#78716C] hover:text-[#C85A32] hover:bg-[#FAF0EB] rounded-lg transition"
                          title="Editar Nota"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenShareModal(note)}
                          className="p-1.5 text-[#78716C] hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="Compartir a Cliente o Prospecto"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar la nota "${note.title}"?`)) {
                              onDeleteNote(note.id);
                            }
                          }}
                          className="p-1.5 text-[#78716C] hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="Eliminar Nota"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-serif font-bold text-base text-[#181715] leading-snug">
                      {note.title}
                    </h3>

                    {note.relatedName && (
                      <p className="text-xs text-[#C85A32] font-semibold mt-1 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {note.relatedType === 'client' ? 'Cliente: ' : note.relatedType === 'prospect' ? 'Prospecto: ' : ''}
                        {note.relatedName}
                      </p>
                    )}

                    <p className="mt-2.5 text-xs text-[#57534E] whitespace-pre-wrap leading-relaxed line-clamp-6">
                      {note.content}
                    </p>
                  </div>

                  {/* Note Card Footer Actions */}
                  <div className="mt-4 pt-3 border-t border-[#E8E2D8] flex items-center justify-between">
                    <span className="text-[10px] text-[#A8A29E]">
                      {note.createdAt ? new Date(note.createdAt).toLocaleDateString('es-MX') : 'Reciente'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handlePreviewNoteInTxtViewer(note)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                        title="Ver en Visor de Texto TXT"
                      >
                        <Eye className="w-3 h-3" />
                        Visor
                      </button>

                      <button
                        onClick={() => handleDownloadNoteAsTxt(note)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-[#78716C] hover:text-[#C85A32] hover:bg-[#FAF0EB] rounded-lg transition"
                        title="Descargar nota en texto (.txt)"
                      >
                        <Download className="w-3 h-3" />
                        TXT
                      </button>

                      <button
                        onClick={() => handleStartEditNote(note)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-[#57534E] hover:text-[#C85A32] hover:bg-[#FAF0EB] rounded-lg transition"
                      >
                        <Edit3 className="w-3 h-3" />
                        Editar
                      </button>

                      <button
                        onClick={() => handleOpenShareModal(note)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-[#FAF0EB] text-[#C85A32] hover:bg-[#C85A32] hover:text-white rounded-lg transition shadow-2xs"
                      >
                        <Share2 className="w-3 h-3" />
                        Compartir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Files & Photos with Universal PDF, JPEG, and TXT Viewer */}
      {activeTab === 'files' && (
        <div className="space-y-4">
          {/* Top Bar with Google Drive Connection and Type Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FBF9F5] p-4 rounded-2xl border border-[#E8E2D8]">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-[#181715]">
                  Expediente de Archivos &amp; Documentos
                </p>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                  Visor Compatible PDF • JPEG • TXT
                </span>
              </div>
              <p className="text-[11px] text-[#78716C] mt-0.5">
                Carpeta ID: <code className="font-mono text-[#C85A32]">{GOOGLE_DRIVE_FOLDER_ID}</code> • Clic en cualquier documento para abrirlo en el visor
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={GOOGLE_DRIVE_FOLDER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E8E2D8] hover:bg-[#FAF0EB] text-[#181715] rounded-xl text-xs font-bold transition shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                Descargar en Drive
              </a>

              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#C85A32] hover:bg-[#B24B25] text-white rounded-xl text-xs font-bold shadow-xs transition">
                <Upload className="w-3.5 h-3.5" />
                Subir Archivo (PDF, JPEG, TXT)
                <input 
                  type="file" 
                  onChange={handleFileUpload} 
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,text/plain,application/pdf,image/*"
                  className="hidden" 
                />
              </label>
            </div>
          </div>

          {/* Format Filter Bar (All, PDF, JPEG, TXT) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-[#57534E] mr-1">Filtrar por formato:</span>
            {[
              { id: 'all', label: `Todos (${files.length})` },
              { id: 'pdf', label: `PDF (${files.filter(f => f.mimeType?.includes('pdf') || f.name.toLowerCase().endsWith('.pdf')).length})` },
              { id: 'jpeg', label: `JPEG / Fotos (${files.filter(f => f.mimeType?.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(f.name)).length})` },
              { id: 'txt', label: `TXT (${files.filter(f => f.mimeType?.includes('text') || f.name.toLowerCase().endsWith('.txt') || f.textContent).length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFileFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  fileFilter === tab.id
                    ? 'bg-[#181715] text-white'
                    : 'bg-white border border-[#E8E2D8] text-[#57534E] hover:bg-[#F4EFEA]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {filteredFiles.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#E8E2D8]">
              <Folder className="w-12 h-12 mx-auto text-[#C85A32]/40 mb-3" />
              <h3 className="font-serif font-bold text-lg text-[#181715]">No hay archivos en este filtro</h3>
              <p className="text-xs text-[#78716C] mt-1 max-w-md mx-auto">
                Sube archivos en formato PDF, imágenes JPEG o notas en TXT para visualizarlos y descargarlos.
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={onOpenCamera}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#E8E2D8] text-xs font-bold rounded-xl"
                >
                  <Camera className="w-4 h-4 text-[#C85A32]" />
                  Tomar Foto
                </button>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-[#C85A32] text-white text-xs font-bold rounded-xl shadow-xs">
                  <Upload className="w-4 h-4" />
                  Subir PDF, JPEG o TXT
                  <input 
                    type="file" 
                    onChange={handleFileUpload} 
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,text/plain,application/pdf,image/*"
                    className="hidden" 
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredFiles.map((file) => {
                const nameLower = file.name.toLowerCase();
                const isPdf = file.mimeType?.includes('pdf') || nameLower.endsWith('.pdf');
                const isImage = file.mimeType?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(nameLower) || file.isFromCamera;
                const isTxt = file.mimeType?.includes('text') || nameLower.endsWith('.txt') || Boolean(file.textContent);

                return (
                  <div
                    key={file.id}
                    className="bg-white p-4 rounded-2xl border border-[#E8E2D8] hover:border-[#C85A32] shadow-xs hover:shadow-md transition flex flex-col justify-between group"
                  >
                    <div>
                      {/* Card Thumbnail / Preview trigger */}
                      <div 
                        onClick={() => setSelectedViewerFile(file)}
                        className="aspect-4/3 rounded-xl overflow-hidden mb-3 bg-[#FAF8F5] border border-[#E8E2D8] relative cursor-pointer group-hover:border-[#C85A32] transition flex items-center justify-center"
                      >
                        {isImage && file.dataUrl ? (
                          <img src={file.dataUrl} alt={file.name} className="w-full h-full object-cover" />
                        ) : isPdf ? (
                          <div className="flex flex-col items-center justify-center p-4 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-1.5 border border-rose-200">
                              <FileText className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-100/60 px-2 py-0.5 rounded-full">
                              DOCUMENTO PDF
                            </span>
                          </div>
                        ) : isTxt ? (
                          <div className="flex flex-col items-center justify-center p-4 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5 border border-indigo-200">
                              <FileCode className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/60 px-2 py-0.5 rounded-full">
                              TEXTO TXT
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5 border border-amber-200">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full">
                              FOTO JPEG
                            </span>
                          </div>
                        )}

                        {/* Hover Overlay with "Abrir Visor" */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#181715] rounded-xl text-xs font-bold shadow-md">
                            <Eye className="w-3.5 h-3.5 text-[#C85A32]" />
                            Abrir Visor
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isPdf 
                            ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                            : isTxt 
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {isPdf ? 'PDF' : isTxt ? 'TXT' : 'JPEG'}
                        </span>

                        <span className="text-[10px] text-[#78716C]">{file.size || '1.2 MB'}</span>
                      </div>

                      <h4 className="font-bold text-xs text-[#181715] truncate" title={file.name}>
                        {file.name}
                      </h4>

                      {file.isFromCamera && (
                        <span className="inline-block text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded mt-1">
                          📸 Tomada con cámara
                        </span>
                      )}
                    </div>

                    {/* File Download and Actions */}
                    <div className="mt-3 pt-2.5 border-t border-[#E8E2D8] flex items-center justify-between">
                      {/* Direct Download Button */}
                      {file.dataUrl ? (
                        <a
                          href={file.dataUrl}
                          download={file.name}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FAF0EB] hover:bg-[#C85A32] text-[#C85A32] hover:text-white rounded-lg text-xs font-bold transition shadow-2xs"
                          title="Descargar archivo en este dispositivo"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Descargar
                        </a>
                      ) : file.url ? (
                        <a
                          href={file.url}
                          download={file.name}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FAF0EB] hover:bg-[#C85A32] text-[#C85A32] hover:text-white rounded-lg text-xs font-bold transition shadow-2xs"
                          title="Descargar desde Google Drive"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Descargar
                        </a>
                      ) : (
                        <a
                          href={GOOGLE_DRIVE_FOLDER_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FAF0EB] hover:bg-[#C85A32] text-[#C85A32] hover:text-white rounded-lg text-xs font-bold transition shadow-2xs"
                          title="Abrir en Drive para descargar"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Descargar
                        </a>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedViewerFile(file)}
                          className="p-1.5 text-[#78716C] hover:text-[#181715] hover:bg-[#F4EFEA] rounded-lg transition"
                          title="Abrir en visor"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar ${file.name}?`)) {
                              onDeleteFile(file.id);
                            }
                          }}
                          className="p-1.5 text-[#78716C] hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="Eliminar Archivo"
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
      )}

    </div>
  );
};
