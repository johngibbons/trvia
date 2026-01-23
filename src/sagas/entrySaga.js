import {
  CREATE_ENTRY,
  FETCH_ENTRY,
  SELECT_NOMINEE,
  FETCH_USER_ENTRIES,
} from "../actions/action-types";

import {
  setEntry,
  selectNomineeSuccess,
  setEntries,
} from "../actions/entry-actions";
import { setGroup } from "../actions/group-actions";
import { setGame } from "../actions/game-actions";
import { currentUserSelector } from "../selectors/current-user-selector";
import API from "../api";
import { fork, put, call, takeLatest, select } from "redux-saga/effects";
import { get } from "./firebase-saga";
import { fetchGameAndDependents, syncCategories } from "./gameSaga";
import { showAlertBar } from "../actions/ui-actions";
import { ref, query, orderByChild, equalTo, get as firebaseGet } from "firebase/database";
import { database } from "../firebaseSetup";

export function* createEntry(action) {
  try {
    const currentUser = yield select(currentUserSelector);
    const newEntryId = yield call(API.createEntryId, null);
    yield call(API.createEntry, newEntryId, action.payload, currentUser);
    window.location.href = `/entries/${newEntryId}`;
  } catch (errors) {
    console.log(errors);
  }
}

export function* watchCreateEntry() {
  yield fork(takeLatest, CREATE_ENTRY, createEntry);
}

export function* fetchEntry(action) {
  try {
    const entry = yield call(get, "entries", action.payload.id);
    yield put(setEntry(entry));
    yield call(fetchGameAndDependents, entry.game);
    yield call(syncCategories);
  } catch (errors) {
    console.log(errors);
  }
}

export function* watchFetchEntry() {
  yield fork(takeLatest, FETCH_ENTRY, fetchEntry);
}

export function* selectNominee(action) {
  try {
    yield call(
      API.selectNominee,
      action.payload.entryId,
      action.payload.nominee
    );
    yield put(
      selectNomineeSuccess(action.payload.entryId, action.payload.nominee)
    );
    yield put(showAlertBar("Selection Saved!"));
  } catch (errors) {
    yield put(showAlertBar("Error, please try again", true));
    console.log(errors);
  }
}

export function* watchSelectNominee() {
  yield fork(takeLatest, SELECT_NOMINEE, selectNominee);
}

function* getAndSetGroup(id) {
  try {
    const group = yield call(get, "groups", id);
    yield put(setGroup(group));
    const game = yield call(get, "games", group.game);
    yield put(setGame(game));
  } catch (errors) {
    console.log(errors);
  }
}

export function* fetchUserEntries(action) {
  try {
    const user = yield call(get, "users", action.payload.userId);
    const dbQuery = query(
      ref(database, "entries"),
      orderByChild("user"),
      equalTo(user.id)
    );
    const response = yield call(firebaseGet, dbQuery);
    const entries = response.val();
    yield put(setEntries(entries));
    if (user.groups) {
      for (const key of Object.keys(user.groups)) {
        yield fork(getAndSetGroup, key);
      }
    }
  } catch (errors) {
    console.log(errors);
  }
}

export function* watchUserEntries() {
  yield fork(takeLatest, FETCH_USER_ENTRIES, fetchUserEntries);
}
