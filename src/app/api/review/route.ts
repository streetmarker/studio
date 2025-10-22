import {
  generatePhotoReview,
  GeneratePhotoReviewInput,
} from '@/ai/flows/generate-photo-review';
import {
  regeneratePhotoReview,
  RegeneratePhotoReviewInput,
} from '@/ai/flows/regenerate-photo-review';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const photoSchema = z.string().startsWith('data:image/', { message: 'Invalid image format.' });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { photoDataUri, originalReview } = body;

    const validatedPhoto = photoSchema.parse(photoDataUri);

    if (originalReview) {
      // Handle regeneration
      const input: RegeneratePhotoReviewInput = {
        photoDataUri: validatedPhoto,
        originalReview,
      };
      const review = await regeneratePhotoReview(input);
      return NextResponse.json({ success: true, review });
    } else {
      // Handle new review generation
      const input: GeneratePhotoReviewInput = { photoDataUri: validatedPhoto };
      const review = await generatePhotoReview(input);
      return NextResponse.json({ success: true, review });
    }
  } catch (error: any) {
    console.error('Error in /api/review:', error);
    let errorMessage = 'An unknown error occurred.';
    if (error instanceof z.ZodError) {
      errorMessage = error.errors[0].message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
