import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, RefreshCw, CheckCircle2, AlertCircle, FileImage } from 'lucide-react';
import { useCreateUploadUrl, useUploadImage, useAnalyzeImage } from '../hooks/useAiQuery';
import type { AiModelType } from '../types/ai.types';
import { validateFileUpload } from '@/common/security/upload-validator';

interface AiScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete?: (jobId: string) => void;
  defaultModelType?: AiModelType;
}

const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

export const AiScannerModal: React.FC<AiScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
  defaultModelType = 'HYBRID_VISION',
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [statusStep, setStatusStep] = useState<
    'IDLE' | 'UPLOADING' | 'ANALYZING' | 'ERROR' | 'SUCCESS'
  >('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const createUploadUrlMutation = useCreateUploadUrl();
  const uploadImageMutation = useUploadImage();
  const analyzeImageMutation = useAnalyzeImage();

  const calculateSha256 = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const handleFileSelect = useCallback(
    async (file: File) => {
      setErrorMessage(null);

      if (!SUPPORTED_MIME_TYPES.includes(file.type.toLowerCase())) {
        setErrorMessage('Unsupported file format. Supported formats: JPEG, PNG, WebP, HEIC');
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        setErrorMessage('File size exceeds maximum limit of 20MB.');
        return;
      }

      const validation = await validateFileUpload(file, { maxSizeBytes: 20 * 1024 * 1024 });
      if (!validation.isValid) {
        setErrorMessage(validation.error || 'Invalid file format or security check failed.');
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      await processAndUpload(file);
    },
    [defaultModelType],
  );

  const processAndUpload = async (fileToUpload: File) => {
    try {
      setStatusStep('UPLOADING');
      setUploadProgress(10);

      // 1. Get Presigned URL
      const uploadMeta = await createUploadUrlMutation.mutateAsync({
        mimeType: fileToUpload.type || 'image/jpeg',
        fileSizeBytes: fileToUpload.size,
      });
      setUploadProgress(30);

      // 2. Direct PUT to S3
      await uploadImageMutation.mutateAsync({
        presignedUrl: uploadMeta.presignedUrl,
        file: fileToUpload,
        onProgress: (progress) => {
          if (progress.total) {
            const pct = Math.round((progress.loaded / progress.total) * 50) + 30;
            setUploadProgress(pct);
          }
        },
      });
      setUploadProgress(85);

      // 3. Calculate Hash and Analyze
      setStatusStep('ANALYZING');
      const sha256Hash = await calculateSha256(fileToUpload);
      const analyzeRes = await analyzeImageMutation.mutateAsync({
        storageKey: uploadMeta.storageKey,
        sha256Hash,
        modelType: defaultModelType,
      });

      setUploadProgress(100);
      setStatusStep('SUCCESS');

      if (onScanComplete) {
        onScanComplete(analyzeRes.jobId);
      }
    } catch (err: any) {
      setStatusStep('ERROR');
      setErrorMessage(err?.message || 'Failed to scan image. Please try again.');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const startCamera = async () => {
    try {
      setErrorMessage(null);
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      setErrorMessage('Could not access camera. Please check browser permissions.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 1280;
      canvas.height = videoRef.current.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], `camera-scan-${Date.now()}.jpg`, {
                type: 'image/jpeg',
              });
              stopCamera();
              handleFileSelect(file);
            }
          },
          'image/jpeg',
          0.92,
        );
      }
    }
  };

  const handleRetry = () => {
    if (selectedFile) {
      processAndUpload(selectedFile);
    } else {
      setStatusStep('IDLE');
      setErrorMessage(null);
    }
  };

  const handleCloseModal = () => {
    stopCamera();
    setSelectedFile(null);
    setPreviewUrl(null);
    setStatusStep('IDLE');
    setUploadProgress(0);
    setErrorMessage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl overflow-hidden bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl shadow-2xl backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200/50 dark:border-zinc-800/50">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#D7FF43]/20 text-zinc-900 dark:text-[#D7FF43]">
                <FileImage className="w-5 h-5 text-[#97c400] dark:text-[#D7FF43]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  AI Waste Scanner
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Instant multi-object detection & contamination grading
                </p>
              </div>
            </div>
            <button
              onClick={handleCloseModal}
              className="p-2 text-zinc-400 transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-200"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {errorMessage && (
              <div className="flex items-center gap-3 p-4 mb-4 text-sm text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-300 rounded-2xl border border-red-200 dark:border-red-800/50">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="flex-1">{errorMessage}</span>
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40 rounded-xl hover:bg-red-200 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry
                </button>
              </div>
            )}

            {isCameraActive ? (
              <div className="relative overflow-hidden bg-black rounded-2xl aspect-video">
                <video ref={videoRef} autoPlay playsInline className="object-cover w-full h-full" />
                <div className="absolute inset-x-0 bottom-4 flex justify-center gap-4">
                  <button
                    onClick={capturePhoto}
                    className="px-6 py-2.5 font-medium text-zinc-900 bg-[#D7FF43] rounded-full shadow-lg hover:bg-[#c2eb30] transition-transform active:scale-95"
                  >
                    Capture Scan
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-6 py-2.5 font-medium text-white bg-zinc-800/80 backdrop-blur-md rounded-full hover:bg-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : statusStep === 'IDLE' || statusStep === 'ERROR' ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-8 text-center transition-all border-2 border-dashed cursor-pointer rounded-2xl border-zinc-300 dark:border-zinc-700 hover:border-[#D7FF43] dark:hover:border-[#D7FF43] bg-zinc-50/50 dark:bg-zinc-800/30 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                  data-testid="file-upload-input"
                />
                <div className="flex items-center justify-center w-16 h-16 mb-4 transition-transform rounded-full bg-white dark:bg-zinc-800 shadow-sm group-hover:scale-105">
                  <Upload className="w-8 h-8 text-zinc-600 dark:text-zinc-300 group-hover:text-[#97c400] dark:group-hover:text-[#D7FF43]" />
                </div>
                <p className="mb-1 text-base font-medium text-zinc-800 dark:text-zinc-200">
                  Drag & drop waste image here, or browse
                </p>
                <p className="mb-6 text-xs text-zinc-500 dark:text-zinc-400">
                  Supported formats: JPEG, PNG, WebP, HEIC (Max 20MB)
                </p>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    startCamera();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-zinc-900 bg-[#D7FF43] rounded-full shadow-md hover:bg-[#c2eb30] transition-all"
                  role="button"
                >
                  <Camera className="w-4 h-4" />
                  Take Photo
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="relative w-full max-w-md overflow-hidden bg-zinc-900 rounded-2xl aspect-video shadow-lg">
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Scan preview"
                      className="object-cover w-full h-full opacity-80"
                    />
                  )}
                  {/* Framer Motion Laser Scanning Animation */}
                  {statusStep === 'ANALYZING' && (
                    <motion.div
                      initial={{ top: 0 }}
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#D7FF43] to-transparent shadow-[0_0_15px_#D7FF43]"
                    />
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    {statusStep === 'UPLOADING' && (
                      <>
                        <RefreshCw className="w-8 h-8 mb-2 text-[#D7FF43] animate-spin" />
                        <p className="text-sm font-medium text-white">
                          Uploading to secure cloud storage...
                        </p>
                      </>
                    )}
                    {statusStep === 'ANALYZING' && (
                      <>
                        <div className="relative flex items-center justify-center w-12 h-12 mb-2">
                          <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-[#D7FF43]" />
                          <Camera className="w-6 h-6 text-[#D7FF43]" />
                        </div>
                        <p className="text-sm font-medium text-white">
                          AI Vision Engine auditing waste purity...
                        </p>
                      </>
                    )}
                    {statusStep === 'SUCCESS' && (
                      <>
                        <CheckCircle2 className="w-10 h-10 mb-2 text-[#D7FF43]" />
                        <p className="text-base font-semibold text-white">Scan Complete!</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-md mt-6">
                  <div className="flex justify-between mb-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    <span>
                      {statusStep === 'UPLOADING'
                        ? 'Uploading...'
                        : statusStep === 'ANALYZING'
                          ? 'Running AI Vision Inference...'
                          : 'Complete'}
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 overflow-hidden bg-zinc-200 dark:bg-zinc-800 rounded-full">
                    <motion.div
                      className="h-full bg-[#D7FF43]"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
