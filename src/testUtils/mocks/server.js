import { setupServer } from "msw/node";
import { handlers, resetMockDatabase, seedMockDatabase } from "./handlers";

/**
 * MSW server for intercepting network requests in tests
 */
export const server = setupServer(...handlers);

/**
 * Setup function to be called in test setup
 * Typically called in setupTests.js or beforeAll
 */
export const setupMockServer = () => {
  // Start server before all tests
  beforeAll(() => {
    server.listen({ onUnhandledRequest: "warn" });
  });

  // Reset handlers and database after each test
  afterEach(() => {
    server.resetHandlers();
    resetMockDatabase();
  });

  // Clean up after all tests
  afterAll(() => {
    server.close();
  });
};

/**
 * Helper to use specific handlers for a test
 * @param  {...any} customHandlers - MSW handlers to use
 */
export const useHandlers = (...customHandlers) => {
  server.use(...customHandlers);
};

/**
 * Helper to seed database for a specific test
 * @param {Object} data - Data to seed
 */
export const withMockData = (data) => {
  seedMockDatabase(data);
};

// Re-export utilities
export { resetMockDatabase, seedMockDatabase } from "./handlers";
export { handlers } from "./handlers";
