export const MACRO_COLORS = {
  protein: '#8b5cf6', // Purple
  carbs: '#f15359',   // Red
  fat: '#feb111',     // Yellow
  water: '#2196f3',   // Blue
  fiber: '#10b981',   // Green
} as const;

export type MacroType = keyof typeof MACRO_COLORS;
