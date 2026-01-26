import {
  watchCreateGame,
  createGame,
  syncGames,
  fetchGameAndDependents,
  fetchGame,
  watchFetchGame,
  toggleCorrectNominee,
  watchSelectCorrectNominee,
  syncCategories,
} from "./gameSaga";

import { CREATE_GAME, FETCH_GAME, TOGGLE_CORRECT_NOMINEE } from "../actions/action-types";
import * as actions from "../actions/game-actions";
import { setCategories, setCategory, toggleCorrectNominee as toggleCorrectNomineeAction } from "../actions/category-actions";
import { setNominees } from "../actions/nominee-actions";
import { captureRankings } from "../actions/ui-actions";
import { allEntryRanksSelector } from "../selectors/entries-selector";

import { fork, takeLatest, call, put, select } from "redux-saga/effects";
import API from "../api";
import { get, sync, remove, CHILD_CHANGED } from "./firebase-saga";
import { ref, query, orderByChild, equalTo, get as firebaseGet } from "firebase/database";
import { database } from "../firebaseSetup";
import { Map, List } from "immutable";
import Game from "../models/Game";
import Category from "../models/Category";
import Nominee from "../models/Nominee";
import Entry from "../models/Entry";
import User from "../models/User";
import Group from "../models/Group";

describe("game saga", () => {
  describe("watchCreateGame", () => {
    it("should watch for game create", () => {
      const generator = watchCreateGame();
      expect(generator.next().value).toEqual(
        fork(takeLatest, CREATE_GAME, createGame)
      );
    });
  });

  describe("createGame", () => {
    it("should create a game", () => {
      const action = actions.createGame("New Game");
      const generator = createGame(action);
      expect(generator.next().value).toEqual(call(API.createGameId, null));
      const newGameId = "abc";
      expect(generator.next(newGameId).value).toEqual(
        call(API.createGame, newGameId, action.payload)
      );
    });

    it("should dispatch createGameSuccess and redirect", () => {
      const action = actions.createGame("New Game");
      const generator = createGame(action);
      generator.next(); // skip createGameId
      const newGameId = "game123";
      generator.next(newGameId); // skip createGame call

      expect(generator.next().value).toEqual(
        put(actions.createGameSuccess(newGameId, action.payload))
      );
    });
  });

  describe("fetchGameAndDependents", () => {
    it("should fetch game, categories, and nominees from Firebase when not in store", () => {
      const gameId = "game1";
      const generator = fetchGameAndDependents(gameId);

      // Check for existing game in store
      const selectGamesEffect = generator.next().value;
      expect(selectGamesEffect).toHaveProperty("SELECT");

      // No existing game
      const emptyGames = new Map();
      const game = new Game({ id: gameId, name: "Test Game" });
      expect(generator.next(emptyGames).value).toEqual(call(get, "games", gameId));

      // Put the game
      expect(generator.next(game).value).toEqual(put(actions.setGame(game)));

      // Query for categories - just verify it's a call to firebaseGet
      const categoriesQueryEffect = generator.next().value;
      expect(categoriesQueryEffect).toHaveProperty("CALL");
      expect(categoriesQueryEffect.CALL.fn).toBe(firebaseGet);

      // Put categories
      const categoriesSnapshot = { val: () => ({ cat1: { id: "cat1" } }) };
      expect(generator.next(categoriesSnapshot).value).toEqual(
        put(setCategories({ cat1: { id: "cat1" } }))
      );

      // Query for nominees - just verify it's a call to firebaseGet
      const nomineesQueryEffect = generator.next().value;
      expect(nomineesQueryEffect).toHaveProperty("CALL");
      expect(nomineesQueryEffect.CALL.fn).toBe(firebaseGet);

      // Put nominees
      const nomineesSnapshot = { val: () => ({ nom1: { id: "nom1" } }) };
      expect(generator.next(nomineesSnapshot).value).toEqual(
        put(setNominees({ nom1: { id: "nom1" } }))
      );
    });

    it("should skip fetching if game and dependencies already exist in store", () => {
      const gameId = "game1";
      const generator = fetchGameAndDependents(gameId);

      // Check for existing game in store
      const selectGamesEffect = generator.next().value;
      expect(selectGamesEffect).toHaveProperty("SELECT");

      // Game exists
      const games = new Map({ game1: new Game({ id: gameId }) });
      const selectCategoriesEffect = generator.next(games).value;
      expect(selectCategoriesEffect).toHaveProperty("SELECT");

      // Categories exist for this game
      const categories = new Map({
        cat1: new Category({ id: "cat1", game: gameId }),
      });
      const selectNomineesEffect = generator.next(categories).value;
      expect(selectNomineesEffect).toHaveProperty("SELECT");

      // Nominees exist for this game
      const nominees = new Map({
        nom1: new Nominee({ id: "nom1", game: gameId }),
      });
      const result = generator.next(nominees);

      // Should be done without fetching
      expect(result.done).toBe(true);
    });
  });

  describe("fetchGame", () => {
    it("should call fetchGameAndDependents", () => {
      const action = actions.fetchGame("game1");
      const generator = fetchGame(action);

      expect(generator.next().value).toEqual(
        call(fetchGameAndDependents, action.payload.id)
      );
    });

    it("should handle errors gracefully", () => {
      const action = actions.fetchGame("game1");
      const generator = fetchGame(action);

      generator.next(); // skip fetchGameAndDependents call
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const error = new Error("Fetch failed");

      generator.throw(error);

      expect(consoleSpy).toHaveBeenCalledWith(error);
      consoleSpy.mockRestore();
    });
  });

  describe("watchFetchGame", () => {
    it("should watch for fetch game", () => {
      const generator = watchFetchGame();
      expect(generator.next().value).toEqual(
        fork(takeLatest, FETCH_GAME, fetchGame)
      );
    });
  });

  describe("toggleCorrectNominee - Production Mode", () => {
    const originalEnv = process.env.REACT_APP_USE_MOCK_DATA;

    beforeEach(() => {
      process.env.REACT_APP_USE_MOCK_DATA = "false";
    });

    afterEach(() => {
      process.env.REACT_APP_USE_MOCK_DATA = originalEnv;
    });

    it("should score a category when nominee is selected", () => {
      const nominee = new Nominee({
        id: "nom1",
        category: "cat1",
        game: "game1",
      });
      const action = toggleCorrectNomineeAction(nominee);
      const generator = toggleCorrectNominee(action);

      // Get current correctAnswer
      expect(generator.next().value).toEqual(
        call(get, `categories/${nominee.category}`, "correctAnswer")
      );

      // No current answer (isScoring = true)
      const currentId = null;
      expect(generator.next(currentId).value).toEqual(
        select(allEntryRanksSelector)
      );

      // Capture current ranks
      const currentRanks = new Map({ entry1: 1 });
      expect(generator.next(currentRanks).value).toEqual(
        put(captureRankings(currentRanks))
      );

      // Select the nominee
      expect(generator.next().value).toEqual(
        call(API.selectCorrectNominee, nominee)
      );
    });

    it("should unscore a category when nominee is toggled off", () => {
      const nominee = new Nominee({
        id: "nom1",
        category: "cat1",
        game: "game1",
      });
      const action = toggleCorrectNomineeAction(nominee);
      const generator = toggleCorrectNominee(action);

      // Get current correctAnswer
      expect(generator.next().value).toEqual(
        call(get, `categories/${nominee.category}`, "correctAnswer")
      );

      // Same nominee is already selected (isScoring = false)
      const currentId = "nom1";
      expect(generator.next(currentId).value).toEqual(
        call(remove, `/categories/${nominee.category}`, "correctAnswer")
      );
    });
  });

  describe("toggleCorrectNominee - Mock Mode", () => {
    const originalEnv = process.env.REACT_APP_USE_MOCK_DATA;

    beforeEach(() => {
      process.env.REACT_APP_USE_MOCK_DATA = "true";
    });

    afterEach(() => {
      process.env.REACT_APP_USE_MOCK_DATA = originalEnv;
    });

    it("should handle scoring in mock mode", () => {
      const nominee = new Nominee({
        id: "nom1",
        category: "cat1",
        game: "game1",
      });
      const action = toggleCorrectNomineeAction(nominee);
      const generator = toggleCorrectNominee(action);

      // Get categories to check current state
      const selectCategoriesEffect = generator.next().value;
      expect(selectCategoriesEffect).toHaveProperty("SELECT");

      // Category has a correctAnswer (reducer already updated)
      const categories = new Map({
        cat1: new Category({ id: "cat1", correctAnswer: "nom1" }),
      });
      const selectGamesEffect = generator.next(categories).value;
      expect(selectGamesEffect).toHaveProperty("SELECT");

      // Provide game state
      const games = new Map({
        game1: new Game({ id: "game1", categories: ["cat1"] }),
      });
      const selectGroupsEffect = generator.next(games).value;
      expect(selectGroupsEffect).toHaveProperty("SELECT");
    });
  });

  describe("watchSelectCorrectNominee", () => {
    it("should watch for toggle correct nominee", () => {
      const generator = watchSelectCorrectNominee();
      expect(generator.next().value).toEqual(
        fork(takeLatest, TOGGLE_CORRECT_NOMINEE, toggleCorrectNominee)
      );
    });
  });

  describe("syncGames", () => {
    it("should sync games with Firebase listener", () => {
      const generator = syncGames();
      expect(generator.next().value).toEqual(
        fork(sync, "games", {
          [CHILD_CHANGED]: actions.setGameAttr,
        })
      );
    });
  });

  describe("syncCategories", () => {
    it("should sync categories with Firebase listener", () => {
      const generator = syncCategories();
      expect(generator.next().value).toEqual(
        fork(sync, "categories", {
          [CHILD_CHANGED]: setCategory,
        })
      );
    });
  });
});
