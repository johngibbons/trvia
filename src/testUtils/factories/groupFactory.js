import { faker } from "@faker-js/faker";
import { Map, fromJS } from "immutable";
import Group from "../../models/Group";
import { generateId } from "./helpers";

/**
 * Default group attributes
 */
const defaultGroupAttrs = () => ({
  id: generateId("group-"),
  name: `${faker.company.name()} Pool`,
  admin: undefined,
  entries: new Map(),
  game: undefined,
  values: new Map(),
});

/**
 * Create a Group Immutable Record for testing
 * @param {Object} overrides - Attribute overrides
 * @returns {Group} Immutable Group Record
 */
export const createGroup = (overrides = {}) => {
  const attrs = {
    ...defaultGroupAttrs(),
    ...overrides,
  };

  // Convert plain objects to Immutable structures
  if (attrs.entries && !(attrs.entries instanceof Map)) {
    attrs.entries = fromJS(attrs.entries);
  }
  if (attrs.values && !(attrs.values instanceof Map)) {
    attrs.values = fromJS(attrs.values);
  }

  return new Group(attrs);
};

/**
 * Create a group with entries
 * @param {string[]} entryIds - Array of entry IDs
 * @param {Object} overrides - Additional overrides
 * @returns {Group} Group with entries
 */
export const createGroupWithEntries = (entryIds, overrides = {}) => {
  const entriesMap = entryIds.reduce((acc, id) => {
    acc[id] = true;
    return acc;
  }, {});

  return createGroup({
    ...overrides,
    entries: fromJS(entriesMap),
  });
};

/**
 * Create a group for a specific game
 * @param {string} gameId - ID of the game
 * @param {Object} overrides - Additional overrides
 * @returns {Group} Group linked to game
 */
export const createGroupForGame = (gameId, overrides = {}) => {
  return createGroup({
    ...overrides,
    game: gameId,
  });
};

/**
 * Create a group with custom values (point values per category)
 * @param {Object} categoryValues - Map of categoryId to point value
 * @param {Object} overrides - Additional overrides
 * @returns {Group} Group with custom values
 */
export const createGroupWithValues = (categoryValues, overrides = {}) => {
  return createGroup({
    ...overrides,
    values: fromJS(categoryValues),
  });
};

/**
 * Create a group with an admin
 * @param {string} adminUserId - ID of the admin user
 * @param {Object} overrides - Additional overrides
 * @returns {Group} Group with admin
 */
export const createGroupWithAdmin = (adminUserId, overrides = {}) => {
  return createGroup({
    ...overrides,
    admin: adminUserId,
  });
};

/**
 * Create a complete group setup
 * @param {string} gameId - Game ID
 * @param {string} adminId - Admin user ID
 * @param {string[]} entryIds - Entry IDs
 * @param {Object} categoryValues - Category point values
 * @param {Object} overrides - Additional overrides
 * @returns {Group} Complete group
 */
export const createCompleteGroup = (
  gameId,
  adminId,
  entryIds,
  categoryValues,
  overrides = {}
) => {
  const entriesMap = entryIds.reduce((acc, id) => {
    acc[id] = true;
    return acc;
  }, {});

  return createGroup({
    ...overrides,
    game: gameId,
    admin: adminId,
    entries: fromJS(entriesMap),
    values: fromJS(categoryValues),
  });
};
