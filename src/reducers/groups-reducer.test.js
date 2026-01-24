import { Map } from "immutable";
import {
  createGroupSuccess,
  setGroup,
  setGroupAttr,
  saveGroupValuesSuccess,
} from "../actions/group-actions";

import Group from "../models/Group";
import reducer from "./groups-reducer";

describe("group reducer", () => {
  it("should add group on create success", () => {
    const id = 2;
    const group = { name: "New Group", game: 2 };
    const initialState = new Map({
      1: new Group({ id: 1, name: "some group" }),
    });
    const newGroup = new Group({ id, ...group });
    const expectedState = initialState.set(id, newGroup);
    const action = createGroupSuccess(id, group);
    expect(reducer(initialState, action)).toEqual(expectedState);
  });

  it("should set group", () => {
    const group = { id: "group1", name: "Test Group", game: "game1" };
    const initialState = new Map();
    const action = setGroup(group);
    const result = reducer(initialState, action);
    expect(result.has("group1")).toBe(true);
    expect(result.getIn(["group1", "name"])).toBe("Test Group");
  });

  it("should update existing group on set group", () => {
    const initialState = new Map({
      group1: new Group({ id: "group1", name: "Old Name", game: "game1" }),
    });
    const group = { id: "group1", name: "New Name", game: "game1" };
    const action = setGroup(group);
    const result = reducer(initialState, action);
    expect(result.getIn(["group1", "name"])).toBe("New Name");
  });

  it("should set group attr", () => {
    const group = { id: "group1", name: "Test Group", game: "game1" };
    const initialState = new Map();
    const action = setGroupAttr({ value: group });
    const result = reducer(initialState, action);
    expect(result.has("group1")).toBe(true);
    expect(result.getIn(["group1", "name"])).toBe("Test Group");
  });

  it("should return state when group is missing in SET_GROUP", () => {
    const initialState = new Map({
      group1: new Group({ id: "group1", name: "Existing" }),
    });
    const action = setGroup(null);
    const result = reducer(initialState, action);
    expect(result).toBe(initialState);
  });

  it("should return state when group has no id in SET_GROUP", () => {
    const initialState = new Map({
      group1: new Group({ id: "group1", name: "Existing" }),
    });
    const action = setGroup({ name: "No ID Group" });
    const result = reducer(initialState, action);
    expect(result).toBe(initialState);
  });

  it("should save group values", () => {
    const initialState = new Map({
      group1: new Group({
        id: "group1",
        name: "Test Group",
        values: Map({ cat1: 1, cat2: 2 }),
      }),
    });
    const newValues = { cat1: 5, cat2: 10, cat3: 15 };
    const action = saveGroupValuesSuccess("group1", newValues);
    const result = reducer(initialState, action);

    expect(result.getIn(["group1", "values", "cat1"])).toBe(5);
    expect(result.getIn(["group1", "values", "cat2"])).toBe(10);
    expect(result.getIn(["group1", "values", "cat3"])).toBe(15);
  });

  it("should return current state for unknown action", () => {
    const initialState = new Map({
      group1: new Group({ id: "group1", name: "Test" }),
    });
    const action = { type: "UNKNOWN_ACTION" };
    expect(reducer(initialState, action)).toBe(initialState);
  });
});
