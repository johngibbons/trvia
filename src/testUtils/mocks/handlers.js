import { http, HttpResponse } from "msw";

/**
 * MSW handlers for Firebase REST API mocking
 * These handlers intercept Firebase Realtime Database REST API calls
 */

// Base URL for Firebase REST API
const FIREBASE_BASE_URL = "https://*.firebaseio.com";

// In-memory database for tests
let mockDatabase = {};

/**
 * Reset the mock database
 */
export const resetMockDatabase = () => {
  mockDatabase = {};
};

/**
 * Seed the mock database with data
 * @param {Object} data - Data to seed
 */
export const seedMockDatabase = (data) => {
  mockDatabase = { ...mockDatabase, ...data };
};

/**
 * Get data from a path in the mock database
 * @param {string} path - Database path
 * @returns {*} Data at path or null
 */
const getDataAtPath = (path) => {
  const parts = path.split("/").filter(Boolean);
  let current = mockDatabase;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return null;
    }
  }

  return current;
};

/**
 * Set data at a path in the mock database
 * @param {string} path - Database path
 * @param {*} value - Value to set
 */
const setDataAtPath = (path, value) => {
  const parts = path.split("/").filter(Boolean);
  let current = mockDatabase;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current)) {
      current[part] = {};
    }
    current = current[part];
  }

  const lastPart = parts[parts.length - 1];
  if (lastPart) {
    current[lastPart] = value;
  }
};

/**
 * Default MSW handlers for Firebase REST API
 */
export const handlers = [
  // GET request - read data
  http.get(/https:\/\/.*\.firebaseio\.com\/(.*)\.json/, ({ request, params }) => {
    const path = params[0] || "";
    const data = getDataAtPath(path);
    return HttpResponse.json(data);
  }),

  // PUT request - write data
  http.put(/https:\/\/.*\.firebaseio\.com\/(.*)\.json/, async ({ request, params }) => {
    const path = params[0] || "";
    const body = await request.json();
    setDataAtPath(path, body);
    return HttpResponse.json(body);
  }),

  // PATCH request - update data
  http.patch(/https:\/\/.*\.firebaseio\.com\/(.*)\.json/, async ({ request, params }) => {
    const path = params[0] || "";
    const body = await request.json();
    const existing = getDataAtPath(path) || {};
    const merged = { ...existing, ...body };
    setDataAtPath(path, merged);
    return HttpResponse.json(merged);
  }),

  // POST request - push new data
  http.post(/https:\/\/.*\.firebaseio\.com\/(.*)\.json/, async ({ request, params }) => {
    const path = params[0] || "";
    const body = await request.json();
    const newKey = `-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setDataAtPath(`${path}/${newKey}`, body);
    return HttpResponse.json({ name: newKey });
  }),

  // DELETE request - remove data
  http.delete(/https:\/\/.*\.firebaseio\.com\/(.*)\.json/, ({ params }) => {
    const path = params[0] || "";
    setDataAtPath(path, null);
    return HttpResponse.json(null);
  }),
];

/**
 * Create handlers with custom responses
 * @param {Object} customResponses - Map of paths to response data
 * @returns {Array} MSW handlers
 */
export const createCustomHandlers = (customResponses = {}) => {
  return Object.entries(customResponses).map(([path, response]) =>
    http.get(new RegExp(`https://.*\\.firebaseio\\.com/${path}\\.json`), () => {
      return HttpResponse.json(response);
    })
  );
};

/**
 * Handler that simulates Firebase errors
 * @param {string} path - Path to error on
 * @param {number} status - HTTP status code
 * @param {string} message - Error message
 * @returns {Object} MSW handler
 */
export const createErrorHandler = (path, status = 500, message = "Internal Server Error") => {
  return http.get(new RegExp(`https://.*\\.firebaseio\\.com/${path}\\.json`), () => {
    return HttpResponse.json({ error: message }, { status });
  });
};

/**
 * Handler that simulates network delay
 * @param {string} path - Path to delay
 * @param {number} delay - Delay in milliseconds
 * @param {*} response - Response data
 * @returns {Object} MSW handler
 */
export const createDelayedHandler = (path, delay, response) => {
  return http.get(new RegExp(`https://.*\\.firebaseio\\.com/${path}\\.json`), async () => {
    await new Promise((resolve) => setTimeout(resolve, delay));
    return HttpResponse.json(response);
  });
};

export default handlers;
