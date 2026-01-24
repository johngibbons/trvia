import { runSaga } from "redux-saga";
import { Map } from "immutable";
import { createInitialState } from "./storeUtils";

/**
 * Record all actions dispatched by a saga
 *
 * @param {Generator} saga - The saga generator function
 * @param {Object} action - The action to pass to the saga (optional)
 * @param {Object} state - The initial state to use
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Object with dispatched actions and other info
 */
export const recordSaga = async (saga, action = {}, state = {}, options = {}) => {
  const dispatched = [];
  const initialState = createInitialState(state);

  const fakeStore = {
    getState: () => initialState,
    dispatch: (actionToDispatch) => dispatched.push(actionToDispatch),
  };

  await runSaga(
    {
      ...fakeStore,
      ...options,
    },
    saga,
    action
  ).toPromise();

  return {
    dispatched,
    // Helper to find a specific action
    findAction: (actionType) =>
      dispatched.find((a) => a.type === actionType),
    // Helper to check if action was dispatched
    hasAction: (actionType) =>
      dispatched.some((a) => a.type === actionType),
    // Get all actions of a type
    getActions: (actionType) =>
      dispatched.filter((a) => a.type === actionType),
  };
};

/**
 * Create a mock API object for saga testing
 * @param {Object} methods - Object mapping method names to mock implementations
 * @returns {Object} Mock API object
 */
export const createMockAPI = (methods = {}) => {
  const defaultMethods = {
    createGameId: jest.fn().mockResolvedValue("mock-game-id"),
    createGame: jest.fn().mockResolvedValue(undefined),
    fetchGame: jest.fn().mockResolvedValue({ name: "Mock Game" }),
    createGroupId: jest.fn().mockResolvedValue("mock-group-id"),
    createGroup: jest.fn().mockResolvedValue(undefined),
    fetchGroup: jest.fn().mockResolvedValue({ name: "Mock Group" }),
    createEntryId: jest.fn().mockResolvedValue("mock-entry-id"),
    createEntry: jest.fn().mockResolvedValue(undefined),
    fetchEntry: jest.fn().mockResolvedValue({ name: "Mock Entry" }),
    fetchUser: jest.fn().mockResolvedValue({ name: "Mock User" }),
    createUser: jest.fn().mockResolvedValue(undefined),
    updateEntry: jest.fn().mockResolvedValue(undefined),
    updateGame: jest.fn().mockResolvedValue(undefined),
    updateGroup: jest.fn().mockResolvedValue(undefined),
    updateCategory: jest.fn().mockResolvedValue(undefined),
    fetchEntries: jest.fn().mockResolvedValue([]),
    fetchUserGroups: jest.fn().mockResolvedValue([]),
    searchMovieDB: jest.fn().mockResolvedValue([]),
    fetchMovieDBPerson: jest.fn().mockResolvedValue({}),
  };

  return {
    ...defaultMethods,
    ...methods,
  };
};

/**
 * Test helper to create a saga test context
 *
 * Usage:
 * const context = createSagaTestContext({ api: mockAPI });
 * const result = await context.run(mySaga, myAction);
 * expect(result.hasAction('MY_ACTION_SUCCESS')).toBe(true);
 */
export const createSagaTestContext = ({ api = {}, state = {} } = {}) => {
  const mockAPI = createMockAPI(api);
  const initialState = createInitialState(state);

  return {
    api: mockAPI,
    state: initialState,
    run: (saga, action) =>
      recordSaga(saga, action, state, {
        context: { api: mockAPI },
      }),
    getState: () => initialState,
  };
};

/**
 * Create generator step tester for step-by-step saga testing
 *
 * Usage:
 * const tester = createSagaStepTester(mySaga(myAction));
 * expect(tester.next().value).toEqual(call(api.fetchSomething));
 * expect(tester.next(mockResult).value).toEqual(put(someAction()));
 */
export const createSagaStepTester = (generator) => {
  let lastValue;

  return {
    next: (value) => {
      const result = generator.next(value);
      lastValue = result.value;
      return result;
    },
    throw: (error) => {
      return generator.throw(error);
    },
    getValue: () => lastValue,
    isDone: () => {
      const result = generator.next();
      return result.done;
    },
  };
};

/**
 * Mock Firebase calls for saga testing
 */
export const mockFirebaseCalls = () => {
  const mocks = {
    ref: jest.fn().mockReturnThis(),
    set: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    once: jest.fn().mockResolvedValue({ val: () => ({}) }),
    on: jest.fn(),
    off: jest.fn(),
    push: jest.fn().mockReturnValue({ key: "mock-key" }),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  return {
    database: () => mocks,
    ...mocks,
  };
};
