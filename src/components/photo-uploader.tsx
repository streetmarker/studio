'use client';

import { Camera } from 'lucide-react';
import { useRef, type ChangeEvent, type DragEvent, useState } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface PhotoUploaderProps {
  onPhotoUpload: (file: File) => void;
  isLoading: boolean;
}

export function PhotoUploader({
  onPhotoUpload,
  isLoading,
}: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onPhotoUpload(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onPhotoUpload(file);
    }
  };

  return (
    <div
      className={cn(
        'mx-auto w-full max-w-2xl flex flex-col items-center justify-center gap-6 rounded-xl border-2 border-dashed p-8 text-center transition-colors',
        isDragging
          ? 'border-primary bg-primary/10'
          : 'border-muted-foreground/30'
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-full bg-secondary p-4">
          <Camera className="h-10 w-10 text-secondary-foreground" />
        </div>
        <h2 className="font-headline text-2xl text-foreground">
          Upload Your Photo
        </h2>
        <p className="text-muted-foreground">
          Drag & drop an image file here or click to select one.
        </p>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        disabled={isLoading}
      />
      <Button onClick={handleButtonClick} disabled={isLoading} size="lg">
        {isLoading ? 'Processing...' : 'Select Photo'}
      </Button>
    </div>
  );
}
