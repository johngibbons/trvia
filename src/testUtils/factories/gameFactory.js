import { faker } from "@faker-js/faker";
import { Map, List, fromJS } from "immutable";
import Game from "../../models/Game";
import { generateId } from "./helpers";

/**
 * Default game attributes
 */
const defaultGameAttrs = () => ({
  id: generateId("game-"),
  name: `${faker.number.int({ min: 90, max: 99 })}th Academy Awards`,
  answered_order: new List(),
  categories: new Map(),
});

/**
 * Create a Game Immutable Record for testing
 * @param {Object} overrides - Attribute overrides
 * @returns {Game} Immutable Game Record
 */
export const createGame = (overrides = {}) => {
  const attrs = {
    ...defaultGameAttrs(),
    ...overrides,
  };

  // Convert plain objects to Immutable structures
  if (attrs.categories && !(attrs.categories instanceof Map)) {
    attrs.categories = fromJS(attrs.categories);
  }
  if (attrs.answered_order && !(attrs.answered_order instanceof List)) {
    attrs.answered_order = List(attrs.answered_order);
  }

  return new Game(attrs);
};

/**
 * Create a game with categories
 * @param {string[]} categoryIds - Array of category IDs
 * @param {Object} overrides - Additional overrides
 * @returns {Game} Game with categories
 */
export const createGameWithCategories = (categoryIds, overrides = {}) => {
  const categoriesMap = categoryIds.reduce((acc, id) => {
    acc[id] = true;
    return acc;
  }, {});

  return createGame({
    ...overrides,
    categories: fromJS(categoriesMap),
  });
};

/**
 * Create a game that has started (has answered categories)
 * @param {string[]} answeredCategoryIds - IDs of categories that have been answered
 * @param {Object} overrides - Additional overrides
 * @returns {Game} Game with answered order
 */
export const createGameInProgress = (answeredCategoryIds, overrides = {}) => {
  return createGame({
    ...overrides,
    answered_order: List(answeredCategoryIds),
  });
};

/**
 * Create a completed game (all categories answered)
 * @param {string[]} categoryIds - All category IDs (in answer order)
 * @param {Object} overrides - Additional overrides
 * @returns {Game} Completed game
 */
export const createCompletedGame = (categoryIds, overrides = {}) => {
  const categoriesMap = categoryIds.reduce((acc, id) => {
    acc[id] = true;
    return acc;
  }, {});

  return createGame({
    ...overrides,
    categories: fromJS(categoriesMap),
    answered_order: List(categoryIds),
  });
};
