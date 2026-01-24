import { createStore, applyMiddleware, compose } from "redux";
import createSagaMiddleware from "redux-saga";
import rootReducer from "./reducers";
import rootSaga from "./sagas/index";
import persistState from "redux-localstorage";
import { Map, fromJS } from "immutable";
import Nominee from "./models/Nominee";
import Entry from "./models/Entry";
import Game from "./models/Game";
import Group from "./models/Group";
import Category from "./models/Category";
import User from "./models/User";
import { UI } from "./models/UI";
import { isMockMode, getMockInitialState } from "./testUtils/mockDataProvider";

const sagaMiddleware = createSagaMiddleware();

// Check if we're in mock mode
const useMockData = isMockMode();

// In mock mode, check if we have persisted state first
// If no persisted state exists, use mock initial state
let initialState;
if (useMockData) {
  console.log("🎭 Mock Mode Enabled - Using local test data");
  console.log(
    `📊 Mock Scenario: ${process.env.REACT_APP_MOCK_SCENARIO || "basic"}`
  );

  // Check if there's persisted state in localStorage
  const persistedState = localStorage.getItem("TRVIA");
  if (persistedState) {
    console.log("📦 Found persisted state - using it instead of fresh mock data");
    console.log("   (To reset, clear localStorage or run: localStorage.removeItem('TRVIA'))");
    initialState = undefined; // Let persistState handle restoration
  } else {
    console.log("📦 No persisted state - loading fresh mock scenario");
    initialState = getMockInitialState();
  }
} else {
  initialState = undefined;
}

// Always use persistState - it allows navigation without losing changes
const middleware = compose(
  applyMiddleware(sagaMiddleware),
  persistState(
    ["nominees", "entries", "games", "groups", "categories", "users", "ui", "currentUser"],
    {
      key: "TRVIA",
          serialize(data) {
            const isMockMode = process.env.REACT_APP_USE_MOCK_DATA === "true";
            const serialized = Object.keys(data).reduce(
              (acc, key) => ({ ...acc, [key]: data[key].toJS() }),
              {}
            );
            if (isMockMode && data.ui && data.ui.previousRanks) {
              console.log("💾 Serializing state - ui.previousRanks:", data.ui.previousRanks.toJS());
            }
            return JSON.stringify(serialized);
          },
          deserialize(data) {
            if (!data) return;
            const jsObj = JSON.parse(data);
            if (!jsObj) return;
            return Object.keys(jsObj).reduce((acc, key) => {
              switch (key) {
                case "nominees": {
                  const nominees = jsObj[key];
                  return {
                    ...acc,
                    [key]: Object.keys(nominees).reduce((acc, id) => {
                      return acc.set(id, new Nominee(fromJS(nominees[id])));
                    }, new Map()),
                  };
                }
                case "entries": {
                  const entries = jsObj[key];
                  return {
                    ...acc,
                    [key]: Object.keys(entries).reduce((acc, id) => {
                      return acc.set(id, new Entry(fromJS(entries[id])));
                    }, new Map()),
                  };
                }
                case "games": {
                  const games = jsObj[key];
                  return {
                    ...acc,
                    [key]: Object.keys(games).reduce((acc, id) => {
                      return acc.set(id, new Game(fromJS(games[id])));
                    }, new Map()),
                  };
                }
                case "groups": {
                  const groups = jsObj[key];
                  return {
                    ...acc,
                    [key]: Object.keys(groups).reduce((acc, id) => {
                      return acc.set(id, new Group(fromJS(groups[id])));
                    }, new Map()),
                  };
                }
                case "categories": {
                  const categories = jsObj[key];
                  return {
                    ...acc,
                    [key]: Object.keys(categories).reduce((acc, id) => {
                      return acc.set(id, new Category(fromJS(categories[id])));
                    }, new Map()),
                  };
                }
                case "users": {
                  const users = jsObj[key];
                  return {
                    ...acc,
                    [key]: Object.keys(users).reduce((acc, id) => {
                      return acc.set(id, new User(fromJS(users[id])));
                    }, new Map()),
                  };
                }
                case "ui": {
                  const ui = jsObj[key];
                  const isMockMode = process.env.REACT_APP_USE_MOCK_DATA === "true";
                  if (isMockMode) {
                    console.log("💾 Deserializing ui state:", ui);
                    console.log("💾 ui.previousRanks:", ui.previousRanks);
                  }
                  // Create UI Record with restored data, ensuring defaults for missing fields
                  return {
                    ...acc,
                    [key]: new UI(fromJS(ui)),
                  };
                }
                case "currentUser": {
                  const currentUser = jsObj[key];
                  return {
                    ...acc,
                    [key]: new User(fromJS(currentUser)),
                  };
                }
                default:
                  return undefined;
              }
            }, {});
          },
        }
      )
);

const store = createStore(rootReducer, initialState, middleware);

sagaMiddleware.run(rootSaga);

export default store;
