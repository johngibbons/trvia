import { faker } from "@faker-js/faker";
import { Map, fromJS } from "immutable";
import User from "../../models/User";
import { generateId } from "./helpers";

/**
 * Default user attributes
 */
const defaultUserAttrs = () => ({
  id: generateId("user-"),
  photoURL: faker.image.avatar(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  entries: new Map(),
  groups: new Map(),
});

/**
 * Create a User Immutable Record for testing
 * @param {Object} overrides - Attribute overrides
 * @returns {User} Immutable User Record
 */
export const createUser = (overrides = {}) => {
  const attrs = {
    ...defaultUserAttrs(),
    ...overrides,
  };

  // Convert plain objects to Immutable structures
  if (attrs.entries && !(attrs.entries instanceof Map)) {
    attrs.entries = fromJS(attrs.entries);
  }
  if (attrs.groups && !(attrs.groups instanceof Map)) {
    attrs.groups = fromJS(attrs.groups);
  }

  return new User(attrs);
};

/**
 * Create a user with entries
 * @param {string[]} entryIds - Array of entry IDs
 * @param {Object} overrides - Additional overrides
 * @returns {User} User with entries
 */
export const createUserWithEntries = (entryIds, overrides = {}) => {
  const entriesMap = entryIds.reduce((acc, id) => {
    acc[id] = true;
    return acc;
  }, {});

  return createUser({
    ...overrides,
    entries: fromJS(entriesMap),
  });
};

/**
 * Create a user with groups
 * @param {string[]} groupIds - Array of group IDs
 * @param {Object} overrides - Additional overrides
 * @returns {User} User with groups
 */
export const createUserWithGroups = (groupIds, overrides = {}) => {
  const groupsMap = groupIds.reduce((acc, id) => {
    acc[id] = true;
    return acc;
  }, {});

  return createUser({
    ...overrides,
    groups: fromJS(groupsMap),
  });
};

/**
 * Create a minimal user (just id and name)
 * @param {Object} overrides - Attribute overrides
 * @returns {User} Minimal User Record
 */
export const createMinimalUser = (overrides = {}) => {
  return createUser({
    photoURL: "",
    email: "",
    entries: new Map(),
    groups: new Map(),
    ...overrides,
  });
};
