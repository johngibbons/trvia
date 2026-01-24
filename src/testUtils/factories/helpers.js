import { faker } from "@faker-js/faker";

let idCounter = 1;

/**
 * Generate a unique ID for test entities
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} Unique ID
 */
export const generateId = (prefix = "") => {
  const id = `${prefix}${idCounter++}`;
  return id;
};

/**
 * Reset the ID counter (useful between test files)
 */
export const resetIdCounter = () => {
  idCounter = 1;
};

/**
 * Generate a random ID using faker
 * @returns {string} Random alphanumeric ID
 */
export const randomId = () => {
  return faker.string.alphanumeric(20);
};

/**
 * Pick a random item from an array
 * @param {Array} array - Array to pick from
 * @returns {*} Random item from the array
 */
export const pickRandom = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Generate an array of items using a factory function
 * @param {number} count - Number of items to generate
 * @param {Function} factory - Factory function to call
 * @param {Object|Function} overrides - Overrides for each item (can be function that receives index)
 * @returns {Array} Array of generated items
 */
export const generateMany = (count, factory, overrides = {}) => {
  return Array.from({ length: count }, (_, index) => {
    const itemOverrides =
      typeof overrides === "function" ? overrides(index) : overrides;
    return factory(itemOverrides);
  });
};

/**
 * Common test data constants
 */
export const AWARD_CATEGORIES = [
  "Best Picture",
  "Best Director",
  "Best Actor",
  "Best Actress",
  "Best Supporting Actor",
  "Best Supporting Actress",
  "Best Original Screenplay",
  "Best Adapted Screenplay",
  "Best Animated Feature",
  "Best International Feature",
  "Best Documentary Feature",
  "Best Original Score",
  "Best Original Song",
  "Best Sound",
  "Best Production Design",
  "Best Cinematography",
  "Best Makeup and Hairstyling",
  "Best Costume Design",
  "Best Film Editing",
  "Best Visual Effects",
  "Best Short Film (Animated)",
  "Best Short Film (Live Action)",
  "Best Documentary Short Subject",
];

export const MOVIE_NAMES = [
  "The Shawshank Redemption",
  "The Godfather",
  "The Dark Knight",
  "Pulp Fiction",
  "Forrest Gump",
  "Inception",
  "The Matrix",
  "Goodfellas",
  "The Silence of the Lambs",
  "Schindler's List",
  "Fight Club",
  "Star Wars",
  "The Lord of the Rings",
  "Gladiator",
  "The Departed",
  "Interstellar",
  "Whiplash",
  "The Grand Budapest Hotel",
  "Parasite",
  "Everything Everywhere All at Once",
];

export const ACTOR_NAMES = [
  "Morgan Freeman",
  "Leonardo DiCaprio",
  "Tom Hanks",
  "Meryl Streep",
  "Cate Blanchett",
  "Denzel Washington",
  "Joaquin Phoenix",
  "Frances McDormand",
  "Anthony Hopkins",
  "Viola Davis",
  "Brad Pitt",
  "Natalie Portman",
  "Robert De Niro",
  "Kate Winslet",
  "Daniel Day-Lewis",
  "Emma Stone",
  "Gary Oldman",
  "Olivia Colman",
  "Heath Ledger",
  "Michelle Yeoh",
];
