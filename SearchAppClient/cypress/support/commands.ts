// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import { createMockSearchResults, mockSearchEngines, mockAuthResponse } from './mockData';

declare global {
  namespace Cypress {
    interface Chainable {
      mockApiCalls(): Chainable<void>;
      loginWithMock(username: string, password: string): Chainable<void>;
    }
  }
}

// Custom command to setup all API mocks for search-related calls only
Cypress.Commands.add('mockApiCalls', () => {
  // Mock the available engines endpoint
  cy.intercept('GET', '**/api/search/engines', {
    statusCode: 200,
    body: mockSearchEngines
  }).as('getEngines');

  // Mock the search endpoint
  cy.intercept('POST', '**/api/search', (req) => {
    const { query, searchEngines } = req.body;
    const mockResults = createMockSearchResults(query, searchEngines);
    
    req.reply({
      statusCode: 200,
      body: mockResults,
      delay: 500 // Simulate network delay
    });
  }).as('search');
});

// Custom command for logging in - uses real API for auth, mocks for search
Cypress.Commands.add('loginWithMock', (username: string, password: string) => {
  cy.visit('/login');
  cy.get('#emailOrUsername').type(username);
  cy.get('#password').type(password);
  cy.get('button[type="submit"]').click();
  // Wait for navigation to search page
  cy.url().should('include', '/search');
  // Setup mocks after login
  cy.mockApiCalls();
});

export {};
