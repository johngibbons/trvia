/**
 * Mock Data Provider for Browser Development
 *
 * This module provides mock data for running the app without Firebase.
 * Useful for development, demos, and testing UI without backend dependencies.
 *
 * Usage:
 * - Set REACT_APP_USE_MOCK_DATA=true when starting the app
 * - Import getMockInitialState() to get the initial Redux state
 * - Use MockAPI in place of the real Firebase API
 */

import { ScenarioBuilder, scenarios, AWARD_CATEGORIES } from "./factories";
import { Map, fromJS } from "immutable";

/**
 * Get mock initial state for the Redux store
 * Configurable via environment variables:
 * - REACT_APP_MOCK_SCENARIO: 'basic', 'inProgress', 'completed', 'empty' (default: 'basic')
 *
 * @returns {Object} Complete Redux state with mock data
 */
export const getMockInitialState = () => {
  const scenarioName = process.env.REACT_APP_MOCK_SCENARIO || "basic";

  switch (scenarioName) {
    case "empty":
      return scenarios.empty();

    case "inProgress":
      return createInProgressScenario();

    case "earlyProgress":
      return createEarlyProgressScenario();

    case "completed":
      return createCompletedScenario();

    case "basic":
    default:
      return createBasicScenario();
  }
};

/**
 * Create a basic scenario for development
 */
const createBasicScenario = () => {
  const builder = new ScenarioBuilder()
    .withGame({ id: "game-2024", name: "96th Academy Awards" }, 23, 5)
    .withGroup("game-2024", { id: "group-office", name: "Office Pool" })
    .withGroupAdmin("group-office", "user-current")
    .withEntry("group-office", { name: "Alice's Picks" }, "random")
    .withEntry("group-office", { name: "Bob's Predictions" }, "random")
    .withEntry("group-office", { name: "Charlie's Guesses" }, "random")
    .withEntry("group-office", { name: "Diana's Choices" }, "random")
    .withCurrentUser({
      id: "user-current",
      name: "Demo User",
      email: "demo@example.com",
      photoURL: "",
    });

  // Add a second group
  builder
    .withGroup("game-2024", { id: "group-family", name: "Family Pool" })
    .withEntry("group-family", { name: "Mom's Entry" }, "all-first")
    .withEntry("group-family", { name: "Dad's Entry" }, "random")
    .withEntry("group-family", { name: "My Entry" }, "random");

  return builder.build();
};

/**
 * Create an in-progress scenario (game partially scored)
 * This scenario is designed to demonstrate rank changes as the game progresses.
 *
 * Current state (10 categories answered):
 * - Alice: Leading with all correct picks (will stay #1)
 * - Bob: Second place, picked first nominees (mixed results)
 * - Charlie: Middle of the pack with random picks
 * - Diana: Behind but could catch up
 * - Eve: Last place with all wrong picks
 *
 * As more categories are answered, you'll see rank changes and indicators.
 */
const createInProgressScenario = () => {
  const builder = new ScenarioBuilder()
    .withGame({ id: "game-2024", name: "96th Academy Awards" }, 23, 5)
    .withGroup("game-2024", { id: "group-office", name: "Office Pool" })
    .withGroupAdmin("group-office", "user-current")
    // Alice - picks all first nominees (most will be correct in withGameInProgress)
    .withEntry("group-office", { name: "Alice's Picks" }, "all-first")
    // Bob - also picks first nominees, will tie with Alice
    .withEntry("group-office", { name: "Bob's Predictions" }, "all-first")
    // Charlie - random picks, some correct
    .withEntry("group-office", { name: "Charlie's Guesses" }, "random")
    // Diana - different strategy, picks last nominees (mostly wrong)
    .withEntry("group-office", { name: "Diana's Choices" }, "all-last")
    // Eve - also picks last, will tie for last with Diana
    .withEntry("group-office", { name: "Eve's Entry" }, "all-last")
    .withGameInProgress("game-2024", 10)
    .withCurrentUser({
      id: "user-current",
      name: "Demo User",
      email: "demo@example.com",
    });

  const ids = builder.getIds();
  const state = builder.build();

  // Add previousRanks to show rank change indicators
  // Simulate that Bob was previously #1, Alice was #2
  state.ui = state.ui.set("previousRanks", fromJS({
    [ids.entryIds[0]]: 2, // Alice was #2, now #1 (tie) - will show up arrow
    [ids.entryIds[1]]: 1, // Bob was #1, now #1 (tie) - will show down arrow or same
    [ids.entryIds[2]]: 3, // Charlie stayed #3
    [ids.entryIds[3]]: 4, // Diana stayed #4
    [ids.entryIds[4]]: 5, // Eve stayed #5
  }));

  return state;
};

/**
 * Create an early progress scenario (only 3 categories answered)
 * This scenario is great for testing how ranks change as more categories are answered.
 *
 * Current state (3 categories answered):
 * - Rankings are still volatile
 * - One correct answer can dramatically change positions
 * - Great for testing the rank change indicators
 */
const createEarlyProgressScenario = () => {
  const builder = new ScenarioBuilder()
    .withGame({ id: "game-2024", name: "96th Academy Awards" }, 15, 5)
    .withGroup("game-2024", { id: "group-office", name: "Office Pool" })
    .withGroupAdmin("group-office", "user-current")
    // Create entries with different picking strategies
    .withEntry("group-office", { name: "Alice's Picks" }, "all-first")
    .withEntry("group-office", { name: "Bob's Predictions" }, "all-first")
    .withEntry("group-office", { name: "Charlie's Guesses" }, "random")
    .withEntry("group-office", { name: "Diana's Choices" }, "random")
    .withEntry("group-office", { name: "Eve's Entry" }, "all-last")
    .withGameInProgress("game-2024", 3) // Only 3 categories answered
    .withCurrentUser({
      id: "user-current",
      name: "Demo User",
      email: "demo@example.com",
    });

  const ids = builder.getIds();
  const state = builder.build();

  // Add previousRanks showing dramatic changes
  state.ui = state.ui.set("previousRanks", fromJS({
    [ids.entryIds[0]]: 3, // Alice jumped from #3 to #1 - big up arrow
    [ids.entryIds[1]]: 2, // Bob improved from #2 to #1
    [ids.entryIds[2]]: 1, // Charlie dropped from #1 to #3 - down arrow
    [ids.entryIds[3]]: 4, // Diana stayed #4
    [ids.entryIds[4]]: 5, // Eve stayed last
  }));

  return state;
};

/**
 * Create a completed scenario (game fully scored with winners)
 */
const createCompletedScenario = () => {
  const builder = new ScenarioBuilder()
    .withGame({ id: "game-2024", name: "96th Academy Awards" }, 23, 5)
    .withGroup("game-2024", { id: "group-office", name: "Office Pool" })
    .withGroupAdmin("group-office", "user-current")
    .withEntry("group-office", { name: "Winner's Entry" }, "all-first")
    .withEntry("group-office", { name: "Runner Up" }, "random")
    .withEntry("group-office", { name: "Third Place" }, "all-last")
    .withGameCompleted("game-2024")
    .withCurrentUser({
      id: "user-current",
      name: "Demo User",
      email: "demo@example.com",
    });

  return builder.build();
};

/**
 * Mock API class that mirrors the real Firebase API
 * For use in browser development without Firebase
 */
export class MockAPI {
  constructor(initialState = {}) {
    this.state = initialState;
    this.delay = 100; // Simulated network delay in ms
  }

  /**
   * Simulate network delay
   */
  async simulateDelay() {
    await new Promise((resolve) => setTimeout(resolve, this.delay));
  }

  // Game methods
  async createGameId() {
    await this.simulateDelay();
    return `game-${Date.now()}`;
  }

  async createGame(gameId, gameData) {
    await this.simulateDelay();
    console.log("[MockAPI] Creating game:", gameId, gameData);
    return undefined;
  }

  async fetchGame(gameId) {
    await this.simulateDelay();
    const game = this.state.games?.get(gameId);
    return game ? game.toJS() : null;
  }

  async updateGame(gameId, updates) {
    await this.simulateDelay();
    console.log("[MockAPI] Updating game:", gameId, updates);
    return undefined;
  }

  // Group methods
  async createGroupId() {
    await this.simulateDelay();
    return `group-${Date.now()}`;
  }

  async createGroup(groupId, groupData) {
    await this.simulateDelay();
    console.log("[MockAPI] Creating group:", groupId, groupData);
    return undefined;
  }

  async fetchGroup(groupId) {
    await this.simulateDelay();
    const group = this.state.groups?.get(groupId);
    return group ? group.toJS() : null;
  }

  async updateGroup(groupId, updates) {
    await this.simulateDelay();
    console.log("[MockAPI] Updating group:", groupId, updates);
    return undefined;
  }

  // Entry methods
  async createEntryId() {
    await this.simulateDelay();
    return `entry-${Date.now()}`;
  }

  async createEntry(entryId, entryData) {
    await this.simulateDelay();
    console.log("[MockAPI] Creating entry:", entryId, entryData);
    return undefined;
  }

  async fetchEntry(entryId) {
    await this.simulateDelay();
    const entry = this.state.entries?.get(entryId);
    return entry ? entry.toJS() : null;
  }

  async updateEntry(entryId, updates) {
    await this.simulateDelay();
    console.log("[MockAPI] Updating entry:", entryId, updates);
    return undefined;
  }

  // User methods
  async fetchUser(userId) {
    await this.simulateDelay();
    const user = this.state.users?.get(userId);
    return user ? user.toJS() : null;
  }

  async createUser(userId, userData) {
    await this.simulateDelay();
    console.log("[MockAPI] Creating user:", userId, userData);
    return undefined;
  }

  // Category methods
  async updateCategory(categoryId, updates) {
    await this.simulateDelay();
    console.log("[MockAPI] Updating category:", categoryId, updates);
    return undefined;
  }

  // Fetch methods
  async fetchEntries(groupId) {
    await this.simulateDelay();
    const entries = [];
    this.state.entries?.forEach((entry, id) => {
      if (entry.group === groupId) {
        entries.push({ id, ...entry.toJS() });
      }
    });
    return entries;
  }

  async fetchUserGroups(userId) {
    await this.simulateDelay();
    const groups = [];
    this.state.groups?.forEach((group, id) => {
      groups.push({ id, ...group.toJS() });
    });
    return groups;
  }

  // Search methods (for admin)
  async searchMovieDB(query) {
    await this.simulateDelay();
    console.log("[MockAPI] Searching MovieDB:", query);
    return [];
  }

  async fetchMovieDBPerson(personId) {
    await this.simulateDelay();
    return null;
  }
}

/**
 * Check if mock mode is enabled
 */
export const isMockMode = () => {
  return process.env.REACT_APP_USE_MOCK_DATA === "true";
};

/**
 * Get the mock API instance (singleton)
 */
let mockAPIInstance = null;

export const getMockAPI = (state) => {
  if (!mockAPIInstance) {
    mockAPIInstance = new MockAPI(state);
  }
  return mockAPIInstance;
};

/**
 * Reset the mock API (useful for tests)
 */
export const resetMockAPI = () => {
  mockAPIInstance = null;
};

export default {
  getMockInitialState,
  MockAPI,
  isMockMode,
  getMockAPI,
  resetMockAPI,
};
