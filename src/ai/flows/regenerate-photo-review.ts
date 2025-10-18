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

const RegeneratePhotoReviewInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to be reviewed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  originalReview: z.string().describe('The original review text.'),
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

const RegeneratePhotoReviewOutputSchema = z.object({
  regeneratedReview: z.string().describe('The regenerated review of the photo.'),
});

export type RegeneratePhotoReviewOutput = z.infer<
  typeof RegeneratePhotoReviewOutputSchema
>;

export async function regeneratePhotoReview(
  input: RegeneratePhotoReviewInput
): Promise<RegeneratePhotoReviewOutput> {
  return regeneratePhotoReviewFlow(input);
}

const regeneratePhotoReviewPrompt = ai.definePrompt({
  name: 'regeneratePhotoReviewPrompt',
  input: {schema: RegeneratePhotoReviewInputSchema},
  output: {schema: RegeneratePhotoReviewOutputSchema},
  prompt: `You are a professional photography critic. Based on the provided photo and the original review, regenerate the review with a different focus or improved analysis.

Original Review: {{{originalReview}}}

{% if focus %}
Focus the review on: {{{focus}}}
{% endif %}

Photo: {{media url=photoDataUri}}

Regenerated Review:`,
});

const regeneratePhotoReviewFlow = ai.defineFlow(
  {
    name: 'regeneratePhotoReviewFlow',
    inputSchema: RegeneratePhotoReviewInputSchema,
    outputSchema: RegeneratePhotoReviewOutputSchema,
  },
  async input => {
    const {output} = await regeneratePhotoReviewPrompt(input);
    return {
      regeneratedReview: output!.regeneratedReview,
    };
  }
);
