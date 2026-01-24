import {
  OPEN_MODAL,
  CLOSE_MODAL,
  UPDATE_SEARCH_FIELD,
  UPDATE_NEW_GAME_NAME,
  UPDATE_NEW_GROUP_NAME,
  UPDATE_NEW_ENTRY_NAME,
  UPDATE_VALUE_FIELD,
  SET_NEXT_LOCATION,
  SHOW_ALERT_BAR,
  HIDE_ALERT_BAR,
  CAPTURE_RANKINGS,
} from "./action-types";

import {
  openModal,
  closeModal,
  updateSearchField,
  updateNewGameName,
  updateNewGroupName,
  updateNewEntryName,
  updateValueField,
  setNextLocation,
  showAlertBar,
  hideAlertBar,
  captureRankings,
} from "./ui-actions";

describe("ui actions", () => {
  it("should create open modal action", () => {
    const id = "NEW_GROUP";
    const expectedAction = {
      type: OPEN_MODAL,
      payload: { id },
    };
    expect(openModal(id)).toEqual(expectedAction);
  });

  it("should create close modal action", () => {
    const expectedAction = {
      type: CLOSE_MODAL,
    };
    expect(closeModal()).toEqual(expectedAction);
  });

  it("should create update search field action", () => {
    const value = "search value";
    const expectedAction = {
      type: UPDATE_SEARCH_FIELD,
      payload: { value },
    };
    expect(updateSearchField(value)).toEqual(expectedAction);
  });

  it("should create update new game name action", () => {
    const value = "Game Name";
    const expectedAction = {
      type: UPDATE_NEW_GAME_NAME,
      payload: { value },
    };
    expect(updateNewGameName(value)).toEqual(expectedAction);
  });

  it("should create update new group name action", () => {
    const value = "Group Name";
    const expectedAction = {
      type: UPDATE_NEW_GROUP_NAME,
      payload: { value },
    };
    expect(updateNewGroupName(value)).toEqual(expectedAction);
  });

  it("should create update new entry name action", () => {
    const value = "Entry Name";
    const expectedAction = {
      type: UPDATE_NEW_ENTRY_NAME,
      payload: { value },
    };
    expect(updateNewEntryName(value)).toEqual(expectedAction);
  });

  it("should create update value field action", () => {
    const categoryId = "cat123";
    const value = 15;
    const expectedAction = {
      type: UPDATE_VALUE_FIELD,
      payload: { categoryId, value },
    };
    expect(updateValueField(categoryId, value)).toEqual(expectedAction);
  });

  it("should create set next location action", () => {
    const nextLocation = "/groups/123";
    const expectedAction = {
      type: SET_NEXT_LOCATION,
      payload: { nextLocation },
    };
    expect(setNextLocation(nextLocation)).toEqual(expectedAction);
  });

  it("should create show alert bar action", () => {
    const message = "Something happened!";
    const isError = false;
    const expectedAction = {
      type: SHOW_ALERT_BAR,
      payload: { message, isError },
    };
    expect(showAlertBar(message, isError)).toEqual(expectedAction);
  });

  it("should create show alert bar action with error", () => {
    const message = "Error occurred!";
    const isError = true;
    const expectedAction = {
      type: SHOW_ALERT_BAR,
      payload: { message, isError },
    };
    expect(showAlertBar(message, isError)).toEqual(expectedAction);
  });

  it("should create hide alert bar action", () => {
    const expectedAction = {
      type: HIDE_ALERT_BAR,
    };
    expect(hideAlertBar()).toEqual(expectedAction);
  });

  it("should create capture rankings action", () => {
    const rankings = [
      { entryId: "entry1", rank: 1 },
      { entryId: "entry2", rank: 2 },
    ];
    const expectedAction = {
      type: CAPTURE_RANKINGS,
      payload: { rankings },
    };
    expect(captureRankings(rankings)).toEqual(expectedAction);
  });
});
