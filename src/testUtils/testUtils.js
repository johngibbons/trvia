import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { createTestStore, createTestStoreWithSagas } from "./storeUtils";

// Default theme matching the app
const theme = createTheme({
  palette: {
    primary: {
      main: "#b7a261",
    },
    text: {
      primary: "#424242",
    },
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell","Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  },
});

/**
 * Custom render function that wraps components with all necessary providers
 *
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @param {Object} options.preloadedState - Initial Redux state
 * @param {Object} options.store - Custom store (uses createTestStore if not provided)
 * @param {string} options.route - Initial route (default: '/')
 * @param {string[]} options.initialEntries - MemoryRouter initial entries
 * @param {boolean} options.withSagas - Whether to include saga middleware
 * @returns {Object} Render result with store reference
 */
export const renderWithProviders = (
  ui,
  {
    preloadedState = {},
    store = null,
    route = "/",
    initialEntries = null,
    withSagas = false,
    ...renderOptions
  } = {}
) => {
  // Create store based on options
  let testStore;
  let sagaCleanup;

  if (store) {
    testStore = store;
  } else if (withSagas) {
    const storeWithSagas = createTestStoreWithSagas(preloadedState);
    testStore = storeWithSagas.store;
    sagaCleanup = storeWithSagas.cleanup;
  } else {
    testStore = createTestStore(preloadedState);
  }

  // Determine router initial entries
  const routerEntries = initialEntries || [route];

  const AllProviders = ({ children }) => {
    return (
      <Provider store={testStore}>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={routerEntries}>{children}</MemoryRouter>
        </ThemeProvider>
      </Provider>
    );
  };

  const renderResult = render(ui, { wrapper: AllProviders, ...renderOptions });

  return {
    ...renderResult,
    store: testStore,
    cleanup: sagaCleanup,
    // Helper to rerender with new state
    rerenderWithState: (newState) => {
      Object.keys(newState).forEach((key) => {
        testStore.dispatch({ type: "@@TEST/SET_STATE", key, value: newState[key] });
      });
      renderResult.rerender(ui);
    },
  };
};

/**
 * Render with providers and props simulation for components that receive route params
 *
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} routeParams - Route params to simulate
 * @param {Object} options - Additional render options
 * @returns {Object} Render result
 */
export const renderWithRouteParams = (ui, routeParams, options = {}) => {
  // Clone element with routeParams prop
  const elementWithProps = React.cloneElement(ui, {
    routeParams,
  });

  return renderWithProviders(elementWithProps, options);
};

/**
 * Create props object for components that use routeParams
 * @param {Object} params - Route parameters
 * @returns {Object} Props with routeParams
 */
export const createRouteProps = (params) => ({
  routeParams: params,
});

/**
 * Wait for an element to appear with a timeout
 * @param {Function} queryFn - Query function that returns the element
 * @param {number} timeout - Timeout in ms
 * @returns {Promise} Resolves when element is found
 */
export const waitForElement = async (queryFn, timeout = 5000) => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const element = queryFn();
      if (element) return element;
    } catch (e) {
      // Element not found yet
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  throw new Error(`Element not found within ${timeout}ms`);
};

/**
 * Flush all pending promises and timers
 * Useful for testing async operations
 */
export const flushPromises = () =>
  new Promise((resolve) => setImmediate(resolve));

/**
 * Create a mock function that tracks calls
 * @returns {Object} Mock function with tracking
 */
export const createMockFn = () => {
  const calls = [];
  const fn = (...args) => {
    calls.push(args);
    return fn.mockReturnValue;
  };
  fn.calls = calls;
  fn.mockReturnValue = undefined;
  fn.mockReturn = (value) => {
    fn.mockReturnValue = value;
    return fn;
  };
  fn.reset = () => {
    calls.length = 0;
  };
  return fn;
};

// Re-export everything from testing library
export * from "@testing-library/react";
