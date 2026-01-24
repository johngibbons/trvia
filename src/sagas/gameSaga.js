import { takeLatest, fork, call, put, select } from "redux-saga/effects";
import {
  CREATE_GAME,
  FETCH_GAME,
  TOGGLE_CORRECT_NOMINEE,
} from "../actions/action-types";
import { createGameSuccess, setGame, updateAnsweredOrder } from "../actions/game-actions";
import { setCategories, setCategory } from "../actions/category-actions";
import { setNominees } from "../actions/nominee-actions";
import { captureRankings } from "../actions/ui-actions";
import { allEntryRanksSelector } from "../selectors/entries-selector";
import API from "../api";
import { ref, query, orderByChild, equalTo, get as firebaseGet } from "firebase/database";
import { database } from "../firebaseSetup";
import { get, sync, remove, CHILD_CHANGED } from "./firebase-saga";
import { Map, List } from "immutable";
import Entry from "../models/Entry";
import User from "../models/User";

export function* createGame(action) {
  const newGameId = yield call(API.createGameId, null);
  yield call(API.createGame, newGameId, action.payload);
  yield put(createGameSuccess(newGameId, action.payload));
  window.location.href = `/games/${newGameId}/edit`;
}

export function* watchCreateGame() {
  yield fork(takeLatest, CREATE_GAME, createGame);
}

export function* fetchGameAndDependents(gameId) {
  // Check if game already exists in store (useful for mock mode)
  const existingGames = yield select((state) => state.games);
  const existingGame = existingGames.get(gameId);

  if (existingGame) {
    // Game already in store, check if categories and nominees are also loaded
    const categories = yield select((state) => state.categories);
    const nominees = yield select((state) => state.nominees);

    // If we have categories and nominees for this game, we're done
    const hasCategories = categories.some((cat) => cat.game === gameId);
    const hasNominees = nominees.some((nom) => nom.game === gameId);

    if (hasCategories && hasNominees) {
      return; // Everything already loaded
    }
  }

  // Need to fetch from Firebase
  const game = yield call(get, "games", gameId);
  yield put(setGame(game));
  const categoriesQuery = query(
    ref(database, "categories"),
    orderByChild("game"),
    equalTo(game.id)
  );
  const categories = yield call(firebaseGet, categoriesQuery);
  yield put(setCategories(categories.val()));
  const nomineesQuery = query(
    ref(database, "nominees"),
    orderByChild("game"),
    equalTo(game.id)
  );
  const nominees = yield call(firebaseGet, nomineesQuery);
  yield put(setNominees(nominees.val()));
}

export function* fetchGame(action) {
  try {
    yield call(fetchGameAndDependents, action.payload.id);
  } catch (errors) {
    console.log(errors);
  }
}

export function* watchFetchGame() {
  yield fork(takeLatest, FETCH_GAME, fetchGame);
}

export function* toggleCorrectNominee(action) {
  const { nominee } = action.payload;
  try {
    const isMockMode = process.env.REACT_APP_USE_MOCK_DATA === "true";

    if (isMockMode) {
      console.log("🎭 Mock mode: Toggling nominee", nominee.id, "for category", nominee.category);

      // NOTE: The saga runs AFTER the reducer has already processed TOGGLE_CORRECT_NOMINEE
      // So the correctAnswer is already updated in state by now.
      // We need to reconstruct what the rankings were BEFORE this action.

      // Check the CURRENT state (which is already updated by reducer)
      const categories = yield select((state) => state.categories);
      const category = categories.get(nominee.category);
      const correctAnswerAfterToggle = category ? category.correctAnswer : null;

      console.log("🎭 correctAnswer AFTER reducer:", correctAnswerAfterToggle);

      // Determine isScoring based on whether category now has a correctAnswer
      // If it has a correctAnswer, we just set it (isScoring = true)
      // If it doesn't have a correctAnswer, we just removed it (isScoring = false)
      const isScoring = !!correctAnswerAfterToggle;

      console.log("🎭 isScoring:", isScoring, "(will", isScoring ? "ADD to" : "REMOVE from", "answered_order)");

      // To show rank changes, we need rankings from BEFORE this toggle
      // Temporarily remove the correctAnswer, calculate ranks, then capture those as "previous"
      if (isScoring) {
        // We just scored this category, so calculate what ranks were BEFORE scoring
        const categoriesBeforeScoring = categories.deleteIn([nominee.category, "correctAnswer"]);
        const games = yield select((state) => state.games);
        const groups = yield select((state) => state.groups);
        const entries = yield select((state) => state.entries);

        // Calculate ranks with the category unscored
        let ranksBeforeScoring = new Map();
        groups.forEach((group) => {
          if (!group || !group.entries) return;

          const rankedEntries = group.entries
            .keySeq()
            .map((key) => {
              const entry = entries.get(key);
              if (!entry) return new Entry({ user: new User() });

              // Calculate score WITHOUT the newly scored category
              const game = games.get(entry.game);
              const gameCategories = game ? game.categories : [];
              const score = gameCategories.reduce((acc, _, categoryId) => {
                const cat = categoriesBeforeScoring.get(categoryId);
                return cat &&
                  cat.correctAnswer &&
                  cat.correctAnswer === entry.selections.get(cat.id)
                  ? acc + group.values.get(cat.id)
                  : acc;
              }, 0);

              return entry.set("score", score);
            })
            .sort((entryA, entryB) => entryB.score - entryA.score)
            .reduce((entries, curr) => {
              const withSameRank = entries.filter(
                (entry) => entry.score === entries.last().score
              ).size;
              return entries.last() && entries.last().score > curr.score
                ? entries.push(curr.set("rank", entries.last().rank + withSameRank))
                : entries.push(curr.set("rank", entries.last() ? entries.last().rank : 1));
            }, new List());

          rankedEntries.forEach((entry) => {
            if (entry.id) {
              ranksBeforeScoring = ranksBeforeScoring.set(entry.id, entry.rank);
            }
          });
        });

        console.log("🎭 Captured rankings BEFORE scoring:", ranksBeforeScoring.toJS());
        yield put(captureRankings(ranksBeforeScoring));
      } else {
        // We just unscored this category, capture current ranks as "previous"
        const currentRanks = yield select(allEntryRanksSelector);
        console.log("🎭 Captured current rankings (after unscoring):", currentRanks.toJS());
        yield put(captureRankings(currentRanks));
      }

      // Update the answered order for the game
      yield put(updateAnsweredOrder(nominee.game, nominee.category, isScoring));
      console.log("🎭 Dispatched UPDATE_ANSWERED_ORDER");
    } else {
      // Normal Firebase mode
      // Capture current rankings before scoring changes
      const currentRanks = yield select(allEntryRanksSelector);
      yield put(captureRankings(currentRanks));

      const currentId = yield call(
        get,
        `categories/${nominee.category}`,
        "correctAnswer"
      );
      const isScoring = nominee.id !== currentId;

      if (nominee.id === currentId) {
        yield call(remove, `/categories/${nominee.category}`, "correctAnswer");
      } else {
        yield call(API.selectCorrectNominee, nominee);
      }

      // Update the answered order for the game
      yield put(updateAnsweredOrder(nominee.game, nominee.category, isScoring));
    }
  } catch (errors) {
    console.log("❌ Error in toggleCorrectNominee:", errors);
  }
}

export function* watchSelectCorrectNominee() {
  yield fork(takeLatest, TOGGLE_CORRECT_NOMINEE, toggleCorrectNominee);
}

export function* syncCategories() {
  yield fork(sync, "categories", {
    [CHILD_CHANGED]: setCategory,
  });
}
