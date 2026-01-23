import { eventChannel } from "redux-saga";
import { put, fork, call, take } from "redux-saga/effects";
import {
  ref,
  get as firebaseGet,
  set as firebaseSet,
  update as firebaseUpdate,
  push as firebasePush,
  remove as firebaseRemove,
  onValue,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  child,
  query,
  limitToLast,
  off,
} from "firebase/database";
import { database } from "../firebaseSetup";

export const CHILD_ADDED = "child_added";
export const CHILD_REMOVED = "child_removed";
export const CHILD_CHANGED = "child_changed";
export const CHILD_MOVED = "child_moved";
export const VALUE = "value";

const EVENT_TYPES = [
  CHILD_ADDED,
  CHILD_REMOVED,
  CHILD_CHANGED,
  CHILD_MOVED,
  VALUE,
];

const newOpts = (name = "data") => {
  const opts = {};
  const chan = eventChannel((emit) => {
    opts.handler = (obj) => {
      emit({ [name]: obj });
    };
    return () => {};
  });

  chan.handler = opts.handler;
  return chan;
};

const newKey = (path) => firebasePush(child(ref(database), path)).key;

/**
 * Fetches a record specified by the key from the database
 *
 * @param path
 * @param key
 * @returns {*|any}
 * import { get } from 'firebase-saga';
 *
 * const posts = yield call(get, 'posts', '1234');
 */
export function* get(path, key) {
  const dbRef = ref(database, `${path}/${key}`);
  const snapshot = yield call(firebaseGet, dbRef);

  return snapshot.val();
}

/**
 * Fetches entire snapshot of the database
 *
 * @param path
 * @returns {*|any}
 * @example
 * import { getAll } from 'firebase-saga';
 *
 * const posts = yield call(getAll, 'posts');
 */
export function* getAll(path) {
  const dbRef = ref(database, path);
  const snapshot = yield call(firebaseGet, dbRef);

  return snapshot.val();
}

/**
 * Saves new data to the database with `set()`
 *
 * @param path
 * @param fn
 * @example
 * import { create } from 'firebase-saga';
 *
 * yield call(create, 'posts', () => ({
 *              [`posts/1234`]: {
 *                   title: 'My Second Post',
 *                   body: 'Second post details',
 *                   timestamp: +new Date
 *               }
 *           })
 *);
 */
export function* create(path, fn) {
  const key = yield call(newKey, path);
  const payload = yield call(fn, key);
  const opts = newOpts("error");
  const dbRef = ref(database);

  // Create a wrapper function that returns a promise
  const updatePromise = () =>
    firebaseUpdate(dbRef, payload).then(
      () => opts.handler(undefined),
      (err) => opts.handler(err)
    );

  const [_, { error }] = yield [
    call(updatePromise),
    take(opts),
  ];
  return error;
}

/**
 * Updates existing data in the database with `update()`
 *
 * @param path
 * @param key
 * @param payload
 * @returns {*}
 * * import { update } from 'firebase-saga';
 *
 * yield call(update, 'posts', '1234', { 'Second Post', 'My seond post details', +new Date });
 */
export function* update(path, key, payload) {
  if (typeof payload === "function") {
    payload = yield call(payload);
  }
  const opts = newOpts("error");
  const dbRef = ref(database, `${path}/${key}`);

  // Create a wrapper function that returns a promise
  const updatePromise = () =>
    firebaseUpdate(dbRef, payload).then(
      () => opts.handler(undefined),
      (err) => opts.handler(err)
    );

  const [_, { error }] = yield [
    call(updatePromise),
    take(opts),
  ];
  return error;
}

/**
 * Generates a new child location using a unique key
 *
 * @param path
 * @param fn
 * @param getkey
 * @example
 * import { push } from 'firebase-saga';
 *
 * yield call(push, 'posts', () => ({
 *             title: formData.title,
 *             body: formData.body,
 *             timestamp: formData.timestamp
 *       })
 *);
 */
export function* push(path, fn, getKey = false) {
  const key = yield call(newKey, path);
  const payload = yield call(fn, key);
  const opts = newOpts("error");
  const dbRef = ref(database, path);

  // Create a wrapper function that returns a promise
  const setPromise = () =>
    firebaseSet(child(dbRef, key), payload).then(
      () => opts.handler(undefined),
      (err) => opts.handler(err)
    );

  const [_, { error }] = yield [
    call(setPromise),
    take(opts),
  ];

  if (getKey && error === undefined) {
    return key;
  }

  return error;
}

/**
 * Deletes a given child location using a unique key
 *
 * @param path
 * @param key
 * @example
 * import { push } from 'firebase-saga';
 *
 * yield call(push, 'posts', () => ({
 *             title: formData.title,
 *             body: formData.body,
 *             timestamp: formData.timestamp
 *       })
 *);
 */

/**
 * Deletes a given child location using a unique key
 *
 * @param path
 * @param key
 * @returns {*}
 * @example
 * import { remove } from 'firebase-saga';
 *
 * yield call(remove, 'posts', '1234')
 */
export function* remove(path, key) {
  const opts = newOpts("error");
  const dbRef = ref(database, `${path}/${key}`);

  // Create a wrapper function that returns a promise
  const removePromise = () =>
    firebaseRemove(dbRef).then(
      () => opts.handler(undefined),
      (err) => opts.handler(err)
    );

  const [_, { error }] = yield [
    call(removePromise),
    take(opts),
  ];
  return error;
}

function* runSync(dbRef, eventType, actionCreator) {
  const opts = newOpts();

  const eventFnMap = {
    [CHILD_ADDED]: onChildAdded,
    [CHILD_REMOVED]: onChildRemoved,
    [CHILD_CHANGED]: onChildChanged,
    [VALUE]: onValue,
  };

  const eventFn = eventFnMap[eventType];
  if (eventFn) {
    yield call(eventFn, dbRef, opts.handler);
  }

  while (true) {
    const { data } = yield take(opts);
    yield put(actionCreator({ key: data.key, value: data.val() }));
  }
}

/**
 * Gets fired every time a child added, remove, changed, or moved
 *
 * @param path
 * @param mapEventToAction
 * @param limit
 * @example
 * import { sync, CHILD_ADDED, CHILD_REMOVED } from 'firebase-saga';
 *
 *function* syncPosts() {
 *   yield fork(sync, 'posts', {
 *       [CHILD_ADDED]: actions.syncPostAdded,
 *       [CHILD_REMOVED]: actions.syncPostRemoved
 *   });
 *}
 */
export function* sync(path, mapEventToAction = {}, limit) {
  const dbRef =
    typeof limit === "number"
      ? query(ref(database, path), limitToLast(limit))
      : ref(database, path);

  for (let type of EVENT_TYPES) {
    const action = mapEventToAction[type];

    if (typeof action === "function") {
      yield fork(runSync, dbRef, type, action);
    }
  }
}
