import {
  watchFetchUser,
  fetchUser,
  createUser,
  watchFetchOrCreateUser,
  fetchOrCreateUser,
} from "./userSaga";

import { FETCH_USER, FETCH_OR_CREATE_USER } from "../actions/action-types";
import * as actions from "../actions/user-actions";

import { fork, takeLatest, call, put, select } from "redux-saga/effects";
import API from "../api";
import { get } from "./firebase-saga";
import User from "../models/User";

describe("user saga", () => {
  describe("watchFetchUser", () => {
    it("should watch for fetch user", () => {
      const generator = watchFetchUser();
      expect(generator.next().value).toEqual(
        fork(takeLatest, FETCH_USER, fetchUser)
      );
    });
  });

  describe("fetchUser", () => {
    it("should fetch user and dispatch setUser", () => {
      const action = actions.fetchUser("user1");
      const generator = fetchUser(action);

      // Call get
      expect(generator.next().value).toEqual(call(get, "users", "user1"));

      // Put setUser
      const user = new User({ id: "user1", name: "Test User" });
      expect(generator.next(user).value).toEqual(put(actions.setUser(user)));
    });

    it("should handle errors gracefully", () => {
      const action = actions.fetchUser("user1");
      const generator = fetchUser(action);

      generator.next(); // skip get call
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const error = new Error("Fetch failed");

      generator.throw(error);

      expect(consoleSpy).toHaveBeenCalledWith(error);
      consoleSpy.mockRestore();
    });
  });

  describe("createUser", () => {
    it("should call API to create user", () => {
      const user = new User({ id: "user1", name: "Test User" });
      const action = { payload: { user } };
      const generator = createUser(action);

      expect(generator.next().value).toEqual(call(API.createUser, user));
    });

    it("should handle errors gracefully", () => {
      const user = new User({ id: "user1", name: "Test User" });
      const action = { payload: { user } };
      const generator = createUser(action);

      generator.next(); // skip API call
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const error = new Error("Create failed");

      generator.throw(error);

      expect(consoleSpy).toHaveBeenCalledWith(error);
      consoleSpy.mockRestore();
    });
  });

  describe("watchFetchOrCreateUser", () => {
    it("should watch for fetch or create user", () => {
      const generator = watchFetchOrCreateUser();
      expect(generator.next().value).toEqual(
        fork(takeLatest, FETCH_OR_CREATE_USER, fetchOrCreateUser)
      );
    });
  });

  describe("fetchOrCreateUser", () => {
    it("should fetch existing user and redirect", () => {
      const firebaseUser = {
        uid: "user1",
        displayName: "Test User",
        email: "test@example.com",
        photoURL: "http://example.com/photo.jpg",
      };
      const action = actions.fetchOrCreateUser(firebaseUser);
      const generator = fetchOrCreateUser(action);

      // Try to get user
      expect(generator.next().value).toEqual(call(get, "users", firebaseUser.uid));

      // User exists
      const existingUser = new User({
        id: "user1",
        name: "Test User",
        email: "test@example.com",
      });
      expect(generator.next(existingUser).value).toEqual(
        put(actions.setUser(existingUser))
      );

      // Select nextLocation and redirect
      const selectEffect = generator.next().value;
      expect(selectEffect).toHaveProperty("SELECT");
      // Provide null nextLocation — should redirect to "/"
      generator.next(null);
      expect(window.location.href).toBe("/");
    });

    it("should create new user if not found and redirect", () => {
      const firebaseUser = {
        uid: "user1",
        displayName: "Test User",
        email: "test@example.com",
        photoURL: "http://example.com/photo.jpg",
      };
      const action = actions.fetchOrCreateUser(firebaseUser);
      const generator = fetchOrCreateUser(action);

      // Try to get user
      expect(generator.next().value).toEqual(call(get, "users", firebaseUser.uid));

      // User doesn't exist (null returned)
      const createUserEffect = generator.next(null).value;
      expect(createUserEffect).toHaveProperty("CALL");
      expect(createUserEffect.CALL.fn).toBe(API.createUser);

      // Verify the user model being created
      const newUser = createUserEffect.CALL.args[0];
      expect(newUser.id).toBe(firebaseUser.uid);
      expect(newUser.name).toBe(firebaseUser.displayName);
      expect(newUser.email).toBe(firebaseUser.email);
      expect(newUser.photoURL).toBe(firebaseUser.photoURL);

      // Put setUser with new user
      expect(generator.next().value).toEqual(put(actions.setUser(newUser)));

      // Select nextLocation and redirect
      const selectEffect = generator.next().value;
      expect(selectEffect).toHaveProperty("SELECT");
      generator.next("/groups/123");
      expect(window.location.href).toBe("/groups/123");
    });

    it("should handle errors gracefully", () => {
      const firebaseUser = {
        uid: "user1",
        displayName: "Test User",
        email: "test@example.com",
      };
      const action = actions.fetchOrCreateUser(firebaseUser);
      const generator = fetchOrCreateUser(action);

      generator.next(); // skip get call
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const error = new Error("Fetch failed");

      generator.throw(error);

      expect(consoleSpy).toHaveBeenCalledWith(error);
      consoleSpy.mockRestore();
    });
  });
});
