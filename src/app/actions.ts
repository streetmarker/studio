'use server';

import {
  GeneratePhotoReviewOutput,
  generatePhotoReview,
} from '@/ai/flows/generate-photo-review';
import { regeneratePhotoReview } from '@/ai/flows/regenerate-photo-review';
import { getFirebaseAdmin } from '@/firebase/server';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { headers } from 'next/headers';

const photoSchema = z.string().startsWith('data:image/', { message: 'Invalid image format.' });

export async function getReview(
  photoDataUri: string
): Promise<{ success: boolean; review?: GeneratePhotoReviewOutput; error?: string }> {
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

export async function getNewReview(
  photoDataUri: string,
  originalReview: string
): Promise<{ success: boolean; review?: GeneratePhotoReviewOutput; error?: string }> {
  try {
    const validatedPhoto = photoSchema.parse(photoDataUri);
    const result = await regeneratePhotoReview({ photoDataUri: validatedPhoto, originalReview });
    return { success: true, review: result };
  } catch (error) {
    console.error('Error regenerating review:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return {
      success: false,
      error: 'Failed to regenerate review. The AI model may be unavailable.',
    };
  }
}

const saveReviewSchema = z.object({
  photoUrl: photoSchema,
  reviewText: z.string(),
});

export async function saveReview(
  input: z.infer<typeof saveReviewSchema>
): Promise<{ success: boolean; error?: string; reviewId?: string }> {
  const { auth, firestore } = await getFirebaseAdmin();
  const headersList = headers();
  const token = headersList.get('Authorization')?.split('Bearer ')[1];

  if (!token) {
    return { success: false, error: 'Authentication required.' };
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const validatedInput = saveReviewSchema.parse(input);

    const reviewData = {
      userProfileId: userId,
      photoUrl: validatedInput.photoUrl,
      reviewText: validatedInput.reviewText,
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await firestore.collection('users').doc(userId).collection('photoReviews').add(reviewData);

    return { success: true, reviewId: docRef.id };
  } catch (error) {
    console.error('Error saving review:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map((e) => e.message).join(', ') };
    }
    if (error instanceof Error && (error.name === 'auth/id-token-expired' || error.name === 'auth/argument-error')) {
      return { success: false, error: 'Authentication failed. Please log in again.' };
    }
    return { success: false, error: 'An unknown error occurred while saving the review.' };
  }
}
