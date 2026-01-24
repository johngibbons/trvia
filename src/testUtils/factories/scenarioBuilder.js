import { Map, fromJS, List } from "immutable";
import { createUser } from "./userFactory";
import { createGame, createGameWithCategories } from "./gameFactory";
import { createCategory, createAnsweredCategory } from "./categoryFactory";
import { createNominee } from "./nomineeFactory";
import { createGroup, createGroupWithEntries } from "./groupFactory";
import { createEntry, createEntryWithSelections } from "./entryFactory";
import { createUI, createAdmin } from "./uiFactory";
import User from "../../models/User";
import { generateId, AWARD_CATEGORIES } from "./helpers";

/**
 * ScenarioBuilder - Creates complete, consistent Redux state with proper foreign keys
 *
 * Usage:
 * const state = new ScenarioBuilder()
 *   .withGame({ name: '97th Academy Awards' }, 5, 5) // 5 categories, 5 nominees each
 *   .withGroup('game-1', { name: 'Office Pool' })
 *   .withEntry('group-1')
 *   .withCurrentUser()
 *   .build();
 */
export class ScenarioBuilder {
  constructor() {
    this.games = new Map();
    this.categories = new Map();
    this.nominees = new Map();
    this.groups = new Map();
    this.entries = new Map();
    this.users = new Map();
    this.currentUser = new User();
    this.ui = createUI();
    this.admin = createAdmin();
    this.pendingGame = new Map();
    this.pendingCategory = new Map();
    this.pendingNominee = new Map();

    // Track relationships for building consistent state
    this._gameCategories = {}; // gameId -> [categoryIds]
    this._categoryNominees = {}; // categoryId -> [nomineeIds]
    this._groupEntries = {}; // groupId -> [entryIds]
  }

  /**
   * Add a game with categories and nominees
   * @param {Object} gameOverrides - Game attribute overrides
   * @param {number} categoryCount - Number of categories (default 5)
   * @param {number} nomineesPerCategory - Nominees per category (default 5)
   * @returns {ScenarioBuilder} this
   */
  withGame(gameOverrides = {}, categoryCount = 5, nomineesPerCategory = 5) {
    const gameId = gameOverrides.id || generateId("game-");
    const categoryIds = [];
    const categoryNomineesMap = {};

    // Create categories for this game
    for (let i = 0; i < categoryCount; i++) {
      const categoryId = generateId("category-");
      categoryIds.push(categoryId);

      const nomineeIds = [];

      // Create nominees for this category
      for (let j = 0; j < nomineesPerCategory; j++) {
        const nomineeId = generateId("nominee-");
        nomineeIds.push(nomineeId);

        const nominee = createNominee({
          id: nomineeId,
          category: categoryId,
          game: gameId,
        });
        this.nominees = this.nominees.set(nomineeId, nominee);
      }

      this._categoryNominees[categoryId] = nomineeIds;
      categoryNomineesMap[categoryId] = nomineeIds;

      const category = createCategory({
        id: categoryId,
        game: gameId,
        name: AWARD_CATEGORIES[i % AWARD_CATEGORIES.length],
        order: i,
        presentationOrder: i,
        nominees: nomineeIds.reduce((acc, id) => ({ ...acc, [id]: true }), {}),
        value: 1,
      });
      this.categories = this.categories.set(categoryId, category);
    }

    this._gameCategories[gameId] = categoryIds;

    const game = createGameWithCategories(categoryIds, {
      id: gameId,
      ...gameOverrides,
    });
    this.games = this.games.set(gameId, game);

    return this;
  }

  /**
   * Add a group for an existing game
   * @param {string} gameId - ID of the game
   * @param {Object} groupOverrides - Group attribute overrides
   * @returns {ScenarioBuilder} this
   */
  withGroup(gameId, groupOverrides = {}) {
    const groupId = groupOverrides.id || generateId("group-");
    const categoryIds = this._gameCategories[gameId] || [];

    // Create default values (1 point per category)
    const values = categoryIds.reduce(
      (acc, catId) => ({ ...acc, [catId]: 1 }),
      {}
    );

    const group = createGroup({
      id: groupId,
      game: gameId,
      values,
      ...groupOverrides,
    });

    this.groups = this.groups.set(groupId, group);
    this._groupEntries[groupId] = [];

    return this;
  }

  /**
   * Add an entry to an existing group
   * @param {string} groupId - ID of the group
   * @param {Object} userOverrides - User attribute overrides
   * @param {string} selectionStrategy - 'random', 'all-first', 'all-last', 'empty', or custom selections object
   * @returns {ScenarioBuilder} this
   */
  withEntry(groupId, userOverrides = {}, selectionStrategy = "random") {
    const group = this.groups.get(groupId);
    if (!group) {
      throw new Error(`Group ${groupId} not found. Add game and group first.`);
    }

    const gameId = group.game;
    const categoryIds = this._gameCategories[gameId] || [];

    // Create user for entry
    const userId = userOverrides.id || generateId("user-");
    const user = createUser({
      id: userId,
      ...userOverrides,
    });
    this.users = this.users.set(userId, user);

    // Create selections based on strategy
    let selections = {};
    if (typeof selectionStrategy === "object") {
      selections = selectionStrategy;
    } else {
      categoryIds.forEach((catId) => {
        const nomineeIds = this._categoryNominees[catId] || [];
        if (nomineeIds.length === 0) return;

        switch (selectionStrategy) {
          case "random":
            selections[catId] =
              nomineeIds[Math.floor(Math.random() * nomineeIds.length)];
            break;
          case "all-first":
            selections[catId] = nomineeIds[0];
            break;
          case "all-last":
            selections[catId] = nomineeIds[nomineeIds.length - 1];
            break;
          case "empty":
            // No selections
            break;
          default:
            selections[catId] =
              nomineeIds[Math.floor(Math.random() * nomineeIds.length)];
        }
      });
    }

    // Create entry
    const entryId = generateId("entry-");
    const entry = createEntryWithSelections(selections, {
      id: entryId,
      user: userId,
      group: groupId,
      game: gameId,
    });
    this.entries = this.entries.set(entryId, entry);

    // Update group with entry
    this._groupEntries[groupId] = this._groupEntries[groupId] || [];
    this._groupEntries[groupId].push(entryId);

    const updatedGroup = this.groups.get(groupId).setIn(
      ["entries", entryId],
      true
    );
    this.groups = this.groups.set(groupId, updatedGroup);

    // Update user with entry
    const updatedUser = this.users
      .get(userId)
      .setIn(["entries", entryId], true);
    this.users = this.users.set(userId, updatedUser);

    return this;
  }

  /**
   * Set the current authenticated user
   * @param {Object} overrides - User attribute overrides
   * @returns {ScenarioBuilder} this
   */
  withCurrentUser(overrides = {}) {
    const userId = overrides.id || generateId("user-");
    const user = createUser({
      id: userId,
      ...overrides,
    });

    this.currentUser = user;
    this.users = this.users.set(userId, user);

    return this;
  }

  /**
   * Mark a game as in progress (some categories answered)
   * @param {string} gameId - ID of the game
   * @param {number} answeredCount - Number of categories to mark as answered
   * @returns {ScenarioBuilder} this
   */
  withGameInProgress(gameId, answeredCount) {
    const categoryIds = this._gameCategories[gameId] || [];
    const answeredIds = categoryIds.slice(0, answeredCount);

    // Mark categories as answered
    answeredIds.forEach((catId) => {
      const nomineeIds = this._categoryNominees[catId] || [];
      if (nomineeIds.length > 0) {
        const category = this.categories.get(catId);
        const updatedCategory = category.set("correctAnswer", nomineeIds[0]);
        this.categories = this.categories.set(catId, updatedCategory);
      }
    });

    // Update game answered_order
    const game = this.games.get(gameId);
    const updatedGame = game.set("answered_order", List(answeredIds));
    this.games = this.games.set(gameId, updatedGame);

    return this;
  }

  /**
   * Mark a game as completed (all categories answered)
   * @param {string} gameId - ID of the game
   * @returns {ScenarioBuilder} this
   */
  withGameCompleted(gameId) {
    const categoryIds = this._gameCategories[gameId] || [];
    return this.withGameInProgress(gameId, categoryIds.length);
  }

  /**
   * Set custom point values for a group's categories
   * @param {string} groupId - ID of the group
   * @param {Object} values - Map of categoryId to point value
   * @returns {ScenarioBuilder} this
   */
  withGroupValues(groupId, values) {
    const group = this.groups.get(groupId);
    if (!group) {
      throw new Error(`Group ${groupId} not found.`);
    }

    const updatedGroup = group.set("values", fromJS(values));
    this.groups = this.groups.set(groupId, updatedGroup);

    return this;
  }

  /**
   * Set a group's admin
   * @param {string} groupId - ID of the group
   * @param {string} userId - ID of the admin user
   * @returns {ScenarioBuilder} this
   */
  withGroupAdmin(groupId, userId) {
    const group = this.groups.get(groupId);
    if (!group) {
      throw new Error(`Group ${groupId} not found.`);
    }

    const updatedGroup = group.set("admin", userId);
    this.groups = this.groups.set(groupId, updatedGroup);

    return this;
  }

  /**
   * Set UI state
   * @param {Object} uiOverrides - UI state overrides
   * @returns {ScenarioBuilder} this
   */
  withUI(uiOverrides) {
    this.ui = createUI(uiOverrides);
    return this;
  }

  /**
   * Build the complete Redux state
   * @returns {Object} Complete Redux state object
   */
  build() {
    return {
      games: this.games,
      categories: this.categories,
      nominees: this.nominees,
      groups: this.groups,
      entries: this.entries,
      users: this.users,
      currentUser: this.currentUser,
      ui: this.ui,
      admin: this.admin,
      pendingGame: this.pendingGame,
      pendingCategory: this.pendingCategory,
      pendingNominee: this.pendingNominee,
    };
  }

  /**
   * Get IDs for building props
   * @returns {Object} Object containing all generated IDs
   */
  getIds() {
    return {
      gameIds: this.games.keySeq().toArray(),
      categoryIds: this.categories.keySeq().toArray(),
      nomineeIds: this.nominees.keySeq().toArray(),
      groupIds: this.groups.keySeq().toArray(),
      entryIds: this.entries.keySeq().toArray(),
      userIds: this.users.keySeq().toArray(),
      gameCategories: { ...this._gameCategories },
      categoryNominees: { ...this._categoryNominees },
      groupEntries: { ...this._groupEntries },
    };
  }
}

/**
 * Pre-built scenarios for common test cases
 */
export const scenarios = {
  /**
   * Empty state - no data
   */
  empty: () => new ScenarioBuilder().build(),

  /**
   * Basic game with group and entries
   */
  basicGame: () => {
    const builder = new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 5, 5)
      .withGroup("game1", { id: "group1", name: "Office Pool" })
      .withEntry("group1", { name: "Alice" })
      .withEntry("group1", { name: "Bob" })
      .withEntry("group1", { name: "Charlie" })
      .withCurrentUser({ name: "Test User" });

    return builder.build();
  },

  /**
   * Game in progress with partial scoring
   */
  gameInProgress: () => {
    const builder = new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 10, 5)
      .withGroup("game1", { id: "group1", name: "Office Pool" })
      .withEntry("group1", { name: "Leader" }, "all-first")
      .withEntry("group1", { name: "Middle" }, "random")
      .withEntry("group1", { name: "Behind" }, "all-last")
      .withCurrentUser({ name: "Test User" })
      .withGameInProgress("game1", 5);

    return builder.build();
  },

  /**
   * Completed game with full rankings
   */
  completedGame: () => {
    const builder = new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 10, 5)
      .withGroup("game1", { id: "group1", name: "Office Pool" })
      .withEntry("group1", { name: "Winner" }, "all-first")
      .withEntry("group1", { name: "Second" }, "random")
      .withEntry("group1", { name: "Third" }, "all-last")
      .withCurrentUser({ name: "Test User" })
      .withGameCompleted("game1");

    return builder.build();
  },

  /**
   * Game with tied entries
   */
  gameWithTies: () => {
    const builder = new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 5, 5)
      .withGroup("game1", { id: "group1", name: "Office Pool" })
      // All entries have same selections = same score
      .withEntry("group1", { name: "Tied 1" }, "all-first")
      .withEntry("group1", { name: "Tied 2" }, "all-first")
      .withEntry("group1", { name: "Tied 3" }, "all-first")
      .withCurrentUser({ name: "Test User" })
      .withGameCompleted("game1");

    return builder.build();
  },

  /**
   * Game with authenticated user's entry
   */
  withUserEntry: () => {
    const builder = new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 5, 5)
      .withGroup("game1", { id: "group1", name: "Office Pool" })
      .withCurrentUser({ id: "user1", name: "Test User" })
      .withEntry("group1", { id: "user1", name: "Test User" }, "random")
      .withEntry("group1", { name: "Competitor" }, "random");

    return builder.build();
  },

  /**
   * Multiple groups for same game
   */
  multipleGroups: () => {
    const builder = new ScenarioBuilder()
      .withGame({ id: "game1", name: "97th Academy Awards" }, 5, 5)
      .withGroup("game1", { id: "group1", name: "Office Pool" })
      .withGroup("game1", { id: "group2", name: "Family Pool" })
      .withEntry("group1", { name: "Office Alice" })
      .withEntry("group1", { name: "Office Bob" })
      .withEntry("group2", { name: "Family Alice" })
      .withEntry("group2", { name: "Family Charlie" })
      .withCurrentUser({ name: "Test User" });

    return builder.build();
  },
};

export default ScenarioBuilder;
