import {
  SIGN_IN_SUCCESS,
  SIGN_OUT_SUCCESS,
  CHECK_AUTH_STATUS,
  FETCH_USER,
  SIGN_OUT,
  SET_USER,
  SYNC_USER,
  FETCH_OR_CREATE_USER,
} from "./action-types";

import {
  signInSuccess,
  signOutSuccess,
  checkAuthStatus,
  fetchUser,
  signOut,
  setUser,
  syncUser,
  fetchOrCreateUser,
} from "./user-actions";

describe("user actions", () => {
  it("should return sign in success action", () => {
    const currentUser = {
      id: "xpfjieo",
      displayName: "John Gibbons",
      email: "johngibbons10@gmail.com",
      photoURL: "john.jpeg",
    };

    const expectedAction = {
      type: SIGN_IN_SUCCESS,
      payload: {
        currentUser,
      },
    };

    expect(signInSuccess(currentUser)).toEqual(expectedAction);
  });

  it("should return sign out success action", () => {
    const expectedAction = {
      type: SIGN_OUT_SUCCESS,
    };

    expect(signOutSuccess()).toEqual(expectedAction);
  });

  it("should return check auth status action", () => {
    const next = () => {};
    const requireAuth = true;
    const nextState = { pathname: "/groups" };

    const expectedAction = {
      type: CHECK_AUTH_STATUS,
      payload: {
        next,
        requireAuth,
        nextState,
      },
    };

    expect(checkAuthStatus(next, requireAuth, nextState)).toEqual(expectedAction);
  });

  it("should return fetch user action", () => {
    const id = "user123";
    const expectedAction = {
      type: FETCH_USER,
      payload: {
        id,
      },
    };
    expect(fetchUser(id)).toEqual(expectedAction);
  });

  it("should return sign out action", () => {
    const expectedAction = {
      type: SIGN_OUT,
    };
    expect(signOut()).toEqual(expectedAction);
  });

  it("should return set user action", () => {
    const user = {
      id: "user123",
      name: "Test User",
      email: "test@example.com",
    };
    const expectedAction = {
      type: SET_USER,
      payload: {
        user,
      },
    };
    expect(setUser(user)).toEqual(expectedAction);
  });

  it("should return sync user action", () => {
    const value = {
      id: "user123",
      name: "Synced User",
      email: "synced@example.com",
    };
    const expectedAction = {
      type: SYNC_USER,
      payload: {
        user: value,
      },
    };
    expect(syncUser({ value })).toEqual(expectedAction);
  });

  it("should return fetch or create user action", () => {
    const user = {
      uid: "firebase123",
      displayName: "New User",
      email: "new@example.com",
      photoURL: "photo.jpg",
    };
    const expectedAction = {
      type: FETCH_OR_CREATE_USER,
      payload: {
        user,
      },
    };
    expect(fetchOrCreateUser(user)).toEqual(expectedAction);
  });
});
