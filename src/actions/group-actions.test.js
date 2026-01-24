import {
  CREATE_GROUP,
  CREATE_GROUP_SUCCESS,
  FETCH_GROUP,
  FETCH_USER_GROUPS,
  SET_GROUP,
  SET_GROUP_ATTR,
  SAVE_GROUP_VALUES,
  SAVE_GROUP_VALUES_SUCCESS,
} from "./action-types";

import {
  createGroup,
  createGroupSuccess,
  fetchGroup,
  fetchUserGroups,
  setGroup,
  setGroupAttr,
  saveGroupValues,
  saveGroupValuesSuccess,
} from "./group-actions";

describe("group actions", () => {
  it("should create an action for creating a group", () => {
    const name = "Some Group";
    const game = "2017Oscars";
    const expectedAction = {
      type: CREATE_GROUP,
      payload: {
        name,
        game,
      },
    };
    expect(createGroup(name, game)).toEqual(expectedAction);
  });

  it("should create an action for create success", () => {
    const id = "123";
    const group = { name: "Some Group", game: 2 };
    const expectedAction = {
      type: CREATE_GROUP_SUCCESS,
      payload: {
        id,
        group,
      },
    };
    expect(createGroupSuccess(id, group)).toEqual(expectedAction);
  });

  it("should create an action for fetching a group", () => {
    const id = 1;
    const expectedAction = {
      type: FETCH_GROUP,
      payload: {
        id,
      },
    };
    expect(fetchGroup(id)).toEqual(expectedAction);
  });

  it("should create an action for setting a group", () => {
    const group = { id: "123", name: "Test Group", game: "2017Oscars" };
    const expectedAction = {
      type: SET_GROUP,
      payload: {
        group,
      },
    };
    expect(setGroup(group)).toEqual(expectedAction);
  });

  it("should create an action for setting group attr from response", () => {
    const response = { value: { id: "123", name: "Updated Group" } };
    const expectedAction = {
      type: SET_GROUP_ATTR,
      payload: {
        group: response.value,
      },
    };
    expect(setGroupAttr(response)).toEqual(expectedAction);
  });

  it("should create an action for fetching user groups", () => {
    const userId = "user123";
    const expectedAction = {
      type: FETCH_USER_GROUPS,
      payload: {
        userId,
      },
    };
    expect(fetchUserGroups(userId)).toEqual(expectedAction);
  });

  it("should create an action for saving group values", () => {
    const groupId = "group123";
    const expectedAction = {
      type: SAVE_GROUP_VALUES,
      payload: {
        groupId,
      },
    };
    expect(saveGroupValues(groupId)).toEqual(expectedAction);
  });

  it("should create an action for save group values success", () => {
    const groupId = "group123";
    const newValues = { category1: 10, category2: 20 };
    const expectedAction = {
      type: SAVE_GROUP_VALUES_SUCCESS,
      payload: {
        groupId,
        newValues,
      },
    };
    expect(saveGroupValuesSuccess(groupId, newValues)).toEqual(expectedAction);
  });
});
