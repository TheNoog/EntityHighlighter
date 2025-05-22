"use client";

import type { Entity } from './entity-highlighter-page'; // Assuming Entity type is exported
import { getPastelColorForCategory } from '@/lib/color-utils';

interface HighlightedTextProps {
  originalText: string;
  entities: Entity[];
}

interface TextPart {
  text: string;
  isEntity: boolean;
  category?: string;
}

export function HighlightedText({ originalText, entities }: HighlightedTextProps) {
  if (!originalText.trim()) {
    return <p className="text-muted-foreground italic">No text provided yet.</p>;
  }
  if (!entities || entities.length === 0) {
    return <p className="whitespace-pre-wrap leading-relaxed">{originalText}</p>;
  }

  let parts: TextPart[] = [{ text: originalText, isEntity: false }];

  // Sort entities by length (longest first) to handle cases where entities might be substrings of others.
  // Then, sort by first appearance to process in order of occurrence.
  // This is a simplified heuristic. True overlapping/nested entities need more advanced handling (offsets from NER).
  const sortedEntities = [...entities]
    .map(e => ({ ...e, firstIndex: originalText.indexOf(e.text) }))
    .filter(e => e.firstIndex !== -1) // Only consider entities found in text
    .sort((a, b) => {
      if (a.text.length !== b.text.length) {
        return b.text.length - a.text.length; // Longest first
      }
      return a.firstIndex - b.firstIndex; // Then by appearance order
    });


  sortedEntities.forEach(entity => {
    let newParts: TextPart[] = [];
    parts.forEach(part => {
      if (part.isEntity) {
        newParts.push(part);
        return;
      }
      
      // Escape entity text for RegExp
      const escapedEntityText = entity.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedEntityText, 'g');
      let lastIndex = 0;
      let match;

      // Split the current non-entity part by the current entity
      while ((match = regex.exec(part.text)) !== null) {
        // Add text before the entity
        if (match.index > lastIndex) {
          newParts.push({ text: part.text.substring(lastIndex, match.index), isEntity: false });
        }
        // Add the entity itself
        newParts.push({ text: entity.text, isEntity: true, category: entity.category });
        lastIndex = regex.lastIndex;
      }
      // Add any remaining text after the last match of the current entity
      if (lastIndex < part.text.length) {
        newParts.push({ text: part.text.substring(lastIndex), isEntity: false });
      }
    });
    parts = newParts;
  });

  return (
    <div className="p-4 border rounded-md bg-card shadow whitespace-pre-wrap leading-relaxed text-sm">
      {parts.map((part, index) =>
        part.isEntity && part.category ? (
          <span
            key={index}
            style={{
              backgroundColor: getPastelColorForCategory(part.category),
              padding: '0.2em 0.4em',
              margin: '0 0.1em',
              borderRadius: '0.3em',
              color: 'var(--card-foreground)', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              fontWeight: 500,
            }}
            title={`Category: ${part.category}`}
          >
            {part.text}
          </span>
        ) : (
          <span key={index}>{part.text}</span>
        )
      )}
    </div>
  );
}
