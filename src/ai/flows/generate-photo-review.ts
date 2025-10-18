'use server';

/**
 * @fileOverview An AI agent that generates a review of a photo based on its lighting, colors, perspective, and overall composition.
 *
 * - generatePhotoReview - A function that generates the photo review.
 * - GeneratePhotoReviewInput - The input type for the generatePhotoReview function.
 * - GeneratePhotoReviewOutput - The return type for the generatePhotoReview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePhotoReviewInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to be reviewed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GeneratePhotoReviewInput = z.infer<typeof GeneratePhotoReviewInputSchema>;

const GeneratePhotoReviewOutputSchema = z.object({
  overall: z.string().describe('An overall summary of the photo in two sentences.'),
  lighting: z.string().describe('A two-sentence analysis of the photo\'s lighting.'),
  colors: z.string().describe('A two-sentence evaluation of the photo\'s colors.'),
  perspective: z.string().describe('A two-sentence assessment of the photo\'s perspective.'),
  composition: z.string().describe('A two-sentence critique of the photo\'s composition.'),
  rating: z.number().int().min(1).max(10).describe('A rating of the photo on a scale of 1 to 10.'),
});
export type GeneratePhotoReviewOutput = z.infer<typeof GeneratePhotoReviewOutputSchema>;

export async function generatePhotoReview(input: GeneratePhotoReviewInput): Promise<GeneratePhotoReviewOutput> {
  return generatePhotoReviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePhotoReviewPrompt',
  input: {schema: GeneratePhotoReviewInputSchema},
  output: {schema: GeneratePhotoReviewOutputSchema},
  prompt: `You are a professional photographer and art critic. You are reviewing the provided photo and will provide a detailed, structured critique. For each section, write exactly two sentences.

- Overall: Provide a two-sentence overall summary of the photo.
- Lighting: Provide a two-sentence analysis of the use of light. Is it natural or artificial? How does it affect the mood?
- Colors: Provide a two-sentence evaluation of the color palette. Are the colors vibrant or muted? Do they evoke specific emotions?
- Perspective: Provide a two-sentence assessment of the perspective. Is it a wide-angle shot, a close-up? How does it affect the viewer?
- Composition: Provide a two-sentence critique of how all elements come together. Is the composition balanced and visually appealing?
- Rating: Provide a rating for the photo from 1 to 10.

Photo: {{media url=photoDataUri}}`,
});

const generatePhotoReviewFlow = ai.defineFlow(
  {
    name: 'generatePhotoReviewFlow',
    inputSchema: GeneratePhotoReviewInputSchema,
    outputSchema: GeneratePhotoReviewOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
