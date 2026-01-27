export interface SearchRequest {
  query: string;
  searchEngines: string[];
}

export interface SearchResult {
  query: string;
  searchEngines: string[];
  engineTotals: Record<string, number>;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
}
