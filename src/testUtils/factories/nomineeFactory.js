import { faker } from "@faker-js/faker";
import Nominee from "../../models/Nominee";
import { generateId, MOVIE_NAMES, ACTOR_NAMES, pickRandom } from "./helpers";

/**
 * Default nominee attributes
 */
const defaultNomineeAttrs = () => ({
  id: generateId("nominee-"),
  key: generateId("nom-key-"),
  text: pickRandom(MOVIE_NAMES),
  secondaryText: pickRandom(ACTOR_NAMES),
  category: undefined,
  game: undefined,
  imageUrl: faker.image.url({ width: 300, height: 450 }),
  movieDBName: "",
});

/**
 * Create a Nominee Immutable Record for testing
 * @param {Object} overrides - Attribute overrides
 * @returns {Nominee} Immutable Nominee Record
 */
export const createNominee = (overrides = {}) => {
  const attrs = {
    ...defaultNomineeAttrs(),
    ...overrides,
  };

  return new Nominee(attrs);
};

/**
 * Create a nominee for a specific category
 * @param {string} categoryId - ID of the category
 * @param {string} gameId - ID of the game
 * @param {Object} overrides - Additional overrides
 * @returns {Nominee} Nominee linked to category and game
 */
export const createNomineeForCategory = (
  categoryId,
  gameId,
  overrides = {}
) => {
  return createNominee({
    category: categoryId,
    game: gameId,
    ...overrides,
  });
};

/**
 * Create multiple nominees for a category
 * @param {number} count - Number of nominees
 * @param {string} categoryId - ID of the category
 * @param {string} gameId - ID of the game
 * @param {Object} overrides - Additional overrides
 * @returns {Nominee[]} Array of nominees
 */
export const createNomineesForCategory = (
  count,
  categoryId,
  gameId,
  overrides = {}
) => {
  return Array.from({ length: count }, (_, index) =>
    createNominee({
      category: categoryId,
      game: gameId,
      text: MOVIE_NAMES[index % MOVIE_NAMES.length],
      secondaryText: ACTOR_NAMES[index % ACTOR_NAMES.length],
      ...overrides,
    })
  );
};

/**
 * Create a nominee with actor/movie style text
 * @param {string} movieName - Movie name
 * @param {string} actorName - Actor name
 * @param {Object} overrides - Additional overrides
 * @returns {Nominee} Nominee with specific text
 */
export const createActorNominee = (movieName, actorName, overrides = {}) => {
  return createNominee({
    text: actorName,
    secondaryText: movieName,
    ...overrides,
  });
};

/**
 * Create a nominee for a "Best Picture" style category
 * @param {string} movieName - Movie name
 * @param {Object} overrides - Additional overrides
 * @returns {Nominee} Nominee for Best Picture
 */
export const createMovieNominee = (movieName, overrides = {}) => {
  return createNominee({
    text: movieName,
    secondaryText: "",
    ...overrides,
  });
};
