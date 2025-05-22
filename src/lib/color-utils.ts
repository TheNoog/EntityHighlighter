// A list of pleasant pastel colors
const PASTEL_COLORS: string[] = [
  '#FFB3BA', // Light Pink
  '#FFDFBA', // Light Peach
  '#FFFFBA', // Light Yellow
  '#BAFFC9', // Light Mint
  '#BAE1FF', // Light Blue
  '#E0BBE4', // Light Lavender
  '#FFDAC1', // Light Apricot
  '#BEE7E8', // Light Aqua
  '#FFC8DD', // Pastel Pink
  '#D3E8D3', // Pastel Green
  '#FCE8B2', // Pastel Gold
  '#C7CEEA', // Periwinkle
];

let colorIndex = 0;
const categoryColorMap = new Map<string, string>();

/**
 * Gets a consistent pastel color for a given entity category.
 * Cycles through a predefined list of pastel colors.
 * @param category The entity category string.
 * @returns A hex string representing the pastel color.
 */
export function getPastelColorForCategory(category: string): string {
  if (!categoryColorMap.has(category)) {
    categoryColorMap.set(category, PASTEL_COLORS[colorIndex % PASTEL_COLORS.length]);
    colorIndex++;
  }
  return categoryColorMap.get(category)!;
}

/**
 * Resets the color assignments. Useful if the context changes and you want to restart color mapping.
 */
export function resetCategoryColors(): void {
  colorIndex = 0;
  categoryColorMap.clear();
}
