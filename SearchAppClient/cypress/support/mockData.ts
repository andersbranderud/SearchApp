// Mock data for testing

export const mockSearchEngines = ['Google', 'Bing', 'Yahoo', 'DuckDuckGo', 'Baidu', 'Yandex'];

export const createMockSearchResults = (query: string, engines: string[]) => {
  const words = query.split(' ').filter(word => word.length > 0);
  const engineTotals: { [key: string]: number } = {};

  engines.forEach((engine) => {
    const engineKey = engine.toLowerCase();
    const baseMultipliers: { [key: string]: number } = {
      'google': 1000000,
      'bing': 750000,
      'yahoo': 500000,
      'duckduckgo': 250000,
      'baidu': 800000,
      'yandex': 600000
    };

    let totalCount = 0;
    words.forEach((word) => {
      // Generate deterministic results based on word
      const baseCount = baseMultipliers[engineKey] || 500000;
      const wordHash = Math.abs(word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
      const variation = wordHash % 100000;
      totalCount += baseCount + variation;
    });

    engineTotals[engine] = totalCount;
  });

  return {
    query,
    searchEngines: engines,
    engineTotals
  };
};

export const mockUserCredentials = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
};

export const mockAuthResponse = {
  token: 'mock-jwt-token-12345',
  username: 'testuser',
  expiresAt: new Date(Date.now() + 3600000).toISOString()
};
