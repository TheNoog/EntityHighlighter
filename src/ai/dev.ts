import { config } from 'dotenv';
config();

import '@/ai/flows/filter-low-confidence-entities.ts';
import '@/ai/flows/extract-entities.ts';