// Polyfills for Firebase compatibility (must be before any imports)
import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// ReadableStream polyfill
const { ReadableStream, TransformStream } = require("stream/web");
global.ReadableStream = ReadableStream;
global.TransformStream = TransformStream;

// Jest DOM matchers
import "@testing-library/jest-dom";

// Mock Firebase auth module (before firebaseSetup import)
jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn((auth, callback) => {
    return jest.fn(); // Return unsubscribe function
  }),
  signOut: jest.fn().mockResolvedValue(undefined),
  getAuth: jest.fn().mockReturnValue({
    onAuthStateChanged: jest.fn(),
    signOut: jest.fn().mockResolvedValue(undefined),
    currentUser: null,
  }),
  GoogleAuthProvider: jest.fn(),
  EmailAuthProvider: jest.fn(),
}));

// Mock Firebase database module
jest.mock("firebase/database", () => ({
  getDatabase: jest.fn().mockReturnValue({}),
  ref: jest.fn().mockReturnValue({}),
  set: jest.fn().mockResolvedValue(undefined),
  update: jest.fn().mockResolvedValue(undefined),
  get: jest.fn().mockResolvedValue({ val: () => null }),
  onValue: jest.fn(),
  off: jest.fn(),
  push: jest.fn().mockReturnValue({ key: "mock-key" }),
  remove: jest.fn().mockResolvedValue(undefined),
  query: jest.fn((...args) => ({ _query: args })),
  orderByChild: jest.fn((child) => ({ _orderByChild: child })),
  equalTo: jest.fn((value) => ({ _equalTo: value })),
}));

// Mock Firebase app module
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn().mockReturnValue({}),
  getApps: jest.fn().mockReturnValue([]),
  getApp: jest.fn().mockReturnValue({}),
}));

// Mock firebaseui
jest.mock("firebaseui", () => ({
  auth: {
    AuthUI: jest.fn().mockImplementation(() => ({
      start: jest.fn(),
      reset: jest.fn(),
      delete: jest.fn(),
      disableAutoSignIn: jest.fn(),
      isPendingRedirect: jest.fn().mockReturnValue(false),
    })),
  },
}));

// Mock the index module's ui export
jest.mock("./index", () => ({
  ui: {
    start: jest.fn(),
    reset: jest.fn(),
  },
}));

// Mock Firebase globally
jest.mock("./firebaseSetup", () => ({
  startFirebase: jest.fn(),
  auth: {
    onAuthStateChanged: jest.fn((callback) => {
      // Return unsubscribe function
      return jest.fn();
    }),
    signOut: jest.fn().mockResolvedValue(undefined),
    currentUser: null,
  },
  database: {
    ref: jest.fn().mockReturnValue({
      set: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      once: jest.fn().mockResolvedValue({ val: () => null }),
      on: jest.fn(),
      off: jest.fn(),
      push: jest.fn().mockReturnValue({ key: "mock-key" }),
      remove: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

// Mock the API module
// Mock the API module - it's a class with static methods
const MockAPI = {
  createGameId: jest.fn().mockResolvedValue("mock-game-id"),
  createGame: jest.fn().mockResolvedValue(undefined),
  fetchGame: jest.fn().mockResolvedValue(null),
  createGroupId: jest.fn().mockResolvedValue("mock-group-id"),
  createGroup: jest.fn().mockResolvedValue(undefined),
  fetchGroup: jest.fn().mockResolvedValue(null),
  createEntryId: jest.fn().mockResolvedValue("mock-entry-id"),
  createEntry: jest.fn().mockResolvedValue(undefined),
  fetchEntry: jest.fn().mockResolvedValue(null),
  fetchUser: jest.fn().mockResolvedValue(null),
  createUser: jest.fn().mockResolvedValue(undefined),
  updateEntry: jest.fn().mockResolvedValue(undefined),
  updateGame: jest.fn().mockResolvedValue(undefined),
  updateGroup: jest.fn().mockResolvedValue(undefined),
  updateCategory: jest.fn().mockResolvedValue(undefined),
  fetchEntries: jest.fn().mockResolvedValue([]),
  fetchUserGroups: jest.fn().mockResolvedValue([]),
  searchMovieDB: jest.fn().mockResolvedValue([]),
  fetchMovieDBPerson: jest.fn().mockResolvedValue(null),
  saveTitle: jest.fn().mockResolvedValue(undefined),
  savePerson: jest.fn().mockResolvedValue(undefined),
  selectCorrectNominee: jest.fn().mockResolvedValue(undefined),
  selectNominee: jest.fn().mockResolvedValue(undefined),
  signOut: jest.fn().mockResolvedValue(undefined),
};
jest.mock("./api", () => ({ __esModule: true, default: MockAPI }));

// Mock window.location
const mockLocation = {
  href: "",
  pathname: "/",
  search: "",
  hash: "",
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
};

Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "sessionStorage", {
  value: sessionStorageMock,
});

// Custom Immutable.js matchers
expect.extend({
  /**
   * Check if two Immutable.js values are equal
   * Usage: expect(immutableA).toEqualImmutable(immutableB)
   */
  toEqualImmutable(received, expected) {
    const { is } = require("immutable");
    const pass = is(received, expected);

    if (pass) {
      return {
        message: () =>
          `expected ${received} not to equal ${expected}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to equal ${expected}\n\nReceived: ${JSON.stringify(
            received?.toJS?.() || received,
            null,
            2
          )}\n\nExpected: ${JSON.stringify(
            expected?.toJS?.() || expected,
            null,
            2
          )}`,
        pass: false,
      };
    }
  },

  /**
   * Check if an Immutable.js collection contains a value
   * Usage: expect(immutableMap).toContainImmutableKey('key')
   */
  toContainImmutableKey(received, key) {
    const pass = received?.has?.(key) || false;

    if (pass) {
      return {
        message: () => `expected collection not to contain key "${key}"`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected collection to contain key "${key}"\n\nKeys: ${
            received?.keySeq?.()?.toArray?.()?.join?.(", ") || "none"
          }`,
        pass: false,
      };
    }
  },

  /**
   * Check the size of an Immutable.js collection
   * Usage: expect(immutableList).toHaveImmutableSize(3)
   */
  toHaveImmutableSize(received, expectedSize) {
    const actualSize = received?.size || 0;
    const pass = actualSize === expectedSize;

    if (pass) {
      return {
        message: () =>
          `expected collection not to have size ${expectedSize}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected collection to have size ${expectedSize}, but got ${actualSize}`,
        pass: false,
      };
    }
  },
});

// Silence console errors and warnings in tests (optional - comment out if you want to see them)
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    // Filter out known React warnings that don't affect tests
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Warning: ReactDOM.render is no longer supported") ||
        args[0].includes("Warning: An update to") ||
        args[0].includes("act(...)"))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    // Filter out known warnings
    if (
      typeof args[0] === "string" &&
      (args[0].includes("componentWillReceiveProps has been renamed") ||
        args[0].includes("React Router Future Flag Warning"))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
  window.location.href = "";
  window.location.pathname = "/";
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
});

// Global test utilities
global.flushPromises = () => new Promise((resolve) => setImmediate(resolve));
