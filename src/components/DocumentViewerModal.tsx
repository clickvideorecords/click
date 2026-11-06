import React, { useState, useEffect } from 'react';
import { 
  X, Download, ExternalLink, ZoomIn, ZoomOut, RotateCw, 
  Maximize2, Minimize2, FileText, Image as ImageIcon, 
  Printer, Copy, Check, Search, Share2, Eye,
  FileCode, Sparkles, RefreshCw
} from 'lucide-react';
import { FileAttachment } from '../types';
import { GOOGLE_DRIVE_FOLDER_URL } from '../services/googleDrive';

interface DocumentViewerModalProps {
  file: FileAttachment | null;
  onClose: () => void;
  onDelete?: (fileId: string) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  file,
  onClose,
  onDelete
}) => {
  // Image controls state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Text viewer state
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [fontFamily, setFontFamily] = useState<'mono' | 'sans' | 'serif'>('mono');
  const [copiedText, setCopiedText] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [decodedText, setDecodedText] = useState<string>('');

  useEffect(() => {
    // Reset state when file changes
    setZoomLevel(1);
    setRotation(0);
    setCopiedText(false);
    setSearchTerm('');

    if (file) {
      if (file.textContent) {
        setDecodedText(file.textContent);
      } else if (file.dataUrl && file.dataUrl.startsWith('data:text')) {
        try {
          if (file.dataUrl.includes('base64,')) {
            const base64 = file.dataUrl.split('base64,')[1];
            setDecodedText(decodeURIComponent(escape(atob(base64))));
          } else if (file.dataUrl.includes(',')) {
            const raw = file.dataUrl.split(',')[1];
            setDecodedText(decodeURIComponent(raw));
          }
        } catch {
          setDecodedText('No se pudo decodificar el contenido del archivo de texto.');
        }
      } else {
        setDecodedText('');
      }
    }
  }, [file]);

  if (!file) return null;

  const fileNameLower = file.name.toLowerCase();
  const isPdf = 
    file.mimeType?.includes('pdf') || 
    fileNameLower.endsWith('.pdf') || 
    file.dataUrl?.startsWith('data:application/pdf');

  const isImage = 
    file.mimeType?.startsWith('image/') || 
    /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(fileNameLower) || 
    file.dataUrl?.startsWith('data:image/') || 
    file.isFromCamera;

  const isTxt = 
    file.mimeType?.includes('text') || 
    fileNameLower.endsWith('.txt') || 
    file.dataUrl?.startsWith('data:text') || 
    Boolean(file.textContent);

  // Fallback / Unknown format
  const fileTypeLabel = isPdf ? 'Documento PDF' : isImage ? 'Imagen JPEG / Foto' : isTxt ? 'Archivo de Texto TXT' : 'Archivo';

  // Handlers for image zoom
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  // Copy text handler
  const handleCopyText = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Direct download handler
  const handleDownloadFile = () => {
    if (isTxt && decodedText) {
      const element = document.createElement('a');
      const blob = new Blob([decodedText], { type: 'text/plain;charset=utf-8' });
      element.href = URL.createObjectURL(blob);
      element.download = file.name.endsWith('.txt') ? file.name : `${file.name}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      return;
    }

    if (file.dataUrl) {
      const link = document.createElement('a');
      link.href = file.dataUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (file.url) {
      window.open(file.url, '_blank', 'noopener,noreferrer');
    } else {
      window.open(GOOGLE_DRIVE_FOLDER_URL, '_blank', 'noopener,noreferrer');
    }
  };

  // WhatsApp share of TXT
  const handleShareTxtWhatsApp = () => {
    if (!decodedText) return;
    const msg = `*Click Videorecords | ${file.name}*\n\n${decodedText.slice(0, 1500)}${decodedText.length > 1500 ? '...\n(Texto truncado)' : ''}\n\n📍 Mérida, Yucatán`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div 
        className={`bg-[#181715] text-[#FBF9F5] rounded-3xl shadow-2xl border border-neutral-800 flex flex-col overflow-hidden transition-all duration-200 ${
          isFullscreen 
            ? 'w-full h-full rounded-none' 
            : 'max-w-5xl w-full h-[90vh]'
        }`}
      >
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-[#22201D] border-b border-[#33302B] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2 rounded-xl shrink-0 ${
              isPdf 
                ? 'bg-rose-950 text-rose-400 border border-rose-800/50' 
                : isImage 
                ? 'bg-amber-950 text-amber-400 border border-amber-800/50' 
                : 'bg-indigo-950 text-indigo-400 border border-indigo-800/50'
            }`}>
              {isPdf ? (
                <FileText className="w-5 h-5" />
              ) : isImage ? (
                <ImageIcon className="w-5 h-5" />
              ) : (
                <FileCode className="w-5 h-5" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white truncate max-w-xs sm:max-w-md" title={file.name}>
                  {file.name}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  isPdf 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                    : isImage 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                }`}>
                  {fileTypeLabel}
                </span>
              </div>
              <p className="text-[11px] text-[#A8A29E] mt-0.5 flex items-center gap-2">
                <span>{file.size || 'Tamaño variable'}</span>
                <span>•</span>
                <span>{file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString('es-MX') : 'Reciente'}</span>
                {file.isFromCamera && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">📸 Cámara</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Download Button */}
            <button
              onClick={handleDownloadFile}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C85A32] hover:bg-[#B24B25] text-white rounded-xl text-xs font-bold transition shadow-xs"
              title="Descargar archivo en este dispositivo"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Descargar</span>
            </button>

            {/* Open in Drive link */}
            <a
              href={file.url || GOOGLE_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[#A8A29E] hover:text-white hover:bg-[#2C2925] rounded-xl transition"
              title="Ver en Google Drive"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-[#A8A29E] hover:text-white hover:bg-[#2C2925] rounded-xl transition hidden sm:inline-flex"
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-[#A8A29E] hover:text-white hover:bg-[#2C2925] rounded-xl transition ml-1"
              title="Cerrar visor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Format Specific Toolbar */}
        <div className="px-5 py-2 bg-[#1C1A17] border-b border-[#33302B] flex flex-wrap items-center justify-between gap-3 text-xs text-[#A8A29E] shrink-0">
          {/* Controls for IMAGE */}
          {isImage && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#E8E2D8]">Controles de Imagen:</span>
              <div className="flex items-center bg-[#282623] rounded-xl p-0.5 border border-[#3A3631]">
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 text-[#E8E2D8] hover:text-white hover:bg-[#33302B] rounded-lg transition"
                  title="Alejar (-)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-[11px] font-mono text-white select-none">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 text-[#E8E2D8] hover:text-white hover:bg-[#33302B] rounded-lg transition"
                  title="Acercar (+)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleRotate}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#282623] hover:bg-[#33302B] text-[#E8E2D8] hover:text-white rounded-xl border border-[#3A3631] transition"
                title="Girar 90 grados"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotar {rotation !== 0 ? `(${rotation}°)` : ''}</span>
              </button>

              <button
                onClick={handleResetZoom}
                className="px-2.5 py-1.5 bg-[#282623] hover:bg-[#33302B] text-[#A8A29E] hover:text-white rounded-xl border border-[#3A3631] transition"
              >
                Ajustar
              </button>
            </div>
          )}

          {/* Controls for PDF */}
          {isPdf && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#E8E2D8]">Visor de Documentos PDF:</span>
              <span className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                Vista de Contrato Oficial
              </span>
            </div>
          )}

          {/* Controls for TXT */}
          {isTxt && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-[#E8E2D8]">Tipografía:</span>
                <div className="flex bg-[#282623] rounded-xl p-0.5 border border-[#3A3631]">
                  <button
                    onClick={() => setFontFamily('mono')}
                    className={`px-2 py-1 text-[10px] font-bold rounded-lg transition ${
                      fontFamily === 'mono' ? 'bg-[#C85A32] text-white' : 'text-[#A8A29E] hover:text-white'
                    }`}
                  >
                    Mono
                  </button>
                  <button
                    onClick={() => setFontFamily('sans')}
                    className={`px-2 py-1 text-[10px] font-bold rounded-lg transition ${
                      fontFamily === 'sans' ? 'bg-[#C85A32] text-white' : 'text-[#A8A29E] hover:text-white'
                    }`}
                  >
                    Sans
                  </button>
                  <button
                    onClick={() => setFontFamily('serif')}
                    className={`px-2 py-1 text-[10px] font-bold rounded-lg transition ${
                      fontFamily === 'serif' ? 'bg-[#C85A32] text-white' : 'text-[#A8A29E] hover:text-white'
                    }`}
                  >
                    Serif
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold text-[#E8E2D8]">Tamaño:</span>
                <div className="flex bg-[#282623] rounded-xl p-0.5 border border-[#3A3631]">
                  <button
                    onClick={() => setFontSize('sm')}
                    className={`px-2 py-1 text-[10px] font-bold rounded-lg transition ${
                      fontSize === 'sm' ? 'bg-[#C85A32] text-white' : 'text-[#A8A29E] hover:text-white'
                    }`}
                  >
                    A-
                  </button>
                  <button
                    onClick={() => setFontSize('base')}
                    className={`px-2 py-1 text-[10px] font-bold rounded-lg transition ${
                      fontSize === 'base' ? 'bg-[#C85A32] text-white' : 'text-[#A8A29E] hover:text-white'
                    }`}
                  >
                    A
                  </button>
                  <button
                    onClick={() => setFontSize('lg')}
                    className={`px-2 py-1 text-[10px] font-bold rounded-lg transition ${
                      fontSize === 'lg' ? 'bg-[#C85A32] text-white' : 'text-[#A8A29E] hover:text-white'
                    }`}
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* In-text search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#78716C]" />
                <input
                  type="text"
                  placeholder="Buscar palabra..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 pr-3 py-1 bg-[#282623] border border-[#3A3631] rounded-xl text-xs text-white focus:outline-none focus:border-[#C85A32] w-36"
                />
              </div>
            </div>
          )}

          {/* Quick utility actions on the right */}
          <div className="flex items-center gap-2 ml-auto">
            {isTxt && (
              <>
                <button
                  onClick={() => handleCopyText(decodedText)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#282623] hover:bg-[#33302B] text-[#E8E2D8] hover:text-white rounded-xl border border-[#3A3631] transition"
                  title="Copiar todo el texto al portapapeles"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Texto</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleShareTxtWhatsApp}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 hover:text-emerald-200 rounded-xl border border-emerald-800/40 transition"
                  title="Compartir contenido por WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </>
            )}

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#282623] hover:bg-[#33302B] text-[#A8A29E] hover:text-white rounded-xl border border-[#3A3631] transition"
              title="Imprimir documento"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>

        {/* Content Viewport */}
        <div className="flex-1 bg-[#0E0D0C] overflow-auto relative flex items-center justify-center p-3 sm:p-6">
          
          {/* 1. JPEG / IMAGE VIEWER */}
          {isImage && (
            <div className="w-full h-full flex items-center justify-center overflow-auto select-none">
              {file.dataUrl ? (
                <div 
                  className="transition-transform duration-200 flex items-center justify-center"
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`
                  }}
                >
                  <img
                    src={file.dataUrl}
                    alt={file.name}
                    className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl border border-neutral-800"
                    draggable={false}
                  />
                </div>
              ) : file.url ? (
                <div 
                  className="transition-transform duration-200 flex items-center justify-center"
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`
                  }}
                >
                  <img
                    src={file.url}
                    alt={file.name}
                    className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl border border-neutral-800"
                    draggable={false}
                  />
                </div>
              ) : (
                <div className="text-center p-8 bg-[#181715] rounded-3xl border border-neutral-800 max-w-md">
                  <ImageIcon className="w-16 h-16 text-[#C85A32] mx-auto mb-3" />
                  <h4 className="font-bold text-white text-base">{file.name}</h4>
                  <p className="text-xs text-[#A8A29E] mt-1 mb-4">
                    La imagen está alojada en Google Drive. Puedes abrirla directamente para visualizarla o descargarla.
                  </p>
                  <a
                    href={GOOGLE_DRIVE_FOLDER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#C85A32] text-white text-xs font-bold rounded-xl"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Abrir en Google Drive
                  </a>
                </div>
              )}
            </div>
          )}

          {/* 2. PDF VIEWER */}
          {isPdf && (
            <div className="w-full h-full flex flex-col items-center justify-start overflow-auto">
              {file.dataUrl ? (
                <iframe
                  src={file.dataUrl}
                  title={file.name}
                  className="w-full h-full rounded-2xl border border-neutral-800 bg-white shadow-2xl"
                />
              ) : (
                /* Rich Interactive PDF Contract / Document Sheet */
                <div className="w-full max-w-3xl bg-white text-[#181715] rounded-2xl shadow-2xl border border-neutral-300 p-8 sm:p-12 my-auto space-y-6">
                  {/* PDF Document Header */}
                  <div className="border-b-2 border-[#181715] pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FAF0EB] text-[#C85A32] text-xs font-bold font-mono tracking-wider">
                          CVR-DOC-2026
                        </span>
                        <span className="text-xs text-[#78716C] font-semibold">Mérida, Yucatán</span>
                      </div>
                      <h1 className="font-serif font-black text-2xl text-[#181715] mt-1 tracking-tight">
                        CLICK VIDEORECORDS
                      </h1>
                      <p className="text-xs font-medium text-[#78716C]">
                        Cinematografía & Fotografía para Bodas & XV Años • Mérida, Yucatán
                      </p>
                    </div>

                    <div className="text-right sm:text-right">
                      <span className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider block">
                        EXPEDIENTE OFICIAL
                      </span>
                      <p className="font-mono text-xs font-bold text-[#181715]">{file.name}</p>
                      <p className="text-[11px] text-emerald-700 font-bold mt-0.5">✓ Certificado Digital Drive</p>
                    </div>
                  </div>

                  {/* Document Body */}
                  <div className="space-y-4 text-xs text-[#33302B] leading-relaxed">
                    <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E8E2D8] grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
                      <div>
                        <span className="text-[#78716C] block text-[10px] uppercase">Documento:</span>
                        <strong className="text-[#181715]">{file.name}</strong>
                      </div>
                      <div>
                        <span className="text-[#78716C] block text-[10px] uppercase">Fecha de Carga:</span>
                        <strong className="text-[#181715]">
                          {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Noviembre 2026'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#78716C] block text-[10px] uppercase">Almacenamiento:</span>
                        <strong className="text-emerald-700">Google Drive Respaldo Cloud</strong>
                      </div>
                      <div>
                        <span className="text-[#78716C] block text-[10px] uppercase">Estado:</span>
                        <strong className="text-[#C85A32]">Firmado & Sincronizado</strong>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <h4 className="font-bold text-sm text-[#181715] border-b border-[#E8E2D8] pb-1">
                        Resumen de Contrato de Servicios Audiovisuales
                      </h4>
                      <p>
                        Este archivo representa el expediente digital respaldado en la nube de Google Drive correspondiente al cliente registrado. Incluye los términos del paquete cinematográfico 4K, sesiones fotográficas programadas en hacienda / locación y cobertura del evento social.
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-[11px] text-[#57534E]">
                        <li>Cobertura en cámaras cinematográficas 4K Sony Cinema Line.</li>
                        <li>Tomas aéreas autorizadas con Dron 4K en locaciones permitidas.</li>
                        <li>Same Day Edit o Video Resumen Highlights musicalizado.</li>
                        <li>Entrega en memoria USB personalizada en madera y galería digital online.</li>
                      </ul>
                    </div>

                    <div className="pt-6 border-t border-[#E8E2D8] flex items-center justify-between text-[11px] text-[#78716C]">
                      <div>
                        <p className="font-serif font-bold text-[#181715]">Click Videorecords</p>
                        <p className="text-[10px]">Mérida, Yucatán • Tel: 999 575 8892</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleDownloadFile}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C85A32] text-white font-bold rounded-lg text-xs shadow-xs hover:bg-[#B24B25] transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Descargar PDF
                        </button>

                        <a
                          href={GOOGLE_DRIVE_FOLDER_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF0EB] text-[#C85A32] font-bold rounded-lg text-xs hover:bg-[#E8E2D8] transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Ver en Drive
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. TXT VIEWER */}
          {isTxt && (
            <div className="w-full h-full flex flex-col max-w-4xl bg-[#141311] rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden">
              {/* TXT Header Stats */}
              <div className="px-5 py-2.5 bg-[#1C1A17] border-b border-[#2C2925] flex items-center justify-between text-[11px] text-[#A8A29E]">
                <div className="flex items-center gap-3">
                  <span>Líneas: <strong className="text-white">{decodedText ? decodedText.split('\n').length : 0}</strong></span>
                  <span>•</span>
                  <span>Palabras: <strong className="text-white">{decodedText ? decodedText.trim().split(/\s+/).filter(Boolean).length : 0}</strong></span>
                  <span>•</span>
                  <span>Caracteres: <strong className="text-white">{decodedText ? decodedText.length : 0}</strong></span>
                </div>

                <span className="font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded text-[10px]">
                  UTF-8 Plain Text
                </span>
              </div>

              {/* Text content area with line numbers */}
              <div className="flex-1 overflow-auto p-4 sm:p-6 flex gap-4 font-mono">
                {/* Line numbers gutter */}
                <div className="select-none text-right pr-3 border-r border-neutral-800 text-neutral-600 font-mono text-xs leading-relaxed shrink-0">
                  {decodedText ? (
                    decodedText.split('\n').map((_, i) => (
                      <div key={i} className="h-6 leading-6">
                        {i + 1}
                      </div>
                    ))
                  ) : (
                    <div>1</div>
                  )}
                </div>

                {/* Rendered Text */}
                <div 
                  className={`flex-1 whitespace-pre-wrap leading-relaxed select-text ${
                    fontFamily === 'mono' ? 'font-mono' : fontFamily === 'serif' ? 'font-serif' : 'font-sans'
                  } ${
                    fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm'
                  } text-neutral-200`}
                >
                  {decodedText ? (
                    searchTerm ? (
                      decodedText.split('\n').map((line, lineIdx) => {
                        const parts = line.split(new RegExp(`(${searchTerm})`, 'gi'));
                        return (
                          <div key={lineIdx} className="h-6 leading-6">
                            {parts.map((part, partIdx) => 
                              part.toLowerCase() === searchTerm.toLowerCase() ? (
                                <mark key={partIdx} className="bg-amber-400 text-black px-1 rounded">
                                  {part}
                                </mark>
                              ) : (
                                part
                              )
                            )}
                          </div>
                        );
                      })
                    ) : (
                      decodedText.split('\n').map((line, i) => (
                        <div key={i} className="h-6 leading-6">
                          {line || '\u00A0'}
                        </div>
                      ))
                    )
                  ) : (
                    <div className="p-8 text-center text-neutral-500">
                      <FileCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Archivo de texto vacío o sin contenido cargado.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Bar */}
        <div className="px-5 py-3 bg-[#1C1A17] border-t border-[#33302B] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#A8A29E] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Visor Click Videorecords • Compatible con <strong>PDF, JPEG y TXT</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadFile}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C85A32] hover:bg-[#B24B25] text-white rounded-xl font-bold transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar {fileTypeLabel}
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-[#282623] hover:bg-[#33302B] text-white rounded-xl font-bold transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
