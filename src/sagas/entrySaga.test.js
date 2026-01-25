import {
  watchCreateEntry,
  createEntry,
  watchFetchEntry,
  fetchEntry,
  watchSelectNominee,
  selectNominee,
  watchUserEntries,
  fetchUserEntries,
} from "./entrySaga";

import {
  CREATE_ENTRY,
  FETCH_ENTRY,
  SELECT_NOMINEE,
  FETCH_USER_ENTRIES,
} from "../actions/action-types";
import * as actions from "../actions/entry-actions";
import { setGroup } from "../actions/group-actions";
import { setGame } from "../actions/game-actions";
import { showAlertBar } from "../actions/ui-actions";

import { fork, takeLatest, call, put, select } from "redux-saga/effects";
import Entry from "../models/Entry";
import User from "../models/User";
import Group from "../models/Group";
import Game from "../models/Game";
import Nominee from "../models/Nominee";
import API from "../api";
import { currentUserSelector } from "../selectors/current-user-selector";
import { get } from "./firebase-saga";
import { fetchGameAndDependents, syncCategories } from "./gameSaga";
import { ref, query, orderByChild, equalTo, get as firebaseGet } from "firebase/database";
import { database } from "../firebaseSetup";

describe("entry saga", () => {
  describe("watchCreateEntry", () => {
    it("should watch for entry create", () => {
      const generator = watchCreateEntry();
      expect(generator.next().value).toEqual(
        fork(takeLatest, CREATE_ENTRY, createEntry)
      );
    });
  });

  describe("createEntry", () => {
    it("should select current user when creating entry", () => {
      const entry = new Entry({ name: "My entry" });
      const groupId = "group1";
      const currentUser = new User({ name: "John", id: "user1" });
      const action = actions.createEntry(entry, groupId, currentUser);
      const generator = createEntry(action);

      // First step should select current user
      expect(generator.next().value).toEqual(select(currentUserSelector));
    });

    it("should call API.createEntryId after getting user", () => {
      const entry = new Entry({ name: "My entry" });
      const groupId = "group1";
      const currentUser = new User({ name: "John", id: "user1" });
      const action = actions.createEntry(entry, groupId, currentUser);
      const generator = createEntry(action);

      // Select current user
      generator.next();
      // After getting user, should create entry ID
      expect(generator.next(currentUser).value).toEqual(
        call(API.createEntryId, null)
      );
    });

    it("should create entry and redirect", () => {
      const entry = new Entry({ name: "My entry" });
      const groupId = "group1";
      const currentUser = new User({ name: "John", id: "user1" });
      const action = actions.createEntry(entry, groupId, currentUser);
      const generator = createEntry(action);

      // Select current user
      generator.next();

      // Create entry ID
      const newEntryId = "entry123";
      expect(generator.next(currentUser).value).toEqual(call(API.createEntryId, null));

      // Create entry
      expect(generator.next(newEntryId).value).toEqual(
        call(API.createEntry, newEntryId, action.payload, currentUser)
      );
    });

    it("should handle errors gracefully", () => {
      const action = actions.createEntry(new Entry(), "group1", new User());
      const generator = createEntry(action);

      generator.next(); // skip select
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const error = new Error("Create failed");

      generator.throw(error);

      expect(consoleSpy).toHaveBeenCalledWith(error);
      consoleSpy.mockRestore();
    });
  });

  describe("watchFetchEntry", () => {
    it("should watch for fetch entry", () => {
      const generator = watchFetchEntry();
      expect(generator.next().value).toEqual(
        fork(takeLatest, FETCH_ENTRY, fetchEntry)
      );
    });
  });

  describe("fetchEntry", () => {
    it("should fetch entry and its dependencies", () => {
      const action = actions.fetchEntry("entry1");
      const generator = fetchEntry(action);

      // Get entry
      expect(generator.next().value).toEqual(call(get, "entries", "entry1"));

      // Put entry
      const entry = new Entry({ id: "entry1", game: "game1" });
      expect(generator.next(entry).value).toEqual(put(actions.setEntry(entry)));

      // Fetch game and dependents
      expect(generator.next().value).toEqual(call(fetchGameAndDependents, entry.game));

      // Sync categories
      expect(generator.next().value).toEqual(call(syncCategories));
    });

    it("should handle errors gracefully", () => {
      const action = actions.fetchEntry("entry1");
      const generator = fetchEntry(action);

      generator.next(); // skip get call
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const error = new Error("Fetch failed");

      generator.throw(error);

      expect(consoleSpy).toHaveBeenCalledWith(error);
      consoleSpy.mockRestore();
    });
  });

  describe("watchSelectNominee", () => {
    it("should watch for select nominee", () => {
      const generator = watchSelectNominee();
      expect(generator.next().value).toEqual(
        fork(takeLatest, SELECT_NOMINEE, selectNominee)
      );
    });
  });

  describe("selectNominee", () => {
    it("should select nominee and show success alert", () => {
      const nominee = new Nominee({ id: "nom1" });
      const action = actions.selectNominee("entry1", nominee);
      const generator = selectNominee(action);

      // Call API
      expect(generator.next().value).toEqual(
        call(API.selectNominee, "entry1", nominee)
      );

      // Dispatch success action
      expect(generator.next().value).toEqual(
        put(actions.selectNomineeSuccess("entry1", nominee))
      );

      // Show alert
      expect(generator.next().value).toEqual(
        put(showAlertBar("Selection Saved!"))
      );
    });

    it("should show error alert on failure", () => {
      const nominee = new Nominee({ id: "nom1" });
      const action = actions.selectNominee("entry1", nominee);
      const generator = selectNominee(action);

      generator.next(); // skip API call
      const error = new Error("Select failed");

      // Throw error
      expect(generator.throw(error).value).toEqual(
        put(showAlertBar("Error, please try again", true))
      );
    });
  });

  describe("watchUserEntries", () => {
    it("should watch for fetch user entries", () => {
      const generator = watchUserEntries();
      expect(generator.next().value).toEqual(
        fork(takeLatest, FETCH_USER_ENTRIES, fetchUserEntries)
      );
    });
  });

  describe("fetchUserEntries", () => {
    it("should fetch user entries and groups", () => {
      const action = actions.fetchUserEntries("user1");
      const generator = fetchUserEntries(action);

      // Get user
      expect(generator.next().value).toEqual(call(get, "users", "user1"));

      // Query for entries
      const user = new User({ id: "user1", groups: { group1: true } });
      const queryEffect = generator.next(user).value;
      expect(queryEffect).toHaveProperty("CALL");
      expect(queryEffect.CALL.fn).toBe(firebaseGet);

      // Put entries
      const entriesSnapshot = {
        val: () => ({ entry1: { id: "entry1" } }),
      };
      expect(generator.next(entriesSnapshot).value).toEqual(
        put(actions.setEntries({ entry1: { id: "entry1" } }))
      );

      // Fork to get groups
      const forkEffect = generator.next().value;
      expect(forkEffect).toHaveProperty("FORK");
    });

    it("should handle user without groups", () => {
      const action = actions.fetchUserEntries("user1");
      const generator = fetchUserEntries(action);

      // Get user
      generator.next();

      // User without groups
      const user = new User({ id: "user1" });
      generator.next(user);

      // Query returns entries
      const entriesSnapshot = {
        val: () => ({ entry1: { id: "entry1" } }),
      };
      const result = generator.next(entriesSnapshot);

      expect(result.value).toEqual(
        put(actions.setEntries({ entry1: { id: "entry1" } }))
      );
    });

    it("should handle errors gracefully", () => {
      const action = actions.fetchUserEntries("user1");
      const generator = fetchUserEntries(action);

      generator.next(); // skip get call
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const error = new Error("Fetch failed");

      generator.throw(error);

      expect(consoleSpy).toHaveBeenCalledWith(error);
      consoleSpy.mockRestore();
    });
  });
});
