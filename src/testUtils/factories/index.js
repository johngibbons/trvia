// Factory helpers
export {
  generateId,
  resetIdCounter,
  randomId,
  pickRandom,
  generateMany,
  AWARD_CATEGORIES,
  MOVIE_NAMES,
  ACTOR_NAMES,
} from "./helpers";

// User factories
export {
  createUser,
  createUserWithEntries,
  createUserWithGroups,
  createMinimalUser,
} from "./userFactory";

// Game factories
export {
  createGame,
  createGameWithCategories,
  createGameInProgress,
  createCompletedGame,
} from "./gameFactory";

// Category factories
export {
  createCategory,
  createCategoryWithNominees,
  createAnsweredCategory,
  createCategoryForGame,
  createCategoriesWithOrder,
} from "./categoryFactory";

// Nominee factories
export {
  createNominee,
  createNomineeForCategory,
  createNomineesForCategory,
  createActorNominee,
  createMovieNominee,
} from "./nomineeFactory";

// Group factories
export {
  createGroup,
  createGroupWithEntries,
  createGroupForGame,
  createGroupWithValues,
  createGroupWithAdmin,
  createCompleteGroup,
} from "./groupFactory";

// Entry factories
export {
  createEntry,
  createEntryWithSelections,
  createEntryForUser,
  createEntryForGroup,
  createScoredEntry,
  createCompleteEntry,
  createEntriesWithRandomSelections,
} from "./entryFactory";

// UI factories
export {
  createUI,
  createUIWithModal,
  createUIWithAlert,
  createUIWithValues,
  createUIWithPreviousRanks,
  createUIForNewEntry,
  createUIForNewGroup,
  createAdmin,
  createAdminWithSearchResults,
} from "./uiFactory";

// Scenario builder
export { ScenarioBuilder, scenarios } from "./scenarioBuilder";
