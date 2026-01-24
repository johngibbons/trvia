import { Map, fromJS } from "immutable";
import { UI } from "../../models/UI";
import { Admin } from "../../models/Admin";
import { List } from "immutable";

/**
 * Default UI state attributes
 */
const defaultUIAttrs = () => ({
  modal: undefined,
  isAlertBarOpen: false,
  isAlertBarError: false,
  alertBarMessage: "",
  searchValue: "",
  newGameName: "",
  newGroupName: "",
  newEntryName: "",
  values: new Map(),
  nextLocation: "",
  previousRanks: new Map(),
});

/**
 * Create a UI Immutable Record for testing
 * @param {Object} overrides - Attribute overrides
 * @returns {UI} Immutable UI Record
 */
export const createUI = (overrides = {}) => {
  const attrs = {
    ...defaultUIAttrs(),
    ...overrides,
  };

  // Convert plain objects to Immutable structures
  if (attrs.values && !(attrs.values instanceof Map)) {
    attrs.values = fromJS(attrs.values);
  }
  if (attrs.previousRanks && !(attrs.previousRanks instanceof Map)) {
    attrs.previousRanks = fromJS(attrs.previousRanks);
  }

  return new UI(attrs);
};

/**
 * Create UI state with an open modal
 * @param {string} modalName - Name of the modal to open
 * @param {Object} overrides - Additional overrides
 * @returns {UI} UI with modal open
 */
export const createUIWithModal = (modalName, overrides = {}) => {
  return createUI({
    ...overrides,
    modal: modalName,
  });
};

/**
 * Create UI state with alert bar showing
 * @param {string} message - Alert message
 * @param {boolean} isError - Whether it's an error alert
 * @param {Object} overrides - Additional overrides
 * @returns {UI} UI with alert bar
 */
export const createUIWithAlert = (message, isError = false, overrides = {}) => {
  return createUI({
    ...overrides,
    isAlertBarOpen: true,
    isAlertBarError: isError,
    alertBarMessage: message,
  });
};

/**
 * Create UI state with form values
 * @param {Object} values - Form values map
 * @param {Object} overrides - Additional overrides
 * @returns {UI} UI with form values
 */
export const createUIWithValues = (values, overrides = {}) => {
  return createUI({
    ...overrides,
    values: fromJS(values),
  });
};

/**
 * Create UI state with previous ranks (for rank change tracking)
 * @param {Object} ranks - Map of entryId to previous rank
 * @param {Object} overrides - Additional overrides
 * @returns {UI} UI with previous ranks
 */
export const createUIWithPreviousRanks = (ranks, overrides = {}) => {
  return createUI({
    ...overrides,
    previousRanks: fromJS(ranks),
  });
};

/**
 * Create UI state for new entry flow
 * @param {string} entryName - Name for the new entry
 * @param {Object} overrides - Additional overrides
 * @returns {UI} UI configured for new entry
 */
export const createUIForNewEntry = (entryName, overrides = {}) => {
  return createUI({
    ...overrides,
    newEntryName: entryName,
    modal: "newEntry",
  });
};

/**
 * Create UI state for new group flow
 * @param {string} groupName - Name for the new group
 * @param {Object} overrides - Additional overrides
 * @returns {UI} UI configured for new group
 */
export const createUIForNewGroup = (groupName, overrides = {}) => {
  return createUI({
    ...overrides,
    newGroupName: groupName,
    modal: "newGroup",
  });
};

/**
 * Default Admin state attributes
 */
const defaultAdminAttrs = () => ({
  searchResults: new List(),
});

/**
 * Create an Admin Immutable Record for testing
 * @param {Object} overrides - Attribute overrides
 * @returns {Admin} Immutable Admin Record
 */
export const createAdmin = (overrides = {}) => {
  const attrs = {
    ...defaultAdminAttrs(),
    ...overrides,
  };

  // Convert arrays to List
  if (attrs.searchResults && !(attrs.searchResults instanceof List)) {
    attrs.searchResults = List(attrs.searchResults);
  }

  return new Admin(attrs);
};

/**
 * Create Admin state with search results
 * @param {Array} results - Search results array
 * @param {Object} overrides - Additional overrides
 * @returns {Admin} Admin with search results
 */
export const createAdminWithSearchResults = (results, overrides = {}) => {
  return createAdmin({
    ...overrides,
    searchResults: List(results),
  });
};
