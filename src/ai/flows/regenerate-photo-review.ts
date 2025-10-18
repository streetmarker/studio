'use server';

/**
 * @fileOverview This file contains the Genkit flow for regenerating a photo review.
 *
 * It allows users to regenerate the review with a different focus or improved analysis.
 * Exports:
 * - `regeneratePhotoReview`: Function to trigger the photo review regeneration flow.
 * - `RegeneratePhotoReviewInput`: Input type for the regeneratePhotoReview function.
 * - `RegeneratePhotoReviewOutput`: Output type for the regeneratePhotoReview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GeneratePhotoReviewOutput as RegeneratePhotoReviewOutput } from './generate-photo-review';

const RegeneratePhotoReviewInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to be reviewed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  originalReview: z.string().describe('The original review text, in JSON format.'),
  focus: z
    .string()
    .optional()
    .describe(
      'Optional focus for the regenerated review (e.g., lighting, composition).'
    ),
});

export type RegeneratePhotoReviewInput = z.infer<
  typeof RegeneratePhotoReviewInputSchema
>;
export type { RegeneratePhotoReviewOutput };


export async function regeneratePhotoReview(
  input: RegeneratePhotoReviewInput
): Promise<RegeneratePhotoReviewOutput> {
  return regeneratePhotoReviewFlow(input);
}

const regeneratePhotoReviewPrompt = ai.definePrompt({
  name: 'regeneratePhotoReviewPrompt',
  input: {schema: RegeneratePhotoReviewInputSchema},
  output: {schema: z.object({
    overall: z.string().describe('An overall summary of the photo in two sentences.'),
    lighting: z.string().describe('A two-sentence analysis of the photo\'s lighting.'),
    colors: z.string().describe('A two-sentence evaluation of the photo\'s colors.'),
    perspective: z.string().describe('A two-sentence assessment of the photo\'s perspective.'),
    composition: z.string().describe('A two-sentence critique of the photo\'s composition.'),
    rating: z.number().int().min(1).max(10).describe('A rating of the photo on a scale of 1 to 10.'),
  })},
  prompt: `You are a professional photography critic. Based on the provided photo and the original review, regenerate the review with a different focus or improved analysis. For each section, write exactly two sentences.

Original Review (JSON): {{{originalReview}}}

{{#if focus}}
Focus the new review on: {{{focus}}}
{{/if}}

Photo: {{media url=photoDataUri}}

Regenerate the structured review.`,
});

const regeneratePhotoReviewFlow = ai.defineFlow(
  {
    name: 'regeneratePhotoReviewFlow',
    inputSchema: RegeneratePhotoReviewInputSchema,
    outputSchema: z.object({
      overall: z.string(),
      lighting: z.string(),
      colors: z.string(),
      perspective: z.string(),
      composition: z.string(),
      rating: z.number(),
    }),
  },
  async input => {
    const {output} = await regeneratePhotoReviewPrompt(input);
    return output!;
  }
);
