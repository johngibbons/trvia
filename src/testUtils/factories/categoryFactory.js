import { Map, fromJS } from "immutable";
import Category from "../../models/Category";
import { generateId, AWARD_CATEGORIES, pickRandom } from "./helpers";

/**
 * Default category attributes
 */
const defaultCategoryAttrs = () => ({
  id: generateId("category-"),
  key: generateId("cat-key-"),
  name: pickRandom(AWARD_CATEGORIES),
  game: undefined,
  nominees: new Map(),
  correctAnswer: null,
  order: 0,
  presentationOrder: 0,
  value: 1,
});

/**
 * Create a Category Immutable Record for testing
 * @param {Object} overrides - Attribute overrides
 * @returns {Category} Immutable Category Record
 */
export const createCategory = (overrides = {}) => {
  const attrs = {
    ...defaultCategoryAttrs(),
    ...overrides,
  };

  // Convert plain objects to Immutable structures
  if (attrs.nominees && !(attrs.nominees instanceof Map)) {
    attrs.nominees = fromJS(attrs.nominees);
  }

  return new Category(attrs);
};

/**
 * Create a category with nominees
 * @param {string[]} nomineeIds - Array of nominee IDs
 * @param {Object} overrides - Additional overrides
 * @returns {Category} Category with nominees
 */
export const createCategoryWithNominees = (nomineeIds, overrides = {}) => {
  const nomineesMap = nomineeIds.reduce((acc, id) => {
    acc[id] = true;
    return acc;
  }, {});

  return createCategory({
    ...overrides,
    nominees: fromJS(nomineesMap),
  });
};

/**
 * Create a category with a correct answer
 * @param {string} correctNomineeId - ID of the correct nominee
 * @param {Object} overrides - Additional overrides
 * @returns {Category} Category with correct answer set
 */
export const createAnsweredCategory = (correctNomineeId, overrides = {}) => {
  return createCategory({
    ...overrides,
    correctAnswer: correctNomineeId,
  });
};

/**
 * Create a category for a specific game
 * @param {string} gameId - ID of the game
 * @param {Object} overrides - Additional overrides
 * @returns {Category} Category linked to game
 */
export const createCategoryForGame = (gameId, overrides = {}) => {
  return createCategory({
    ...overrides,
    game: gameId,
  });
};

/**
 * Create multiple categories with sequential order
 * @param {number} count - Number of categories to create
 * @param {string} gameId - ID of the game
 * @param {Object} overrides - Additional overrides per category
 * @returns {Category[]} Array of categories
 */
export const createCategoriesWithOrder = (count, gameId, overrides = {}) => {
  return Array.from({ length: count }, (_, index) =>
    createCategory({
      game: gameId,
      order: index,
      presentationOrder: index,
      name: AWARD_CATEGORIES[index % AWARD_CATEGORIES.length],
      ...overrides,
    })
  );
};
