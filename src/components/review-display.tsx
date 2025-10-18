'use client';

import Image from 'next/image';
import { RefreshCw, Save, LoaderCircle, UploadCloud, Star, LogIn } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { GeneratePhotoReviewOutput } from '@/ai/flows/generate-photo-review';
import Link from 'next/link';

interface ReviewDisplayProps {
  photoDataUrl: string;
  review: GeneratePhotoReviewOutput | null;
  isLoading: boolean;
  onRegenerate: () => void;
  onSave: () => void;
  onClear: () => void;
  isLoggedIn: boolean;
  isSaving: boolean;
}

const ReviewSection = ({ title, content }: { title: string; content: string }) => (
  <div>
    <h3 className="font-bold">{title}</h3>
    <p>{content}</p>
  </div>
);

export function ReviewDisplay({
  photoDataUrl,
  review,
  isLoading,
  onRegenerate,
  onSave,
  onClear,
  isLoggedIn,
  isSaving,
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
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : review ? (
              <div className="space-y-4 leading-relaxed text-foreground/90">
                <ReviewSection title="Overall" content={review.overall} />
                <ReviewSection title="Lighting" content={review.lighting} />
                <ReviewSection title="Colors" content={review.colors} />
                <ReviewSection title="Perspective" content={review.perspective} />
                <ReviewSection title="Composition" content={review.composition} />
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">Rating:</h3>
                  <div className="flex">
                    {[...Array(10)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < review.rating
                            ? 'text-primary fill-primary'
                            : 'text-muted-foreground/50'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold">{review.rating}/10</span>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button onClick={onRegenerate} disabled={isLoading || !review} className="w-full sm:w-auto">
            {isLoading && review && isSaving ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <RefreshCw />
            )}
            Regenerate
          </Button>
          {isLoggedIn ? (
            <Button
              onClick={onSave}
              variant="secondary"
              disabled={isLoading || !review || isSaving}
              className="w-full sm:w-auto"
            >
              {isSaving ? <LoaderCircle className="animate-spin" /> : <Save />}
              Save to Profile
            </Button>
          ) : (
            <Button asChild variant="secondary" className="w-full sm:w-auto" disabled={!review}>
              <Link href="/login">
                <LogIn />
                Login to Save
              </Link>
            </Button>
          )}
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
