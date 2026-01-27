describe('Search App - Authentication', () => {
  beforeEach(() => {
    // Clear local storage before each test
    cy.clearLocalStorage();
  });

  it('should redirect to login when not authenticated', () => {
    cy.visit('/');
    cy.url().should('include', '/login');
  });

  it('should register a new user', () => {
    cy.visit('/register');
    
    const username = `testuser_${Date.now()}`;
    const email = `test_${Date.now()}@example.com`;
    
    cy.get('#username').type(username);
    cy.get('#email').type(email);
    cy.get('#password').type('password123');
    cy.get('#confirmPassword').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Should redirect to search page after successful registration
    cy.url().should('eq', Cypress.config().baseUrl + '/search');
    
    // Should show user info
    cy.contains(`Welcome, ${username}!`).should('be.visible');
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

  it('should login with existing credentials', () => {
    // First register a user
    const username = `logintest_${Date.now()}`;
    const email = `login_${Date.now()}@example.com`;
    const password = 'password123';
    
    cy.visit('/register');
    cy.get('#username').type(username);
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('#confirmPassword').type(password);
    cy.get('button[type="submit"]').click();
    
    // Wait for redirect to search page
    cy.url().should('eq', Cypress.config().baseUrl + '/search');
    
    // Logout
    cy.get('.logout-button').click();
    cy.url().should('include', '/login');
    
    // Login again
    cy.get('#emailOrUsername').type(username);
    cy.get('#password').type(password);
    cy.get('button[type="submit"]').click();
    
    // Should redirect to search page
    cy.url().should('eq', Cypress.config().baseUrl + '/search');
    cy.contains(`Welcome, ${username}!`).should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    cy.visit('/login');
    
    cy.get('#emailOrUsername').type('nonexistent@example.com');
    cy.get('#password').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    cy.get('.error-message').should('contain', 'Invalid credentials');
  });
});

describe('Search App - Search Functionality', () => {
  beforeEach(() => {
    // Register and login before each test
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
  });

  it('should load the search page with all required elements', () => {
    cy.get('[data-testid="search-form"]').should('be.visible');
    cy.get('[data-testid="search-input"]').should('be.visible');
    cy.get('[data-testid="engines-container"]').should('be.visible');
    cy.get('[data-testid="search-button"]').should('be.visible').and('contain', 'Search');
    cy.contains('Multi-Engine Search').should('be.visible');
    cy.get('.logout-button').should('be.visible');
  });

  it('should load available search engines', () => {
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
    cy.get('[data-testid="engine-yelp"]').uncheck();
    cy.get('[data-testid="engine-duckduckgo"]').uncheck();
    
    cy.get('[data-testid="search-button"]').click();
    cy.get('[data-testid="error-message"]').should('be.visible').and('contain', 'Please select at least one search engine');
  });

  it('should perform search and display results', () => {
    // Enter search query with multiple words
    cy.get('[data-testid="search-input"]').type('Hello world');
    
    // Submit form
    cy.get('[data-testid="search-button"]').click();
    
    // Wait for results (this will make actual API calls to SerpAPI)
    cy.get('[data-testid="search-results"]', { timeout: 30000 }).should('be.visible');
    
    // Verify results for some engines are displayed (not all to keep test fast)
    cy.get('[data-testid="results-google"]').should('be.visible');
    cy.get('[data-testid="results-bing"]').should('be.visible');
    
    // Verify that counts are displayed
    cy.get('.count-value').should('have.length.greaterThan', 0);
  });

  it('should logout successfully', () => {
    cy.get('.logout-button').click();
    cy.url().should('include', '/login');
    
    // Try to visit home page, should redirect to login
    cy.visit('/');
    cy.url().should('include', '/login');
  });
});

export {};
