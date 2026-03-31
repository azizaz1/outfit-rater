export interface OutfitRating {
  id?: string;
  photoUri: string;
  score: number;
  styleCategory: string;
  colorScore: number;
  fitScore: number;
  occasionFit: string;
  strengths: string[];
  improvements: string[];
  celebrityMatch?: string;
  shoppingSuggestions?: { item: string; reason: string }[];
  weatherTip?: string;
  createdAt?: string;
}

export interface ApiResponse {
  success: boolean;
  data?: OutfitRating;
  error?: string;
}
