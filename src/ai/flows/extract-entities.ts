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
  category: z.string().describe('The category of the entity (e.g., PERSON, LOCATION, ORGANIZATION, PRODUCT, EVENT, DATE, MONEY, PERCENT, FACILITY, LANGUAGE, WORK_OF_ART, LAW, QUANTITY, ORDINAL, CARDINAL).'),
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
  prompt: `You are an expert Named Entity Recognition (NER) system. Given a text, you will identify and categorize named entities within it.
Focus on identifying various types of entities, including common nouns that represent specific concepts or items.
Aim to identify at least 5 distinct entity categories if the text content allows.

Standard NER categories include, but are not limited to:
- PERSON (e.g., individuals' names)
- LOCATION (e.g., cities, countries, landmarks)
- ORGANIZATION (e.g., companies, institutions)
- PRODUCT (e.g., brand names, specific items)
- EVENT (e.g., conferences, festivals, historical events)
- DATE (e.g., specific dates, date ranges)
- TIME (e.g., specific times)
- MONEY (e.g., monetary values)
- PERCENT (e.g., percentages)
- FACILITY (e.g., buildings, airports, highways)
- LANGUAGE (e.g., English, Spanish)
- WORK_OF_ART (e.g., book titles, song titles, paintings)
- LAW (e.g., names of laws or legal documents)
- QUANTITY (e.g., measurements, counts)
- ORDINAL (e.g., first, second)
- CARDINAL (e.g., one, two, three, numbers not covered by other categories)
- MISC (Miscellaneous entities that don't fit other categories but are still relevant named entities)

Text: {{{text}}}

Return a JSON array of entities, each with the text of the entity, its category, and a confidence score for the extraction.
Ensure the confidence score is a number between 0.0 and 1.0.
Return an empty array if no entities are found.
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

