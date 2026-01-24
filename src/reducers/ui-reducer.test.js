import {
  openModal,
  closeModal,
  updateSearchField,
  updateNewGroupName,
  updateNewGameName,
  updateNewEntryName,
  updateValueField,
  setNextLocation,
  showAlertBar,
  hideAlertBar,
  captureRankings,
} from "../actions/ui-actions";

import { signInSuccess } from "../actions/user-actions";

import { createGroupSuccess, saveGroupValuesSuccess } from "../actions/group-actions";

import {
  CREATE_NEW_CATEGORY,
  CREATE_GAME,
  SAVE_PENDING_CATEGORY,
} from "../actions/action-types";

import { UI } from "../models/UI";
import { Map } from "immutable";
import reducer from "./ui-reducer";

describe("ui reducer", () => {
  it("should open modal", () => {
    const id = "NEW_GROUP";
    const action = openModal(id);
    const expectedResult = new UI({
      modal: id,
    });

    expect(reducer(new UI(), action)).toEqual(expectedResult);
  });

  it("should close modal", () => {
    const action = closeModal();
    const expectedResult = new UI();

    expect(reducer(new UI({ modal: "NEW_GROUP" }), action)).toEqual(
      expectedResult
    );
  });

  it("should close modal on create group success", () => {
    const action = createGroupSuccess("group1", { values: { cat1: 1 } });
    const expectedResult = new UI({ values: new Map({ cat1: 1 }) });

    expect(reducer(new UI({ modal: "NEW_GROUP" }), action)).toEqual(
      expectedResult
    );
  });

  it("should update search field", () => {
    const searchText = "Brad Pitt";
    const action = updateSearchField(searchText);
    const expectedResult = new UI({
      searchValue: searchText,
    });

    expect(reducer(new UI({ searchValue: "old text" }), action)).toEqual(
      expectedResult
    );
  });

  it("should update new game name", () => {
    const newGameName = "Cool Game";
    const action = updateNewGameName(newGameName);
    const expectedResult = new UI({
      newGameName: newGameName,
    });

    expect(reducer(new UI({ newGameName: "old text" }), action)).toEqual(
      expectedResult
    );
  });

  it("should update new group name", () => {
    const newGroupName = "Cool Group";
    const action = updateNewGroupName(newGroupName);
    const expectedResult = new UI({
      newGroupName: newGroupName,
    });

    expect(reducer(new UI({ newGroupName: "old text" }), action)).toEqual(
      expectedResult
    );
  });

  it("should close modal on sign in success", () => {
    const action = signInSuccess({
      displayName: "John",
      email: "johngibbons10@gmail.com",
      photoURL: "john.jpeg",
    });
    const prevState = new UI({
      modal: "AUTH",
    });
    const expectedResult = new UI({
      modal: undefined,
    });

    expect(reducer(prevState, action)).toEqual(expectedResult);
  });

  it("should open new category modal", () => {
    const action = { type: CREATE_NEW_CATEGORY };
    const result = reducer(new UI(), action);
    expect(result.modal).toBe("NEW_CATEGORY");
  });

  it("should close modal on create game", () => {
    const action = { type: CREATE_GAME, payload: { name: "Test Game" } };
    const prevState = new UI({ modal: "NEW_GAME" });
    const result = reducer(prevState, action);
    expect(result.modal).toBeUndefined();
  });

  it("should close modal on save pending category", () => {
    const action = {
      type: SAVE_PENDING_CATEGORY,
      payload: { gameId: "game1", pendingCategory: {} },
    };
    const prevState = new UI({ modal: "NEW_CATEGORY" });
    const result = reducer(prevState, action);
    expect(result.modal).toBeUndefined();
  });

  it("should update new entry name", () => {
    const entryName = "My Entry";
    const action = updateNewEntryName(entryName);
    const result = reducer(new UI(), action);
    expect(result.newEntryName).toBe(entryName);
  });

  it("should update value field", () => {
    const action = updateValueField("cat1", 10);
    const result = reducer(new UI(), action);
    expect(result.getIn(["values", "cat1"])).toBe(10);
  });

  it("should update multiple value fields", () => {
    const state1 = reducer(new UI(), updateValueField("cat1", 5));
    const state2 = reducer(state1, updateValueField("cat2", 10));
    expect(state2.getIn(["values", "cat1"])).toBe(5);
    expect(state2.getIn(["values", "cat2"])).toBe(10);
  });

  it("should close modal and merge values on save group values success", () => {
    const prevState = new UI({
      modal: "EDIT_VALUES",
      values: new Map({ cat1: 1, cat2: 2 }),
    });
    const action = saveGroupValuesSuccess("group1", { cat2: 10, cat3: 15 });
    const result = reducer(prevState, action);

    expect(result.modal).toBeUndefined();
    expect(result.getIn(["values", "cat1"])).toBe(1);
    expect(result.getIn(["values", "cat2"])).toBe(10);
    expect(result.getIn(["values", "cat3"])).toBe(15);
  });

  it("should set next location", () => {
    const nextLocation = "/groups/123";
    const action = setNextLocation(nextLocation);
    const result = reducer(new UI(), action);
    expect(result.nextLocation).toBe(nextLocation);
  });

  it("should show alert bar", () => {
    const message = "Success!";
    const action = showAlertBar(message, false);
    const result = reducer(new UI(), action);

    expect(result.isAlertBarOpen).toBe(true);
    expect(result.alertBarMessage).toBe(message);
    expect(result.isAlertBarError).toBe(false);
  });

  it("should show error alert bar", () => {
    const message = "Error occurred!";
    const action = showAlertBar(message, true);
    const result = reducer(new UI(), action);

    expect(result.isAlertBarOpen).toBe(true);
    expect(result.alertBarMessage).toBe(message);
    expect(result.isAlertBarError).toBe(true);
  });

  it("should hide alert bar", () => {
    const prevState = new UI({
      isAlertBarOpen: true,
      alertBarMessage: "Some message",
      isAlertBarError: true,
    });
    const action = hideAlertBar();
    const result = reducer(prevState, action);

    expect(result.isAlertBarOpen).toBe(false);
    expect(result.alertBarMessage).toBe("");
    expect(result.isAlertBarError).toBe(false);
  });

  it("should capture rankings", () => {
    const rankings = new Map({ entry1: 1, entry2: 2, entry3: 3 });
    const action = captureRankings(rankings);
    const result = reducer(new UI(), action);
    expect(result.previousRanks).toEqual(rankings);
  });

  it("should return current state for unknown action", () => {
    const prevState = new UI({ modal: "SOME_MODAL" });
    const action = { type: "UNKNOWN_ACTION" };
    expect(reducer(prevState, action)).toBe(prevState);
  });
});
