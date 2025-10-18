'use client';

import { useState, useTransition } from 'react';
import { Header } from '@/components/layout/header';
import { PhotoUploader } from '@/components/photo-uploader';
import { ReviewDisplay } from '@/components/review-display';
import { getReview, getNewReview } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function Home() {
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [review, setReview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handlePhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPhotoDataUrl(dataUrl);
      setReview(null);
      setError(null);

      startTransition(async () => {
        const result = await getReview(dataUrl);
        if (result.success && result.review) {
          setReview(result.review);
        } else {
          setError(result.error || 'An unknown error occurred.');
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRegenerate = () => {
    if (!photoDataUrl || !review) return;
    setError(null);

    startTransition(async () => {
      const result = await getNewReview(photoDataUrl, review);
      if (result.success && result.review) {
        setReview(result.review);
        toast({
          title: 'Review Regenerated!',
          description: 'A new critique has been generated for your photo.',
        });
      } else {
        setError(result.error || 'An unknown error occurred.');
      }
    });
  };

  const handleSave = () => {
    toast({
      title: 'Review Saved!',
      description: 'Your photo and critique have been saved to your profile.',
    });
  };

  const handleClear = () => {
    setPhotoDataUrl(null);
    setReview(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 pb-12">
        {!photoDataUrl ? (
          <PhotoUploader onPhotoUpload={handlePhotoUpload} isLoading={isPending} />
        ) : (
          <div className="flex flex-col gap-8">
            <ReviewDisplay
              photoDataUrl={photoDataUrl}
              review={review}
              isLoading={isPending}
              onRegenerate={handleRegenerate}
              onSave={handleSave}
              onClear={handleClear}
            />
            {error && (
              <Card className="border-destructive bg-destructive/10">
                <CardHeader className="flex-row items-center gap-3 space-y-0">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <CardTitle className="text-destructive text-lg">
                    An Error Occurred
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-destructive/80">{error}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Powered by AI. Designed for creatives.</p>
      </footer>
    </div>
  );
}
