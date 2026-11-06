import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RotateCcw, Check, FlipHorizontal, AlertCircle, Upload } from 'lucide-react';
import { Client, Prospect, FileAttachment } from '../types';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  prospects: Prospect[];
  preselectedClientId?: string;
  preselectedProspectId?: string;
  onSaveFile: (file: FileAttachment) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  clients,
  prospects,
  preselectedClientId,
  preselectedProspectId,
  onSaveFile
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [docName, setDocName] = useState<string>('Documento_Camara_' + new Date().toISOString().split('T')[0]);
  const [relatedType, setRelatedType] = useState<'client' | 'prospect' | 'general'>(
    preselectedClientId ? 'client' : preselectedProspectId ? 'prospect' : 'client'
  );
  const [selectedId, setSelectedId] = useState<string>(
    preselectedClientId || preselectedProspectId || (clients[0]?.id || '')
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start camera stream when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setCameraError(null);
      return;
    }

    startCamera(cameraFacing);

    return () => {
      stopCamera();
    };
  }, [isOpen, cameraFacing]);

  const startCamera = async (facing: 'environment' | 'user') => {
    stopCamera();
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('La cámara no está disponible en este navegador o entorno.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError(
        'No se pudo abrir la cámara en vivo directamente. Puedes usar el botón de captura nativo del móvil abajo.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera(cameraFacing);
  };

  // Fallback native smartphone file capture (accept="image/*" capture="environment")
  const handleNativeMobileCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCapturedImage(reader.result);
          setDocName(file.name.replace(/\.[^/.]+$/, '') || 'Foto_Camara');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!capturedImage) return;

    const finalName = docName.endsWith('.jpg') || docName.endsWith('.png') ? docName : `${docName}.jpg`;

    const newFile: FileAttachment = {
      id: `fil-cam-${Date.now()}`,
      name: finalName,
      dataUrl: capturedImage,
      size: '1.2 MB',
      mimeType: 'image/jpeg',
      uploadedAt: new Date().toISOString(),
      relatedType,
      relatedId: selectedId,
      isFromCamera: true
    };

    onSaveFile(newFile);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#E8E2D8] max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E2D8] bg-[#FBF9F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF0EB] text-[#C85A32] flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#181715]">Cámara para Expediente</h2>
              <p className="text-xs text-[#78716C]">Fotografía contratos, recibos o scouting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#E8E2D8] text-[#78716C] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder or Preview */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          <div className="relative aspect-4/3 w-full bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-[#33302B] shadow-inner">
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Foto capturada"
                className="w-full h-full object-contain"
              />
            ) : cameraError ? (
              <div className="p-6 text-center text-white/90 space-y-3">
                <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                <p className="text-sm">{cameraError}</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C85A32] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#B24B25] transition"
                >
                  <Camera className="w-4 h-4" />
                  Abrir Cámara del Celular
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Viewfinder frame overlay */}
                <div className="absolute inset-4 border-2 border-white/40 rounded-xl pointer-events-none flex items-center justify-center">
                  <div className="w-8 h-8 border-t-2 border-l-2 border-amber-400 absolute top-2 left-2" />
                  <div className="w-8 h-8 border-t-2 border-r-2 border-amber-400 absolute top-2 right-2" />
                  <div className="w-8 h-8 border-b-2 border-l-2 border-amber-400 absolute bottom-2 left-2" />
                  <div className="w-8 h-8 border-b-2 border-r-2 border-amber-400 absolute bottom-2 right-2" />
                </div>
              </>
            )}

            {/* Hidden canvas for taking snapshot */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Hidden file input for native smartphone camera trigger */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleNativeMobileCapture}
              className="hidden"
            />
          </div>

          {/* Action buttons under viewfinder */}
          <div className="flex items-center justify-center gap-3">
            {capturedImage ? (
              <button
                type="button"
                onClick={retakePhoto}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-[#F4EFEA] hover:bg-[#E8E2D8] text-[#57534E] transition"
              >
                <RotateCcw className="w-4 h-4" />
                Tomar otra foto
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="p-3 bg-[#F4EFEA] hover:bg-[#E8E2D8] rounded-xl text-[#57534E] transition"
                  title="Girar cámara"
                >
                  <FlipHorizontal className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-6 py-3 bg-[#C85A32] hover:bg-[#B24B25] text-white font-bold rounded-2xl shadow-lg transition flex items-center gap-2"
                >
                  <span className="w-3 h-3 rounded-full bg-white animate-ping" />
                  Disparar Foto
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-[#F4EFEA] hover:bg-[#E8E2D8] rounded-xl text-[#57534E] transition"
                  title="Abrir cámara nativa o carrete"
                >
                  <Upload className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Form details */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#57534E] mb-1">
                Nombre del archivo / documento
              </label>
              <input
                type="text"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="Ej. Contrato_Novios.jpg, Recibo_Anticipo.jpg"
                className="w-full px-3.5 py-2.5 bg-[#FAF0EB]/40 border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#57534E] mb-1">
                  Asociar a
                </label>
                <select
                  value={relatedType}
                  onChange={(e) => {
                    const next = e.target.value as any;
                    setRelatedType(next);
                    if (next === 'client' && clients.length) setSelectedId(clients[0].id);
                    if (next === 'prospect' && prospects.length) setSelectedId(prospects[0].id);
                  }}
                  className="w-full px-3 py-2 bg-white border border-[#E8E2D8] rounded-xl text-sm focus:outline-none focus:border-[#C85A32]"
                >
                  <option value="client">Cliente</option>
                  <option value="prospect">Prospecto</option>
                  <option value="general">Expediente General</option>
                </select>
              </div>

              {relatedType !== 'general' && (
                <div>
                  <label className="block text-xs font-semibold text-[#57534E] mb-1">
                    Seleccionar {relatedType === 'client' ? 'Cliente' : 'Prospecto'}
                  </label>
                  <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
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
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[#E8E2D8] bg-[#FBF9F5] flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#57534E] hover:bg-[#E8E2D8] transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!capturedImage}
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#C85A32] hover:bg-[#B24B25] disabled:opacity-50 text-white shadow transition"
          >
            <Check className="w-4 h-4" />
            Adjuntar al Expediente
          </button>
        </div>

      </div>
    </div>
  );
};
