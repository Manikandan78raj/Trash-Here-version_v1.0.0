import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  Camera,
  Trash2,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { Card, Heading, Text, Button, Badge } from '@/components/ui';
import { toast } from '@/common/notifications/toast';
import { uploadToCloudinary } from '@/common/services/cloudinary.service';

export interface BookingImageState {
  id: string;
  url: string;
  file?: File;
  aiConfidence: number;
  detectedCategory?: string;
  originalSizeKB: number;
  compressedSizeKB: number;
  isUploading?: boolean;
  progress?: number;
}

interface Step2ImageUploadProps {
  images: BookingImageState[];
  onChange: (images: BookingImageState[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export const Step2ImageUpload: React.FC<Step2ImageUploadProps> = ({
  images,
  onChange,
  onBack,
  onNext,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES = 5;
  const MAX_SIZE_MB = 10;
  const VALID_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    if (images.length + fileArray.length > MAX_IMAGES) {
      toast.error(`You can upload a maximum of ${MAX_IMAGES} images per pickup booking.`);
      return;
    }

    const newEntries: BookingImageState[] = [];

    for (const file of fileArray) {
      // Validate file type
      if (!VALID_TYPES.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|heic)$/i)) {
        toast.error(`Invalid format (${file.name}). Please upload JPG, PNG, or WEBP photos.`);
        continue;
      }

      // Validate size
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds the ${MAX_SIZE_MB}MB maximum size limit.`);
        continue;
      }

      const tempId = `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const previewUrl = URL.createObjectURL(file);

      const uploadingItem: BookingImageState = {
        id: tempId,
        url: previewUrl,
        file,
        aiConfidence: 0,
        originalSizeKB: Math.round(file.size / 1024),
        compressedSizeKB: Math.round(file.size / 1024),
        isUploading: true,
        progress: 0,
      };

      newEntries.push(uploadingItem);
    }

    if (newEntries.length === 0) return;

    // Append uploading items to state immediately
    let currentList = [...images, ...newEntries];
    onChange(currentList);

    // Process each upload sequentially or in parallel
    for (const entry of newEntries) {
      if (!entry.file) continue;

      try {
        const result = await uploadToCloudinary(entry.file, (percent) => {
          currentList = currentList.map((img) =>
            img.id === entry.id ? { ...img, progress: percent } : img,
          );
          onChange(currentList);
        });

        // Update state with verified Cloudinary result & AI confidence
        currentList = currentList.map((img) =>
          img.id === entry.id
            ? {
                ...img,
                url: result.url,
                aiConfidence: result.aiConfidence,
                detectedCategory: result.detectedCategory,
                originalSizeKB: result.originalSizeKB,
                compressedSizeKB: result.compressedSizeKB,
                isUploading: false,
                progress: 100,
              }
            : img,
        );
        onChange(currentList);
        toast.success(
          `✨ AI Verified: ${result.detectedCategory} (${Math.round(result.aiConfidence * 100)}% confidence)`,
        );
      } catch (error) {
        toast.error(`Failed to upload photo.`);
        currentList = currentList.filter((img) => img.id !== entry.id);
        onChange(currentList);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemoveImage = (id: string) => {
    onChange(images.filter((img) => img.id !== id));
    toast.info('Photo removed from verification queue.');
  };

  const isAnyUploading = images.some((img) => img.isUploading);

  return (
    <div className="space-y-6">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Drag & Drop Upload Zone */}
      <Card
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-8 md:p-12 border-2 border-dashed rounded-3xl text-center transition-all duration-300 relative overflow-hidden ${
          isDragging
            ? 'border-primary bg-primary/10 scale-[1.01] shadow-xl'
            : 'border-border/80 bg-card/60 hover:bg-card hover:border-primary/50'
        }`}
      >
        <div className="max-w-md mx-auto space-y-4">
          <div className="mx-auto w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm glow-primary/20">
            <UploadCloud className="h-8 w-8 animate-bounce" />
          </div>

          <div className="space-y-1">
            <Heading level={3} className="text-lg md:text-xl font-bold">
              Drag & Drop Waste Photos Here
            </Heading>
            <Text variant="muted" className="text-xs md:text-sm">
              Our AI vision engine scans images to verify category accuracy and unlock +15% bonus
              payouts.
            </Text>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full sm:w-auto font-bold font-mono text-xs"
            >
              <UploadCloud className="mr-2 h-4 w-4 text-primary" />
              Browse Gallery
            </Button>

            <Button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              variant="primary"
              className="w-full sm:w-auto font-bold font-mono text-xs"
            >
              <Camera className="mr-2 h-4 w-4" />
              Take Photo
            </Button>
          </div>

          <div className="pt-2 flex items-center justify-center gap-4 text-[11px] font-mono text-muted-foreground">
            <span>• Max {MAX_IMAGES} photos</span>
            <span>• Up to {MAX_SIZE_MB}MB each</span>
            <span>• Auto HTML5 Compression</span>
          </div>
        </div>
      </Card>

      {/* Uploaded Images Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Heading level={3} className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              AI Verified Photos ({images.length} / {MAX_IMAGES})
            </Heading>
            <Text variant="muted" className="text-xs font-mono">
              Client-side JPEG compression active
            </Text>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {images.map((img) => (
                <motion.div
                  key={img.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.25 }}
                >
                  <Card className="p-3 rounded-2xl border border-border/60 bg-card/90 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
                    {/* Image Preview Container */}
                    <div className="relative h-44 w-full rounded-xl overflow-hidden bg-muted">
                      <img
                        src={img.url}
                        alt="Waste item preview"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img.id)}
                        disabled={img.isUploading}
                        className="absolute top-2 right-2 p-2 rounded-full bg-black/60 text-white hover:bg-destructive transition-colors backdrop-blur-md"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      {/* Uploading Overlay */}
                      {img.isUploading && (
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-white space-y-3">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <span className="text-xs font-mono font-bold">
                            Compressing & Uploading ({img.progress || 0}%)
                          </span>
                          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-primary h-full transition-all duration-300"
                              style={{ width: `${img.progress || 0}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* AI Diagnostics & Compression Stats */}
                    {!img.isUploading && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="default" size="sm" className="font-mono text-[10px]">
                            <Sparkles className="mr-1 h-3 w-3" />
                            {img.detectedCategory || 'AI Verified'}
                          </Badge>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {Math.round(img.aiConfidence * 100)}% Match
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1 border-t border-border/40">
                          <span>
                            Size: {img.compressedSizeKB} KB{' '}
                            {img.originalSizeKB > img.compressedSizeKB && (
                              <span className="line-through opacity-60">
                                ({img.originalSizeKB} KB)
                              </span>
                            )}
                          </span>
                          {img.originalSizeKB > img.compressedSizeKB && (
                            <span className="text-primary font-bold">
                              -
                              {Math.round(
                                ((img.originalSizeKB - img.compressedSizeKB) / img.originalSizeKB) *
                                  100,
                              )}
                              %
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Footer Action Bar */}
      <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button onClick={onBack} variant="outline" size="lg" className="w-full sm:w-auto font-bold">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Categories
        </Button>

        <Button
          onClick={onNext}
          disabled={isAnyUploading || images.length === 0}
          size="lg"
          className="w-full sm:w-auto font-bold tracking-wide group"
        >
          {isAnyUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading Photos...
            </>
          ) : (
            <>
              Proceed to Address Selection
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
