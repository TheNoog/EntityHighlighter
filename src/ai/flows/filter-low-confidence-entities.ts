'use server';

/**
 * @fileOverview Filters out entities with low confidence scores.
 *
 * - filterLowConfidenceEntities - A function that filters entities based on confidence score.
 * - FilterLowConfidenceEntitiesInput - The input type for the filterLowConfidenceEntities function.
 * - FilterLowConfidenceEntitiesOutput - The return type for the filterLowConfidenceEntities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FilterLowConfidenceEntitiesInputSchema = z.object({
  entities: z.array(
    z.object({
      text: z.string(),
      type: z.string(),
      confidence: z.number(),
    })
  ),
  confidenceThreshold: z.number().describe('The minimum confidence score for an entity to be included.'),
});
export type FilterLowConfidenceEntitiesInput = z.infer<typeof FilterLowConfidenceEntitiesInputSchema>;

const FilterLowConfidenceEntitiesOutputSchema = z.array(
  z.object({
    text: z.string(),
    type: z.string(),
    confidence: z.number(),
  })
);
export type FilterLowConfidenceEntitiesOutput = z.infer<typeof FilterLowConfidenceEntitiesOutputSchema>;

export async function filterLowConfidenceEntities(
  input: FilterLowConfidenceEntitiesInput
): Promise<FilterLowConfidenceEntitiesOutput> {
  return filterLowConfidenceEntitiesFlow(input);
}

const filterLowConfidenceEntitiesFlow = ai.defineFlow(
  {
    name: 'filterLowConfidenceEntitiesFlow',
    inputSchema: FilterLowConfidenceEntitiesInputSchema,
    outputSchema: FilterLowConfidenceEntitiesOutputSchema,
  },
  async input => {
    const filteredEntities = input.entities.filter(entity => entity.confidence >= input.confidenceThreshold);
    return filteredEntities;
  }
);
