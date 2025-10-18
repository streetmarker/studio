'use client';

import Image from 'next/image';
import { RefreshCw, Save, LoaderCircle, UploadCloud } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface ReviewDisplayProps {
  photoDataUrl: string;
  review: string | null;
  isLoading: boolean;
  onRegenerate: () => void;
  onSave: () => void;
  onClear: () => void;
}

export function ReviewDisplay({
  photoDataUrl,
  review,
  isLoading,
  onRegenerate,
  onSave,
  onClear,
}: ReviewDisplayProps) {
  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
      <Card className="overflow-hidden shadow-lg">
        <CardContent className="p-0">
          <div className="relative aspect-square w-full">
            <Image
              src={photoDataUrl}
              alt="Uploaded photo for review"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        <Card className="flex-grow shadow-lg">
          <CardContent className="p-6">
            <h2 className="mb-4 font-headline text-2xl text-foreground">
              AI Photo Review
            </h2>
            {isLoading && !review ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : (
              <div className="leading-relaxed text-foreground/90">
                {review}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button onClick={onRegenerate} disabled={isLoading || !review} className="w-full sm:w-auto">
            {isLoading && review ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <RefreshCw />
            )}
            Regenerate
          </Button>
          <Button
            onClick={onSave}
            variant="secondary"
            disabled={isLoading || !review}
            className="w-full sm:w-auto"
          >
            <Save />
            Save to Profile
          </Button>
        </div>
        <Button
          onClick={onClear}
          variant="ghost"
          className="h-auto self-start p-1 text-muted-foreground hover:text-foreground"
        >
          <UploadCloud className="mr-2 h-4 w-4" />
          Upload another photo
        </Button>
      </div>
    </div>
  );
}
