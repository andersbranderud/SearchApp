describe('Search App - Authentication (Mocked)', () => {
  beforeEach(() => {
    // Clear local storage before each test
    cy.clearLocalStorage();
  });

  it('should redirect to login when not authenticated', () => {
    cy.visit('/');
    cy.url().should('include', '/login');
  });

  it('should show validation errors on registration', () => {
    cy.visit('/register');
    
    // Try to submit with short username
    cy.get('#username').type('ab');
    cy.get('#email').type('test@example.com');
    cy.get('#password').type('password123');
    cy.get('#confirmPassword').type('password123');
    cy.get('button[type="submit"]').click();
    
    cy.get('.error-message').should('contain', 'at least 3 characters');
  });
});

describe('Search App - Search Functionality (Mocked)', () => {
  beforeEach(() => {
    // Register and login with real API before each test
    cy.clearLocalStorage();
    const username = `searchtest_${Date.now()}`;
    const email = `search_${Date.now()}@example.com`;
    
    cy.visit('/register');
    cy.get('#username').type(username);
    cy.get('#email').type(email);
    cy.get('#password').type('password123');
    cy.get('#confirmPassword').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Wait for redirect to search page
    cy.url().should('eq', Cypress.config().baseUrl + '/search');
    
    // Now setup mocks for search functionality
    cy.mockApiCalls();
    cy.wait('@getEngines');
  });

  it('should load the search page with all required elements', () => {
    cy.get('[data-testid="search-form"]').should('be.visible');
    cy.get('[data-testid="search-input"]').should('be.visible');
    cy.get('[data-testid="engines-container"]').should('be.visible');
    cy.get('[data-testid="search-button"]').should('be.visible').and('contain', 'Search');
    cy.contains('Multi-Engine Search').should('be.visible');
    cy.get('.logout-button').should('be.visible');
  });

  it('should load available search engines from mock', () => {
    cy.get('[data-testid="engine-google"]').should('exist');
    cy.get('[data-testid="engine-bing"]').should('exist');
    cy.get('[data-testid="engine-yahoo"]').should('exist');
    cy.get('[data-testid="engine-duckduckgo"]').should('exist');
    cy.get('[data-testid="engine-baidu"]').should('exist');
    cy.get('[data-testid="engine-yandex"]').should('exist');
  });

  it('should have all engines selected by default', () => {
    cy.get('[data-testid="engine-google"]').should('be.checked');
    cy.get('[data-testid="engine-bing"]').should('be.checked');
    cy.get('[data-testid="engine-yahoo"]').should('be.checked');
    cy.get('[data-testid="engine-duckduckgo"]').should('be.checked');
    cy.get('[data-testid="engine-baidu"]').should('be.checked');
    cy.get('[data-testid="engine-yandex"]').should('be.checked');
  });

  it('should allow toggling search engines', () => {
    // Uncheck Google
    cy.get('[data-testid="engine-google"]').uncheck();
    cy.get('[data-testid="engine-google"]').should('not.be.checked');
    
    // Check it again
    cy.get('[data-testid="engine-google"]').check();
    cy.get('[data-testid="engine-google"]').should('be.checked');
  });

  it('should show error when submitting empty search', () => {
    cy.get('[data-testid="search-button"]').click();
    cy.get('[data-testid="error-message"]').should('be.visible').and('contain', 'Please enter a search query');
  });

  it('should show error when no search engine is selected', () => {
    // Enter query
    cy.get('[data-testid="search-input"]').type('test query');
    
    // Uncheck all engines
    cy.get('[data-testid="engine-google"]').uncheck();
    cy.get('[data-testid="engine-bing"]').uncheck();
    cy.get('[data-testid="engine-yahoo"]').uncheck();
    cy.get('[data-testid="engine-duckduckgo"]').uncheck();
    cy.get('[data-testid="engine-baidu"]').uncheck();
    cy.get('[data-testid="engine-yandex"]').uncheck();
    
    cy.get('[data-testid="search-button"]').click();
    cy.get('[data-testid="error-message"]').should('be.visible').and('contain', 'Please select at least one search engine');
  });

  it('should perform search with mocked results', () => {
    // Enter search query with multiple words
    cy.get('[data-testid="search-input"]').type('Hello world');
    
    // Submit form
    cy.get('[data-testid="search-button"]').click();
    
    // Wait for mock search API call
    cy.wait('@search');
    
    // Verify results are displayed (with mock data, should be fast)
    cy.get('[data-testid="search-results"]', { timeout: 5000 }).should('be.visible');
    
    // Verify results for engines are displayed
    cy.get('[data-testid="results-google"]').should('be.visible');
    cy.get('[data-testid="results-bing"]').should('be.visible');
    
    // Verify that counts are displayed
    cy.get('.count-value').should('have.length.greaterThan', 0);
  });

  it('should perform search with only selected engines', () => {
    // Uncheck most engines, leave only Google and Bing
    cy.get('[data-testid="engine-yahoo"]').uncheck();
    cy.get('[data-testid="engine-duckduckgo"]').uncheck();
    cy.get('[data-testid="engine-baidu"]').uncheck();
    cy.get('[data-testid="engine-yandex"]').uncheck();
    
    cy.get('[data-testid="search-input"]').type('Test query');
    cy.get('[data-testid="search-button"]').click();
    
    cy.wait('@search').then((interception) => {
      // Verify only Google and Bing were included in the request
      expect(interception.request.body.searchEngines).to.have.length(2);
      expect(interception.request.body.searchEngines).to.include('Google');
      expect(interception.request.body.searchEngines).to.include('Bing');
    });
    
    cy.get('[data-testid="search-results"]').should('be.visible');
    cy.get('[data-testid="results-google"]').should('be.visible');
    cy.get('[data-testid="results-bing"]').should('be.visible');
  });

  it('should display deterministic mock results', () => {
    // Mock data should return consistent results for the same query
    cy.get('[data-testid="search-input"]').type('cypress test');
    cy.get('[data-testid="search-button"]').click();
    
    cy.wait('@search');
    cy.get('[data-testid="search-results"]').should('be.visible');
    
    // Verify that results contain numbers (mock data returns deterministic values)
    cy.get('.count-value').first().invoke('text').should('match', /\d+/);
  });

  it('should logout successfully from search page', () => {
    cy.get('.logout-button').click();
    cy.url().should('include', '/login');
    
    // Try to visit search page, should redirect to login
    cy.visit('/search');
    cy.url().should('include', '/login');
  });
});

export {};
