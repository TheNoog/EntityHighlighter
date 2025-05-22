
"use client";

import { useState, useEffect } from 'react';
import { extractEntities, type ExtractEntitiesOutput } from '@/ai/flows/extract-entities';
import { filterLowConfidenceEntities, type FilterLowConfidenceEntitiesInput, type FilterLowConfidenceEntitiesOutput } from '@/ai/flows/filter-low-confidence-entities';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { HighlightedText } from '@/components/highlighted-text';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getPastelColorForCategory, resetCategoryColors } from '@/lib/color-utils';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export interface Entity {
  text: string;
  category: string;
  confidence: number;
}

const DEFAULT_CONFIDENCE_THRESHOLD = 0.5;

export default function EntityHighlighterPage() {
  const [inputText, setInputText] = useState<string>('');
  const [processedText, setProcessedText] = useState<string>('');
  const [entities, setEntities] = useState<Entity[]>([]);
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(DEFAULT_CONFIDENCE_THRESHOLD);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    // Reset colors when the component mounts or page reloads, for consistent demo experience
    resetCategoryColors();
  }, []);

  useEffect(() => {
    if (entities.length > 0) {
      const categories = new Set(entities.map(entity => entity.category));
      setUniqueCategories(Array.from(categories));
    } else {
      setUniqueCategories([]);
    }
  }, [entities]);

  const handleAnalyzeText = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter some text to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setEntities([]); // Clear previous entities
    setUniqueCategories([]); // Clear previous categories
    setProcessedText(inputText); // Set text to be highlighted
    resetCategoryColors(); // Reset colors for a new analysis

    try {
      // 1. Extract entities
      const rawEntitiesOutput = await extractEntities({ text: inputText });
      
      // Map 'category' to 'type' for the filter flow input
      const entitiesForFilter: FilterLowConfidenceEntitiesInput['entities'] = rawEntitiesOutput.map(e => ({
        text: e.text,
        type: e.category, // Map category to type
        confidence: e.confidence,
      }));

      // 2. Filter entities based on confidence
      const filteredEntitiesOutput = await filterLowConfidenceEntities({
        entities: entitiesForFilter,
        confidenceThreshold: confidenceThreshold,
      });

      // Map 'type' back to 'category' for internal use
      const finalEntities: Entity[] = filteredEntitiesOutput.map(e => ({
        text: e.text,
        category: e.type, // Map type back to category
        confidence: e.confidence,
      }));
      
      setEntities(finalEntities);

      if (finalEntities.length === 0) {
        toast({
          title: "No Entities Found",
          description: `No entities were found with confidence >= ${confidenceThreshold}. Try lowering the threshold.`,
        });
      } else {
         toast({
          title: "Analysis Complete",
          description: `${finalEntities.length} entities highlighted.`,
        });
      }

    } catch (error) {
      console.error("Error analyzing text:", error);
      toast({
        title: "Analysis Failed",
        description: "An error occurred while processing the text. Please try again.",
        variant: "destructive",
      });
      setEntities([]); // Clear entities on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">
          Entity Highlighter
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Paste your text below, and let AI identify and highlight named entities.
        </p>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Input</CardTitle>
          <CardDescription>Enter the text you want to analyze and set the confidence threshold.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid w-full gap-2">
            <Label htmlFor="text-input" className="font-semibold">Your Text</Label>
            <Textarea
              id="text-input"
              placeholder="Paste or type your text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={10}
              className="text-base"
              disabled={isLoading}
            />
          </div>
          <div className="grid w-full gap-2">
            <Label htmlFor="confidence-slider" className="font-semibold">
              Confidence Threshold: <span className="font-mono text-primary">{confidenceThreshold.toFixed(2)}</span>
            </Label>
            <Slider
              id="confidence-slider"
              defaultValue={[DEFAULT_CONFIDENCE_THRESHOLD]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={(value) => setConfidenceThreshold(value[0])}
              disabled={isLoading}
              aria-label="Confidence threshold slider"
            />
            <p className="text-xs text-muted-foreground">
              Only entities with confidence scores greater than or equal to this value will be highlighted.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAnalyzeText} disabled={isLoading} className="w-full sm:w-auto" size="lg">
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-5 w-5" />
            )}
            {isLoading ? 'Analyzing...' : 'Analyze Text & Highlight Entities'}
          </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Highlighted Entities</CardTitle>
          <CardDescription>
            {isLoading 
              ? "Processing your text to find entities..." 
              : entities.length > 0 
                ? "Entities are highlighted below with colors based on their category."
                : "Results will appear here after analysis." 
            }
          </CardDescription>
          {!isLoading && uniqueCategories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {uniqueCategories.map(category => (
                <Badge
                  key={category}
                  style={{ 
                    backgroundColor: getPastelColorForCategory(category),
                    color: 'var(--card-foreground)', // Ensure text is readable
                    border: '1px solid var(--border)',
                  }}
                  className="font-medium"
                >
                  {category}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2 py-10">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <p className="text-center text-muted-foreground mt-4">Identifying entities...</p>
            </div>
          ) : (
            <HighlightedText originalText={processedText} entities={entities} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
