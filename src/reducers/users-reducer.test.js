import { setUser, syncUser } from "../actions/user-actions";
import { Map } from "immutable";
import User from "../models/User";
import reducer from "./users-reducer";

describe("users reducer", () => {
  it("should add user on SET_USER", () => {
    const user = { id: "user1", name: "John Doe", email: "john@example.com" };
    const action = setUser(user);
    const initialState = new Map();
    const result = reducer(initialState, action);

    expect(result.has("user1")).toBe(true);
    expect(result.getIn(["user1", "name"])).toBe("John Doe");
    expect(result.getIn(["user1", "email"])).toBe("john@example.com");
  });

  it("should add user on SYNC_USER", () => {
    const user = { id: "user2", name: "Jane Smith", email: "jane@example.com" };
    const action = syncUser({ value: user });
    const initialState = new Map();
    const result = reducer(initialState, action);

    expect(result.has("user2")).toBe(true);
    expect(result.getIn(["user2", "name"])).toBe("Jane Smith");
  });

  it("should merge deep when updating existing user", () => {
    const initialState = new Map({
      user1: new User({
        id: "user1",
        name: "Original Name",
        email: "original@example.com",
        entries: Map({ entry1: true }),
      }),
    });

    const updatedUser = {
      id: "user1",
      name: "Updated Name",
      email: "original@example.com", // Need to include to preserve it
      entries: { entry1: true, entry2: true },
    };

    const action = setUser(updatedUser);
    const result = reducer(initialState, action);

    // Should merge deep, keeping and updating nested data
    expect(result.getIn(["user1", "name"])).toBe("Updated Name");
    expect(result.getIn(["user1", "email"])).toBe("original@example.com");
    expect(result.getIn(["user1", "entries", "entry1"])).toBe(true);
    expect(result.getIn(["user1", "entries", "entry2"])).toBe(true);
  });

  it("should add multiple users", () => {
    const state1 = reducer(
      new Map(),
      setUser({ id: "user1", name: "User 1" })
    );
    const state2 = reducer(state1, setUser({ id: "user2", name: "User 2" }));

    expect(state2.has("user1")).toBe(true);
    expect(state2.has("user2")).toBe(true);
    expect(state2.getIn(["user1", "name"])).toBe("User 1");
    expect(state2.getIn(["user2", "name"])).toBe("User 2");
  });

  it("should return state when user is null", () => {
    const initialState = new Map({
      user1: new User({ id: "user1", name: "Existing" }),
    });
    const action = setUser(null);
    const result = reducer(initialState, action);
    expect(result).toBe(initialState);
  });

  it("should return state when user has no id", () => {
    const initialState = new Map({
      user1: new User({ id: "user1", name: "Existing" }),
    });
    const action = setUser({ name: "No ID User" });
    const result = reducer(initialState, action);
    expect(result).toBe(initialState);
  });

  it("should return current state for unknown action", () => {
    const initialState = new Map({
      user1: new User({ id: "user1", name: "Test" }),
    });
    const action = { type: "UNKNOWN_ACTION" };
    expect(reducer(initialState, action)).toBe(initialState);
  });
});
