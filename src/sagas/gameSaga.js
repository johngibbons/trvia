import { takeLatest, fork, call, put } from "redux-saga/effects";
import {
  CREATE_GAME,
  FETCH_GAME,
  TOGGLE_CORRECT_NOMINEE,
} from "../actions/action-types";
import { createGameSuccess, setGame } from "../actions/game-actions";
import { setCategories, setCategory } from "../actions/category-actions";
import { setNominees } from "../actions/nominee-actions";
import API from "../api";
import { ref, query, orderByChild, equalTo, get as firebaseGet } from "firebase/database";
import { database } from "../firebaseSetup";
import { get, sync, remove, CHILD_CHANGED } from "./firebase-saga";

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
    const currentId = yield call(
      get,
      `categories/${nominee.category}`,
      "correctAnswer"
    );
    if (nominee.id === currentId) {
      yield call(remove, `/categories/${nominee.category}`, "correctAnswer");
    } else {
      yield call(API.selectCorrectNominee, nominee);
    }
  } catch (errors) {
    console.log(errors);
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
