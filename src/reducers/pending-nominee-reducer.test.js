import {
  UPDATE_PENDING_NOMINEE,
  SAVE_PENDING_NOMINEE,
} from "../actions/action-types";
import Nominee from "../models/Nominee";
import reducer from "./pending-nominee-reducer";

describe("pending nominee reducer", () => {
  it("should return initial state", () => {
    const initialState = new Nominee();
    const action = { type: "UNKNOWN_ACTION" };
    expect(reducer(undefined, action)).toEqual(initialState);
  });

  it("should update pending nominee", () => {
    const initialState = new Nominee({ id: "nom1", text: "Original Text" });
    const updates = { text: "Updated Text", imageUrl: "/new-image.jpg" };
    const action = {
      type: UPDATE_PENDING_NOMINEE,
      payload: { pendingNominee: updates },
    };

    const result = reducer(initialState, action);

    expect(result.text).toBe("Updated Text");
    expect(result.imageUrl).toBe("/new-image.jpg");
    expect(result.id).toBe("nom1"); // Original properties retained
  });

  it("should merge updates with existing nominee data", () => {
    const initialState = new Nominee({
      id: "nom1",
      text: "Nominee Name",
      category: "cat1",
      game: "game1",
    });
    const updates = { imageUrl: "/image.jpg" };
    const action = {
      type: UPDATE_PENDING_NOMINEE,
      payload: { pendingNominee: updates },
    };

    const result = reducer(initialState, action);

    expect(result.imageUrl).toBe("/image.jpg");
    expect(result.text).toBe("Nominee Name");
    expect(result.category).toBe("cat1");
    expect(result.game).toBe("game1");
  });

  it("should reset to initial state on SAVE_PENDING_NOMINEE", () => {
    const currentState = new Nominee({
      id: "nom1",
      text: "Some Nominee",
      imageUrl: "/image.jpg",
    });
    const action = { type: SAVE_PENDING_NOMINEE };

    const result = reducer(currentState, action);

    expect(result).toEqual(new Nominee());
  });

  it("should return current state for unknown action", () => {
    const currentState = new Nominee({
      id: "nom1",
      text: "Test Nominee",
    });
    const action = { type: "UNKNOWN_ACTION" };

    expect(reducer(currentState, action)).toBe(currentState);
  });
});
