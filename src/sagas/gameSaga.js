import { takeLatest, fork, call, put, select } from "redux-saga/effects";
import {
  CREATE_GAME,
  FETCH_GAME,
  TOGGLE_CORRECT_NOMINEE,
} from "../actions/action-types";
import { createGameSuccess, setGame, setGameAttr, updateAnsweredOrder } from "../actions/game-actions";
import { setCategories, setCategory } from "../actions/category-actions";
import { setNominees } from "../actions/nominee-actions";
import { captureRankings } from "../actions/ui-actions";
import { allEntryRanksSelector } from "../selectors/entries-selector";
import API from "../api";
import { ref, query, orderByChild, equalTo, get as firebaseGet } from "firebase/database";
import { database } from "../firebaseSetup";
import { get, getAll, sync, remove, CHILD_CHANGED } from "./firebase-saga";
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
  let game = yield call(get, "games", gameId);
  if (!game) {
    // Browser may lowercase the URL path, so try fetching all games
    // and find a case-insensitive match
    const allGames = yield call(getAll, "games");
    if (allGames) {
      const matchingKey = Object.keys(allGames).find(
        (key) => key.toLowerCase() === gameId.toLowerCase()
      );
      if (matchingKey) {
        game = allGames[matchingKey];
      }
    }
    if (!game) {
      console.error(`Game not found in Firebase: ${gameId}`);
      return;
    }
  }
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
      // Production Firebase mode
      console.log("🔥 Production mode: Toggling nominee", nominee.id, "for category", nominee.category);

      const currentId = yield call(
        get,
        `categories/${nominee.category}`,
        "correctAnswer"
      );
      const isScoring = nominee.id !== currentId;

      console.log("🔥 currentId:", currentId, "isScoring:", isScoring);

      // Capture rankings BEFORE making the change
      if (isScoring) {
        // About to score a category - capture current ranks as "before"
        const currentRanks = yield select(allEntryRanksSelector);
        console.log("🔥 Capturing ranks BEFORE scoring:", currentRanks.toJS());
        yield put(captureRankings(currentRanks));
      }

      // Make the Firebase change
      if (nominee.id === currentId) {
        yield call(remove, `/categories/${nominee.category}`, "correctAnswer");
      } else {
        yield call(API.selectCorrectNominee, nominee);
      }

      // After unscoring, capture new ranks as "before" for next change
      if (!isScoring) {
        const currentRanks = yield select(allEntryRanksSelector);
        console.log("🔥 Capturing ranks AFTER unscoring:", currentRanks.toJS());
        yield put(captureRankings(currentRanks));
      }

      // Calculate the new answered_order BEFORE dispatching the action
      const games = yield select((state) => state.games);
      const game = games.get(nominee.game);

      // Debug: Check what's in the game object
      console.log("🔥 Game object:", {
        id: game?.id,
        name: game?.name,
        answered_order: game?.answered_order?.toJS?.() || game?.answered_order,
        answeredOrder: game?.answeredOrder?.toJS?.() || game?.answeredOrder,
      });

      const currentOrder = game?.answered_order || new List();

      let newOrder;
      if (isScoring) {
        newOrder = currentOrder.includes(nominee.category)
          ? currentOrder
          : currentOrder.push(nominee.category);
      } else {
        newOrder = currentOrder.filter(id => id !== nominee.category);
      }

      console.log("🔥 Calculated answered_order from", currentOrder.toJS(), "to", newOrder.toJS());

      // Update the answered order for the game (in Redux)
      // This updates the local state optimistically
      yield put(updateAnsweredOrder(nominee.game, nominee.category, isScoring));

      // Update Firebase with the calculated new order
      // Only update if the order actually changed
      if (!currentOrder.equals(newOrder)) {
        console.log("🔥 Updating Firebase answered_order to", newOrder.toJS());
        yield call(API.updateGame, nominee.game, { answered_order: newOrder.toJS() });
        console.log("🔥 Firebase update complete");

        // Verify the local state is in sync (for debugging)
        const updatedGames = yield select((state) => state.games);
        const updatedGame = updatedGames.get(nominee.game);
        const updatedOrder = updatedGame?.answered_order || new List();
        console.log("🔥 Redux state answered_order after update:", updatedOrder.toJS());
      } else {
        console.log("🔥 No change in answered_order, skipping Firebase update");
      }
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

export function* syncGames() {
  yield fork(sync, "games", {
    [CHILD_CHANGED]: setGameAttr,
  });
}
