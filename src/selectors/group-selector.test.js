import {
  currentGroupSelector,
  userGroupsSelector,
  entryGroupSelector,
  groupFromPropsSelector,
} from "./group-selector";

import { Map, List } from "immutable";
import Group from "../models/Group";
import User from "../models/User";
import Entry from "../models/Entry";

import store from "../store";

describe("group selector", () => {
  describe("currentGroupSelector", () => {
    it("should select current group from routeParams", () => {
      const currentGroup = new Group({ id: 1, name: "My group" });
      const state = { ...store.getState(), groups: Map().set(1, currentGroup) };
      const props = { routeParams: { id: 1 } };
      expect(currentGroupSelector(state, props)).toEqual(currentGroup);
    });

    it("should return empty group if no matching", () => {
      const currentGroup = new Group({ id: 2, name: "My group" });
      const state = { ...store.getState(), groups: Map().set(2, currentGroup) };
      const props = { routeParams: { id: 1 } };
      expect(currentGroupSelector(state, props)).toEqual(new Group());
    });

    it("should select group from entry prop when no routeParams", () => {
      const group = new Group({ id: "group1", name: "Test Group" });
      const state = { ...store.getState(), groups: Map().set("group1", group) };
      const props = { entry: { id: "entry1", group: "group1" } };
      expect(currentGroupSelector(state, props)).toEqual(group);
    });
  });

  describe("userGroupsSelector", () => {
    it("should select all groups for a user", () => {
      const group1 = new Group({ id: "group1", name: "Group 1" });
      const group2 = new Group({ id: "group2", name: "Group 2" });
      const user = new User({
        id: "user1",
        groups: Map({ group1: true, group2: true }),
      });

      const state = {
        ...store.getState(),
        groups: Map({ group1, group2 }),
        users: Map({ user1: user }),
      };
      const props = { routeParams: { id: "user1" } };

      const result = userGroupsSelector(state, props);
      expect(result.toArray()).toEqual([group1, group2]);
    });

    it("should return empty Seq when user is not found", () => {
      const state = {
        ...store.getState(),
        groups: Map(),
        users: Map(),
      };
      const props = { routeParams: { id: "nonexistent" } };

      const result = userGroupsSelector(state, props);
      expect(result.size).toBe(0);
    });

    it("should return empty Seq when user has no groups", () => {
      const user = new User({ id: "user1", groups: Map() });
      const state = {
        ...store.getState(),
        groups: Map(),
        users: Map({ user1: user }),
      };
      const props = { routeParams: { id: "user1" } };

      const result = userGroupsSelector(state, props);
      expect(result.size).toBe(0);
    });
  });

  describe("entryGroupSelector", () => {
    it("should select group for an entry", () => {
      const group = new Group({ id: "group1", name: "Test Group" });
      const entry = new Entry({ id: "entry1", group: "group1" });

      const state = {
        ...store.getState(),
        groups: Map({ group1: group }),
        entries: Map({ entry1: entry }),
      };
      const props = { entry: { id: "entry1" } };

      const result = entryGroupSelector(state, props);
      expect(result).toEqual(group);
    });
  });

  describe("groupFromPropsSelector", () => {
    it("should select group from props", () => {
      const group = new Group({ id: "group1", name: "Test Group" });
      const state = {
        ...store.getState(),
        groups: Map({ group1: group }),
      };
      const props = { group: List([{ group: "group1" }]) };

      const result = groupFromPropsSelector(state, props);
      expect(result).toEqual(group);
    });

    it("should return empty group when groups is empty", () => {
      const state = {
        ...store.getState(),
        groups: Map(),
      };
      const props = { group: List([{ group: "group1" }]) };

      const result = groupFromPropsSelector(state, props);
      expect(result).toEqual(new Group());
    });

    it("should return empty group when group is not found", () => {
      const group = new Group({ id: "group1", name: "Test Group" });
      const state = {
        ...store.getState(),
        groups: Map({ group1: group }),
      };
      const props = { group: List([{ group: "nonexistent" }]) };

      const result = groupFromPropsSelector(state, props);
      expect(result).toEqual(new Group());
    });
  });
});
