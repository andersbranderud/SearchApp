export interface SearchResult {
  query: string;
  searchEngines: string[];
  engineTotals: Record<string, number>;
}
