'use server';

import { GeneratePhotoReviewOutput, generatePhotoReview } from '@/ai/flows/generate-photo-review';
import { regeneratePhotoReview } from '@/ai/flows/regenerate-photo-review';
import { z } from 'zod';

const photoSchema = z.string().startsWith('data:image/', { message: "Invalid image format."});

export async function getReview(photoDataUri: string): Promise<{ success: boolean; review?: GeneratePhotoReviewOutput; error?: string; }> {
  try {
    const validatedPhoto = photoSchema.parse(photoDataUri);
    const result = await generatePhotoReview({ photoDataUri: validatedPhoto });
    return { success: true, review: result };
  } catch (error) {
    console.error('Error generating review:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Failed to generate review. The AI model may be unavailable.' };
  }
}

export async function getNewReview(photoDataUri: string, originalReview: string): Promise<{ success: boolean; review?: GeneratePhotoReviewOutput; error?: string; }> {
  try {
    const validatedPhoto = photoSchema.parse(photoDataUri);
    const result = await regeneratePhotoReview({ photoDataUri: validatedPhoto, originalReview });
    return { success: true, review: result };
  } catch (error) {
    console.error('Error regenerating review:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Failed to regenerate review. The AI model may be unavailable.' };
  }
}
