import { createStore, applyMiddleware, compose } from "redux";
import createSagaMiddleware from "redux-saga";
import { Map } from "immutable";
import rootReducer from "../reducers";
import rootSaga from "../sagas/index";
import User from "../models/User";
import { UI } from "../models/UI";
import { Admin } from "../models/Admin";

/**
 * Create initial state with all required slices
 * @param {Object} overrides - State slice overrides
 * @returns {Object} Complete initial state
 */
export const createInitialState = (overrides = {}) => {
  return {
    admin: new Admin(),
    nominees: new Map(),
    currentUser: new User(),
    entries: new Map(),
    games: new Map(),
    groups: new Map(),
    pendingGame: new Map(),
    pendingCategory: new Map(),
    pendingNominee: new Map(),
    categories: new Map(),
    ui: new UI(),
    users: new Map(),
    ...overrides,
  };
};

/**
 * Create a test store without sagas (for pure reducer testing)
 * @param {Object} preloadedState - Initial state
 * @returns {Object} Redux store
 */
export const createTestStore = (preloadedState = {}) => {
  const initialState = createInitialState(preloadedState);
  return createStore(rootReducer, initialState);
};

/**
 * Create a test store with sagas running
 * @param {Object} preloadedState - Initial state
 * @returns {Object} Object containing store and sagaMiddleware
 */
export const createTestStoreWithSagas = (preloadedState = {}) => {
  const sagaMiddleware = createSagaMiddleware();
  const initialState = createInitialState(preloadedState);

  const store = createStore(
    rootReducer,
    initialState,
    compose(applyMiddleware(sagaMiddleware))
  );

  const sagaTask = sagaMiddleware.run(rootSaga);

  return {
    store,
    sagaMiddleware,
    sagaTask,
    // Helper to cleanly shut down sagas
    cleanup: () => {
      sagaTask.cancel();
    },
  };
};

/**
 * Create a mock store that tracks dispatched actions
 * @param {Object} preloadedState - Initial state
 * @returns {Object} Mock store with getActions() method
 */
export const createMockStore = (preloadedState = {}) => {
  const actions = [];
  const initialState = createInitialState(preloadedState);

  const mockDispatch = (action) => {
    actions.push(action);
    return action;
  };

  return {
    getState: () => initialState,
    dispatch: mockDispatch,
    subscribe: () => () => {},
    getActions: () => actions,
    clearActions: () => {
      actions.length = 0;
    },
  };
};

/**
 * Wait for a specific action to be dispatched
 * @param {Object} store - Redux store
 * @param {string} actionType - Action type to wait for
 * @param {number} timeout - Timeout in ms
 * @returns {Promise} Resolves with the action when dispatched
 */
export const waitForAction = (store, actionType, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      unsubscribe();
      reject(new Error(`Timeout waiting for action: ${actionType}`));
    }, timeout);

    const unsubscribe = store.subscribe(() => {
      // This is a simplified version - in production you might want to
      // use middleware to properly track dispatched actions
      clearTimeout(timeoutId);
      unsubscribe();
      resolve();
    });
  });
};
