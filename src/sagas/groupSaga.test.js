import { takeLatest, call, put, take, fork, select } from "redux-saga/effects";

import {
  CREATE_GROUP,
  FETCH_GROUP,
  SAVE_GROUP_VALUES,
} from "../actions/action-types";

import * as actions from "../actions/group-actions";
import { syncEntry } from "../actions/entry-actions";
import { syncUser } from "../actions/user-actions";

import {
  watchCreateGroup,
  createGroup,
  watchFetchGroup,
  fetchGroup,
  syncGroup,
  syncEntries,
  syncUsers,
  syncGroupAndDependents,
  saveGroupValues,
  watchSaveGroupValues,
} from "./groupSaga";

import API from "../api";
import { currentUserSelector } from "../selectors/current-user-selector";
import { pendingValuesSelector } from "../selectors/ui-selector";
import { fetchGameAndDependents, syncCategories, syncGames } from "./gameSaga";
import {
  get,
  sync,
  update,
  CHILD_ADDED,
  CHILD_CHANGED,
  CHILD_REMOVED,
} from "./firebase-saga";
import { ref, query, orderByChild, equalTo, get as firebaseGet } from "firebase/database";
import { database } from "../firebaseSetup";
import { Map } from "immutable";
import Group from "../models/Group";
import User from "../models/User";

describe("group saga", () => {
  describe("watchCreateGroup", () => {
    it("watches for create group action", () => {
      const generator = watchCreateGroup();
      expect(generator.next().value).toEqual(
        fork(takeLatest, CREATE_GROUP, createGroup)
      );
    });
  });

  describe("createGroup", () => {
    it("should select current user when creating group", () => {
      const action = actions.createGroup({ name: "New group", game: "game1" });
      const generator = createGroup(action);

      // First step should select current user
      expect(generator.next().value).toEqual(select(currentUserSelector));
    });

    it("should create a group with category values", () => {
      const action = actions.createGroup({ name: "New group", game: "game1" });
      const generator = createGroup(action);

      // Select current user
      generator.next();
      const currentUser = new User({ id: "user1", name: "Test User" });
      expect(generator.next(currentUser).value).toEqual(call(API.createGroupId, null));

      // Get new group ID
      const newGroupId = "group123";
      const categoriesQueryEffect = generator.next(newGroupId).value;
      expect(categoriesQueryEffect).toHaveProperty("CALL");
      expect(categoriesQueryEffect.CALL.fn).toBe(firebaseGet);

      // Return categories
      const categoriesSnapshot = {
        val: () => ({
          cat1: { id: "cat1", value: 10 },
          cat2: { id: "cat2", value: 5 },
        }),
      };
      expect(generator.next(categoriesSnapshot).value).toEqual(
        call(
          API.createGroup,
          newGroupId,
          action.payload,
          currentUser,
          { cat1: 10, cat2: 5 }
        )
      );

      // Dispatch success action
      const putEffect = generator.next().value;
      expect(putEffect).toHaveProperty("PUT");
    });

    it("should handle errors gracefully", () => {
      const action = actions.createGroup({ name: "New group", game: "game1" });
      const generator = createGroup(action);

      generator.next(); // skip select
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const error = new Error("Create failed");

      generator.throw(error);

      expect(consoleSpy).toHaveBeenCalledWith(error);
      consoleSpy.mockRestore();
    });
  });

  describe("watchFetchGroup", () => {
    it("watches for fetch group action", () => {
      const generator = watchFetchGroup();
      expect(generator.next().value).toEqual(
        fork(takeLatest, FETCH_GROUP, fetchGroup)
      );
    });
  });

  describe("fetchGroup", () => {
    it("should skip fetching if group already exists in store", () => {
      const action = actions.fetchGroup("group1");
      const generator = fetchGroup(action);

      // Check for existing group
      const selectGroupsEffect = generator.next().value;
      expect(selectGroupsEffect).toHaveProperty("SELECT");

      // Group exists
      const existingGroup = new Group({ id: "group1", game: "game1" });
      const groups = new Map({ group1: existingGroup });
      expect(generator.next(groups).value).toEqual(
        call(fetchGameAndDependents, existingGroup.game)
      );

      // Sync group and dependents
      expect(generator.next().value).toEqual(call(syncGroupAndDependents, null));
    });

    it("should fetch group from Firebase when not in store", () => {
      const action = actions.fetchGroup("group1");
      const generator = fetchGroup(action);

      // Check for existing group
      const selectGroupsEffect = generator.next().value;
      expect(selectGroupsEffect).toHaveProperty("SELECT");

      // No existing group
      const emptyGroups = new Map();
      const group = new Group({ id: "group1", game: "game1" });
      expect(generator.next(emptyGroups).value).toEqual(call(get, "groups", "group1"));

      // Put the group
      expect(generator.next(group).value).toEqual(put(actions.setGroup(group)));

      // Fetch game and dependents
      expect(generator.next().value).toEqual(call(fetchGameAndDependents, group.game));

      // Sync group and dependents
      expect(generator.next().value).toEqual(call(syncGroupAndDependents, null));
    });

    it("should handle group not found", () => {
      const action = actions.fetchGroup("group1");
      const generator = fetchGroup(action);

      // Check for existing group
      generator.next();

      // No existing group
      const emptyGroups = new Map();
      generator.next(emptyGroups);

      // Group not found in Firebase
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const result = generator.next(null);

      expect(consoleSpy).toHaveBeenCalledWith("Group group1 not found");
      expect(result.done).toBe(true);
      consoleSpy.mockRestore();
    });

    it("should handle errors gracefully", () => {
      const action = actions.fetchGroup("group1");
      const generator = fetchGroup(action);

      generator.next(); // skip select
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const error = new Error("Fetch failed");

      generator.throw(error);

      expect(consoleSpy).toHaveBeenCalledWith(error);
      consoleSpy.mockRestore();
    });
  });

  describe("syncGroup", () => {
    it("should sync groups with Firebase listeners", () => {
      const generator = syncGroup();
      expect(generator.next().value).toEqual(
        fork(sync, "groups", {
          [CHILD_ADDED]: actions.setGroupAttr,
          [CHILD_CHANGED]: actions.setGroupAttr,
          [CHILD_REMOVED]: actions.setGroupAttr,
        })
      );
    });
  });

  describe("syncEntries", () => {
    it("should sync entries with Firebase listeners", () => {
      const generator = syncEntries();
      expect(generator.next().value).toEqual(
        fork(sync, "entries", {
          [CHILD_ADDED]: syncEntry,
          [CHILD_CHANGED]: syncEntry,
        })
      );
    });
  });

  describe("syncUsers", () => {
    it("should sync users with Firebase listeners", () => {
      const generator = syncUsers();
      expect(generator.next().value).toEqual(
        fork(sync, "users", {
          [CHILD_ADDED]: syncUser,
        })
      );
    });
  });

  describe("syncGroupAndDependents", () => {
    const originalEnv = process.env.REACT_APP_USE_MOCK_DATA;

    afterEach(() => {
      process.env.REACT_APP_USE_MOCK_DATA = originalEnv;
    });

    it("should skip syncing in mock mode", () => {
      process.env.REACT_APP_USE_MOCK_DATA = "true";
      const generator = syncGroupAndDependents();
      const result = generator.next();
      expect(result.done).toBe(true);
    });

    it("should sync all dependencies in production mode", () => {
      process.env.REACT_APP_USE_MOCK_DATA = "false";
      const generator = syncGroupAndDependents();

      // Fork all the sync sagas
      const fork1 = generator.next().value;
      expect(fork1).toHaveProperty("FORK");

      const fork2 = generator.next().value;
      expect(fork2).toHaveProperty("FORK");

      const fork3 = generator.next().value;
      expect(fork3).toHaveProperty("FORK");

      const fork4 = generator.next().value;
      expect(fork4).toHaveProperty("FORK");

      const fork5 = generator.next().value;
      expect(fork5).toHaveProperty("FORK");
    });
  });

  describe("saveGroupValues", () => {
    it("should save group values", () => {
      const action = actions.saveGroupValues("group1");
      const generator = saveGroupValues(action);

      // Select pending values
      expect(generator.next().value).toEqual(select(pendingValuesSelector));

      // Update Firebase
      const newValues = new Map({ cat1: 20, cat2: 10 });
      expect(generator.next(newValues).value).toEqual(
        call(update, "groups/group1", "values", newValues.toJS())
      );

      // Dispatch success action
      expect(generator.next().value).toEqual(
        put(actions.saveGroupValuesSuccess("group1", newValues))
      );
    });

    it("should handle errors gracefully", () => {
      const action = actions.saveGroupValues("group1");
      const generator = saveGroupValues(action);

      generator.next(); // skip select
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const error = new Error("Save failed");

      generator.throw(error);

      expect(consoleSpy).toHaveBeenCalledWith(error);
      consoleSpy.mockRestore();
    });
  });

  describe("watchSaveGroupValues", () => {
    it("should watch for save group values", () => {
      const generator = watchSaveGroupValues();
      expect(generator.next().value).toEqual(
        fork(takeLatest, SAVE_GROUP_VALUES, saveGroupValues)
      );
    });
  });
});
