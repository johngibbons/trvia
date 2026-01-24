# CLAUDE.md

## Project Overview

This is a React application for award show prediction games (Oscars, Golden Globes). Users can create groups, submit entries with their predictions, and compete to see who correctly predicts the most winners.

## Tech Stack

- **React 18** with functional components
- **Redux** for state management with **Redux-Saga** for side effects
- **Immutable.js** for immutable state (Records and Maps)
- **Firebase** for authentication and realtime database
- **Material UI (MUI)** for component library
- **React Router v6** for routing

## Commands

```bash
# Development
npm start                    # Start dev server
npm run start:mock           # Start with mock data (basic scenario)
npm run start:mock:early     # Start with early game progress (3 categories answered)
npm run start:mock:progress  # Start with in-progress game (10 categories answered)
npm run start:mock:completed # Start with completed game scenario

# Testing
npm test                     # Run tests in watch mode
npm run test:unit            # Run unit tests only (excludes __integration__)
npm run test:integration     # Run integration tests only
npm run test:coverage        # Run tests with coverage report

# Build
npm run build               # Build for development
npm run build:staging       # Build for staging
npm run build:prod          # Build for production
```

### Mock Mode Notes

Mock mode persists state to localStorage, so changes you make (like scoring categories) will survive page refreshes and navigation:

- **First run**: Loads fresh mock scenario data
- **Subsequent runs**: Uses persisted state from your last session
- **To reset**: Open browser console and run `localStorage.removeItem('TRVIA')` then refresh

## Project Structure

```
src/
├── actions/           # Redux action creators and action types
├── awardsShows/       # Award show data files (nominees, categories)
├── components/        # React components
├── helpers/           # Utility functions
├── models/            # Immutable.js Record definitions
├── reducers/          # Redux reducers (use Immutable.js)
├── sagas/             # Redux-Saga generators
├── selectors/         # Reselect selectors
├── testUtils/         # Test utilities and factories
│   ├── factories/     # Factory functions for test data
│   ├── mocks/         # MSW handlers and server setup
│   └── *.js           # Test helper utilities
└── __integration__/   # Integration tests
```

## Testing Patterns

### Test Utilities

Use the custom test utilities in `src/testUtils/`:

```javascript
import { renderWithProviders } from "../../testUtils/testUtils";
import { ScenarioBuilder } from "../../testUtils/factories";
```

### Rendering Components

Always use `renderWithProviders` for component tests - it wraps with Redux Provider, MemoryRouter, and ThemeProvider:

```javascript
renderWithProviders(<MyComponent {...props} />, {
  preloadedState: scenario,
  initialEntries: [`/path/${id}`],
});
```

### Creating Test Data

Use `ScenarioBuilder` for complex test scenarios:

```javascript
const builder = new ScenarioBuilder()
  .withGame({ id: "game1", name: "97th Academy Awards" }, 5, 5) // 5 categories, 5 nominees each
  .withGroup("game1", { id: "group1", name: "Office Pool" })
  .withEntry("group1", { name: "Test User" }, "all-first")
  .withCurrentUser({ id: "user1", name: "Test User", email: "test@example.com" });

const scenario = builder.build();
const ids = builder.getIds(); // Get generated IDs
```

Use individual factories for simpler cases:

```javascript
import { createUser, createGame, createEntry } from "../../testUtils/factories";
```

### Custom Immutable.js Matchers

```javascript
expect(immutableA).toEqualImmutable(immutableB);
expect(immutableMap).toContainImmutableKey("key");
expect(immutableList).toHaveImmutableSize(3);
```

### Saga Testing

Test sagas using generator iteration:

```javascript
const generator = mySaga(action);
expect(generator.next().value).toEqual(call(API.someMethod, arg));
expect(generator.next(result).value).toEqual(put(someAction(result)));
```

### Reducer Testing

Reducers use Immutable.js, compare with `.toJS()`:

```javascript
const initialState = new Map().set("1", new Model(data));
const action = someAction(payload);
expect(reducer(initialState, action).toJS()).toEqual(expectedState.toJS());
```

## Key Conventions

1. **State is Immutable**: All Redux state uses Immutable.js Maps and Records
2. **Models are Records**: Domain objects are defined as Immutable Records in `src/models/`
3. **Firebase is mocked in tests**: See `src/setupTests.js` for global mocks
4. **Selectors use Reselect**: Memoized selectors in `src/selectors/`
5. **File naming**: Components use PascalCase, tests are `.test.js` files alongside source
