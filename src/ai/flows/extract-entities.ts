// src/ai/flows/extract-entities.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for extracting named entities from a given text.
 *
 * - extractEntities: A function that takes text as input and returns a list of named entities with their categories.
 * - ExtractEntitiesInput: The input type for the extractEntities function.
 * - ExtractEntitiesOutput: The output type for the extractEntities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractEntitiesInputSchema = z.object({
  text: z.string().describe('The text to extract entities from.'),
});
export type ExtractEntitiesInput = z.infer<typeof ExtractEntitiesInputSchema>;

const EntitySchema = z.object({
  text: z.string().describe('The extracted entity text.'),
  category: z.string().describe('The category of the entity (e.g., PERSON, LOCATION, ORGANIZATION).'),
  confidence: z.number().describe('Confidence score of the entity extraction'),
});

const ExtractEntitiesOutputSchema = z.array(EntitySchema);
export type ExtractEntitiesOutput = z.infer<typeof ExtractEntitiesOutputSchema>;

export async function extractEntities(input: ExtractEntitiesInput): Promise<ExtractEntitiesOutput> {
  return extractEntitiesFlow(input);
}

const extractEntitiesPrompt = ai.definePrompt({
  name: 'extractEntitiesPrompt',
  input: {schema: ExtractEntitiesInputSchema},
  output: {schema: ExtractEntitiesOutputSchema},
  prompt: `You are an expert Named Entity Recognition (NER) system. Given a text, you will identify and categorize named entities within it. The categories should be standard NER categories such as PERSON, LOCATION, ORGANIZATION, etc.

Text: {{{text}}}

Return a JSON array of entities, each with the text of the entity and its category. Also, include a confidence score for the entity extraction. Return an empty array if no entities are found.
`,
});

const extractEntitiesFlow = ai.defineFlow(
  {
    name: 'extractEntitiesFlow',
    inputSchema: ExtractEntitiesInputSchema,
    outputSchema: ExtractEntitiesOutputSchema,
  },
  async input => {
    const {output} = await extractEntitiesPrompt(input);
    return output!;
  }
);
