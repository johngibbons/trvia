import { takeLatest, call, put, take, fork, select } from "redux-saga/effects";

import { CREATE_GROUP, FETCH_GROUP } from "../actions/action-types";

import * as actions from "../actions/group-actions";

import {
  watchCreateGroup,
  createGroup,
  watchFetchGroup,
  fetchGroup,
} from "./groupSaga";

import API from "../api";
import { currentUserSelector } from "../selectors/current-user-selector";

describe("group saga", () => {
  it("watches for create group action", () => {
    const generator = watchCreateGroup();
    expect(generator.next().value).toEqual(
      fork(takeLatest, CREATE_GROUP, createGroup)
    );
  });

  it("watches for fetch group action", () => {
    const generator = watchFetchGroup();
    expect(generator.next().value).toEqual(
      fork(takeLatest, FETCH_GROUP, fetchGroup)
    );
  });

  it("should select current user when creating group", () => {
    const action = actions.createGroup({ name: "New group", game: "game1" });
    const generator = createGroup(action);

    // First step should select current user
    expect(generator.next().value).toEqual(select(currentUserSelector));
  });
});
