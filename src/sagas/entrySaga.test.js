import { watchCreateEntry, createEntry } from "./entrySaga";

import { CREATE_ENTRY } from "../actions/action-types";
import * as actions from "../actions/entry-actions";

import { fork, takeLatest, call, put, select } from "redux-saga/effects";
import Entry from "../models/Entry";
import User from "../models/User";
import API from "../api";
import { currentUserSelector } from "../selectors/current-user-selector";

describe("entry saga", () => {
  it("should watch for entry create", () => {
    const generator = watchCreateEntry();
    expect(generator.next().value).toEqual(
      fork(takeLatest, CREATE_ENTRY, createEntry)
    );
  });

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
});
