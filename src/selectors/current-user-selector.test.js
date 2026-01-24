import { Map } from "immutable";
import { currentUserSelector } from "./current-user-selector";
import User from "../models/User";
import { createUser } from "../testUtils/factories";
import { createInitialState } from "../testUtils/storeUtils";

describe("current user selector", () => {
  it("should select the current user from users map", () => {
    const user = createUser({ id: "user1", name: "Test User" });
    const state = createInitialState({
      currentUser: new User({ id: "user1" }),
      users: new Map().set("user1", user),
    });

    expect(currentUserSelector(state)).toEqual(user);
  });

  it("should return undefined when current user not in users map", () => {
    const state = createInitialState({
      currentUser: new User({ id: "user1" }),
      users: new Map(),
    });

    expect(currentUserSelector(state)).toBeUndefined();
  });

  it("should return undefined when no current user is set", () => {
    const state = createInitialState({
      currentUser: new User(),
      users: new Map().set("user1", createUser({ id: "user1" })),
    });

    expect(currentUserSelector(state)).toBeUndefined();
  });

  it("should select correct user when multiple users exist", () => {
    const user1 = createUser({ id: "user1", name: "User One" });
    const user2 = createUser({ id: "user2", name: "User Two" });
    const user3 = createUser({ id: "user3", name: "User Three" });

    const state = createInitialState({
      currentUser: new User({ id: "user2" }),
      users: new Map()
        .set("user1", user1)
        .set("user2", user2)
        .set("user3", user3),
    });

    expect(currentUserSelector(state)).toEqual(user2);
    expect(currentUserSelector(state).name).toEqual("User Two");
  });
});
