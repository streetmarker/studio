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
  review: z.string().describe('A detailed review of the photo, covering aspects like lighting, colors, and perspective.'),
});
export type GeneratePhotoReviewOutput = z.infer<typeof GeneratePhotoReviewOutputSchema>;

export async function generatePhotoReview(input: GeneratePhotoReviewInput): Promise<GeneratePhotoReviewOutput> {
  return generatePhotoReviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePhotoReviewPrompt',
  input: {schema: GeneratePhotoReviewInputSchema},
  output: {schema: GeneratePhotoReviewOutputSchema},
  prompt: `You are a professional photographer and art critic. You are reviewing the provided photo and will provide a detailed critique covering the following aspects:\n\n- Lighting: Analyze the use of light in the photo. Is it natural or artificial? Is it effective in highlighting the subject and creating mood?\n- Colors: Evaluate the color palette of the photo. Are the colors vibrant or muted? Do they complement each other, and do they evoke specific emotions?\n- Perspective: Assess the photographer's use of perspective. Is it a wide-angle shot, a close-up, or something in between? How does the perspective affect the viewer's experience?\n- Overall Composition: Consider how all the elements in the photo come together to form a cohesive image. Is the composition balanced and visually appealing?\n\nWrite a detailed review based on your analysis. Be constructive and provide specific feedback.
\nPhoto: {{media url=photoDataUri}}`,
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
