import {
  watchCheckAuthStatus,
  checkAuthStatus,
  getCurrentUser,
  watchSignOut,
  signOut,
} from "./authSaga";

import { CHECK_AUTH_STATUS, SIGN_OUT } from "../actions/action-types";
import * as actions from "../actions/user-actions";
import { signInSuccess, signOutSuccess, setUser } from "../actions/user-actions";
import { setNextLocation } from "../actions/ui-actions";

import { call, put, fork, takeLatest } from "redux-saga/effects";
import { get } from "./firebase-saga";
import API from "../api";
import User from "../models/User";

describe("auth saga", () => {
  describe("watchCheckAuthStatus", () => {
    it("should call check auth status", () => {
      const generator = watchCheckAuthStatus();
      let next = generator.next();
      expect(next.value).toEqual(
        fork(takeLatest, CHECK_AUTH_STATUS, checkAuthStatus)
      );
    });
  });

  describe("checkAuthStatus - Production Mode", () => {
    const originalEnv = process.env.REACT_APP_USE_MOCK_DATA;

    beforeEach(() => {
      process.env.REACT_APP_USE_MOCK_DATA = "false";
    });

    afterEach(() => {
      process.env.REACT_APP_USE_MOCK_DATA = originalEnv;
    });

    it("should dispatch proper auth status actions if user", () => {
      const action = actions.checkAuthStatus(() => {}, false);
      const generator = checkAuthStatus(action);
      let next = generator.next();
      expect(next.value).toEqual(call(getCurrentUser, null));
      const user = { uid: "user1", displayName: "John Gibbons" };
      next = generator.next(user);
      expect(next.value).toEqual(put(signInSuccess(user)));
    });

    it("should dispatch proper auth status actions if no user", () => {
      const action = actions.checkAuthStatus(() => {}, false);
      const generator = checkAuthStatus(action);
      let next = generator.next();
      expect(next.value).toEqual(call(getCurrentUser, null));
      next = generator.next(undefined);
      expect(next.value).toEqual(put(signOutSuccess()));
    });

    it("should fetch and set user model when authenticated", () => {
      const nextCallback = jest.fn();
      const action = actions.checkAuthStatus(nextCallback, false);
      const generator = checkAuthStatus(action);

      // Get current user
      generator.next();
      const firebaseUser = { uid: "user1", displayName: "Test User" };
      generator.next(firebaseUser);

      // Fetch user model
      expect(generator.next().value).toEqual(call(get, "users", firebaseUser.uid));

      const userModel = new User({ id: "user1", name: "Test User" });
      expect(generator.next(userModel).value).toEqual(put(setUser(userModel)));

      // Call next callback
      expect(generator.next().value).toEqual(call(nextCallback, null));
    });

    it("should redirect to login if user is not authenticated and auth is required", () => {
      const nextCallback = jest.fn();
      const nextState = { location: { pathname: "/groups/123" } };
      const action = actions.checkAuthStatus(nextCallback, true, nextState);
      const generator = checkAuthStatus(action);

      // Get current user
      generator.next();

      // No user
      generator.next(null);

      // Put signOutSuccess
      expect(generator.next().value).toEqual(put(setNextLocation("/groups/123")));
    });

    it("should call next callback if auth is not required", () => {
      const nextCallback = jest.fn();
      const action = actions.checkAuthStatus(nextCallback, false);
      const generator = checkAuthStatus(action);

      // Get current user
      generator.next();

      // No user
      const putEffect = generator.next(null).value;
      expect(putEffect).toEqual(put(signOutSuccess()));

      // Should still call next since auth not required
      expect(generator.next().value).toEqual(call(nextCallback, null));
    });

    it("should handle errors gracefully", () => {
      const action = actions.checkAuthStatus(() => {}, false);
      const generator = checkAuthStatus(action);

      generator.next(); // skip getCurrentUser call
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const error = new Error("Auth check failed");

      generator.throw(error);

      expect(consoleSpy).toHaveBeenCalledWith(error);
      consoleSpy.mockRestore();
    });
  });

  describe("checkAuthStatus - Mock Mode", () => {
    const originalEnv = process.env.REACT_APP_USE_MOCK_DATA;

    beforeEach(() => {
      process.env.REACT_APP_USE_MOCK_DATA = "true";
    });

    afterEach(() => {
      process.env.REACT_APP_USE_MOCK_DATA = originalEnv;
    });

    it("should skip auth check in mock mode", () => {
      const nextCallback = jest.fn();
      const action = actions.checkAuthStatus(nextCallback, false);
      const generator = checkAuthStatus(action);

      expect(generator.next().value).toEqual(call(nextCallback, null));
      const result = generator.next();
      expect(result.done).toBe(true);
    });

    it("should handle missing next callback in mock mode", () => {
      const action = { payload: {} };
      const generator = checkAuthStatus(action);

      const result = generator.next();
      expect(result.done).toBe(true);
    });
  });

  describe("watchSignOut", () => {
    it("should watch for sign out", () => {
      const generator = watchSignOut();
      expect(generator.next().value).toEqual(
        fork(takeLatest, SIGN_OUT, signOut)
      );
    });
  });

  describe("signOut", () => {
    it("should sign out and redirect to home", () => {
      const generator = signOut();

      // Call API signOut
      expect(generator.next().value).toEqual(call(API.signOut, null));

      // Dispatch signOutSuccess
      expect(generator.next().value).toEqual(put(signOutSuccess()));
    });

    it("should handle errors gracefully", () => {
      const generator = signOut();

      generator.next(); // skip API call
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const error = new Error("Sign out failed");

      generator.throw(error);

      expect(consoleSpy).toHaveBeenCalledWith(error);
      consoleSpy.mockRestore();
    });
  });
});
