import { faker } from "@faker-js/faker";
import { Map, fromJS } from "immutable";
import Entry from "../../models/Entry";
import { generateId } from "./helpers";

/**
 * Default entry attributes
 */
const defaultEntryAttrs = () => ({
  id: generateId("entry-"),
  name: faker.person.firstName() + "'s Entry",
  group: undefined,
  game: undefined,
  selections: new Map(),
  user: undefined,
  score: 0,
  rank: 1,
});

/**
 * Create an Entry Immutable Record for testing
 * @param {Object} overrides - Attribute overrides
 * @returns {Entry} Immutable Entry Record
 */
export const createEntry = (overrides = {}) => {
  const attrs = {
    ...defaultEntryAttrs(),
    ...overrides,
  };

  // Convert plain objects to Immutable structures
  if (attrs.selections && !(attrs.selections instanceof Map)) {
    attrs.selections = fromJS(attrs.selections);
  }

  return new Entry(attrs);
};

/**
 * Create an entry with selections
 * @param {Object} selections - Map of categoryId to nomineeId
 * @param {Object} overrides - Additional overrides
 * @returns {Entry} Entry with selections
 */
export const createEntryWithSelections = (selections, overrides = {}) => {
  return createEntry({
    ...overrides,
    selections: fromJS(selections),
  });
};

/**
 * Create an entry for a user
 * @param {string} userId - ID of the user
 * @param {Object} overrides - Additional overrides
 * @returns {Entry} Entry linked to user
 */
export const createEntryForUser = (userId, overrides = {}) => {
  return createEntry({
    ...overrides,
    user: userId,
  });
};

/**
 * Create an entry for a group and game
 * @param {string} groupId - ID of the group
 * @param {string} gameId - ID of the game
 * @param {Object} overrides - Additional overrides
 * @returns {Entry} Entry linked to group and game
 */
export const createEntryForGroup = (groupId, gameId, overrides = {}) => {
  return createEntry({
    ...overrides,
    group: groupId,
    game: gameId,
  });
};

/**
 * Create an entry with a specific score and rank
 * @param {number} score - Entry score
 * @param {number} rank - Entry rank
 * @param {Object} overrides - Additional overrides
 * @returns {Entry} Entry with score and rank
 */
export const createScoredEntry = (score, rank, overrides = {}) => {
  return createEntry({
    ...overrides,
    score,
    rank,
  });
};

/**
 * Create a complete entry with all relationships
 * @param {string} userId - User ID
 * @param {string} groupId - Group ID
 * @param {string} gameId - Game ID
 * @param {Object} selections - Selections map
 * @param {Object} overrides - Additional overrides
 * @returns {Entry} Complete entry
 */
export const createCompleteEntry = (
  userId,
  groupId,
  gameId,
  selections = {},
  overrides = {}
) => {
  return createEntry({
    ...overrides,
    user: userId,
    group: groupId,
    game: gameId,
    selections: fromJS(selections),
  });
};

/**
 * Create multiple entries with random selections from nominees
 * @param {number} count - Number of entries to create
 * @param {string} groupId - Group ID
 * @param {string} gameId - Game ID
 * @param {Object} categoryNomineeMap - Map of categoryId to array of nomineeIds
 * @param {Object} overrides - Additional overrides per entry
 * @returns {Entry[]} Array of entries with selections
 */
export const createEntriesWithRandomSelections = (
  count,
  groupId,
  gameId,
  categoryNomineeMap,
  overrides = {}
) => {
  return Array.from({ length: count }, (_, index) => {
    const selections = {};

    Object.entries(categoryNomineeMap).forEach(([categoryId, nomineeIds]) => {
      // Pick a random nominee for each category
      const randomNominee =
        nomineeIds[Math.floor(Math.random() * nomineeIds.length)];
      selections[categoryId] = randomNominee;
    });

    return createEntry({
      group: groupId,
      game: gameId,
      selections: fromJS(selections),
      name: `Entry ${index + 1}`,
      ...overrides,
    });
  });
};
