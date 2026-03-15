import { createGameSuccess, setGame, setGameAttr } from "../actions/game-actions";
import {
  UPDATE_GAME,
  SAVE_PENDING_CATEGORY,
  DELETE_GAME,
  UPDATE_ANSWERED_ORDER,
} from "../actions/action-types";
import { Map, List, fromJS } from "immutable";
import Game from "../models/Game";
import reducer from "./games-reducer";

describe("games reducer", () => {
  it("should add game on create success", () => {
    const newGameId = 2;
    const game = { name: "New Game" };
    const action = createGameSuccess(newGameId, game);
    const currentState = new Map().set(
      1,
      new Game({ id: 1, name: "Some game" })
    );
    const expectedResult = currentState.set(
      2,
      new Game({ id: 2, name: "New Game" })
    );
    expect(reducer(currentState, action)).toEqual(expectedResult);
  });

  it("should add set game success", () => {
    const game = new Game({ id: 2, name: "New Game" });
    const action = setGame(game);
    const currentState = new Map().set(
      1,
      new Game({ id: 1, name: "Some game" })
    );
    const expectedResult = currentState.set(2, game);
    expect(reducer(currentState, action)).toEqual(expectedResult);
  });

  it("should update game from Firebase sync (SET_GAME_ATTR)", () => {
    const currentState = new Map().set(
      "game1",
      new Game({ id: "game1", name: "Original Name", answered_order: List() })
    );
    const updatedGameData = {
      id: "game1",
      name: "Original Name",
      answered_order: ["cat1", "cat2"],
    };
    const response = { key: "game1", value: updatedGameData };
    const action = setGameAttr(response);
    const result = reducer(currentState, action);

    expect(result.getIn(["game1", "id"])).toBe("game1");
    expect(result.getIn(["game1", "name"])).toBe("Original Name");
    expect(result.getIn(["game1", "answered_order"]).toJS()).toEqual(["cat1", "cat2"]);
  });

  it("should handle null game from Firebase sync without crashing", () => {
    const currentState = new Map().set(
      "game1",
      new Game({ id: "game1", name: "Existing Game" })
    );
    const response = { key: "game1", value: null };
    const action = setGameAttr(response);
    const result = reducer(currentState, action);

    // Should return state unchanged
    expect(result).toBe(currentState);
    expect(result.getIn(["game1", "name"])).toBe("Existing Game");
  });

  it("should handle migration from old answeredOrder structure on SET_GAME_ATTR", () => {
    const currentState = new Map().set(
      "game1",
      new Game({ id: "game1", name: "Game Name", answered_order: List() })
    );
    const oldGameData = {
      id: "game1",
      name: "Game Name",
      answeredOrder: { key1: "nominee1", key2: "nominee2" }, // Old structure
    };
    const response = { key: "game1", value: oldGameData };
    const action = setGameAttr(response);
    const result = reducer(currentState, action);

    // Should migrate to empty array since old structure can't be converted
    expect(result.getIn(["game1", "answered_order"]).toJS()).toEqual([]);
  });

  it("should update game", () => {
    const currentState = new Map().set(
      1,
      new Game({ id: 1, name: "Original Name", answered_order: List() })
    );
    const action = {
      type: UPDATE_GAME,
      payload: {
        game: new Game({
          id: 1,
          name: "Updated Name",
        }),
      },
    };
    const result = reducer(currentState, action);
    expect(result.getIn([1, "name"])).toBe("Updated Name");
  });

  it("should add category to game on save pending category", () => {
    const currentState = new Map().set(
      "game1",
      new Game({ id: "game1", name: "Test Game", categories: Map() })
    );
    const action = {
      type: SAVE_PENDING_CATEGORY,
      payload: {
        gameId: "game1",
        pendingCategory: { id: "cat1", name: "Best Picture" },
      },
    };
    const result = reducer(currentState, action);
    expect(result.getIn(["game1", "categories", "cat1"])).toBe(true);
  });

  it("should delete game", () => {
    const currentState = new Map()
      .set("game1", new Game({ id: "game1", name: "Game 1" }))
      .set("game2", new Game({ id: "game2", name: "Game 2" }));
    const action = {
      type: DELETE_GAME,
      payload: { id: "game1" },
    };
    const result = reducer(currentState, action);
    expect(result.has("game1")).toBe(false);
    expect(result.has("game2")).toBe(true);
  });

  describe("UPDATE_ANSWERED_ORDER", () => {
    it("should add category to answered_order when scoring", () => {
      const currentState = new Map().set(
        "game1",
        new Game({ id: "game1", answered_order: List(["cat1", "cat2"]) })
      );
      const action = {
        type: UPDATE_ANSWERED_ORDER,
        payload: {
          gameId: "game1",
          categoryId: "cat3",
          isScoring: true,
        },
      };
      const result = reducer(currentState, action);
      const answeredOrder = result.getIn(["game1", "answered_order"]);
      expect(answeredOrder.toJS()).toEqual(["cat1", "cat2", "cat3"]);
    });

    it("should not add duplicate category to answered_order", () => {
      const currentState = new Map().set(
        "game1",
        new Game({ id: "game1", answered_order: List(["cat1", "cat2"]) })
      );
      const action = {
        type: UPDATE_ANSWERED_ORDER,
        payload: {
          gameId: "game1",
          categoryId: "cat2",
          isScoring: true,
        },
      };
      const result = reducer(currentState, action);
      const answeredOrder = result.getIn(["game1", "answered_order"]);
      expect(answeredOrder.toJS()).toEqual(["cat1", "cat2"]);
    });

    it("should remove category from answered_order when un-scoring", () => {
      const currentState = new Map().set(
        "game1",
        new Game({ id: "game1", answered_order: List(["cat1", "cat2", "cat3"]) })
      );
      const action = {
        type: UPDATE_ANSWERED_ORDER,
        payload: {
          gameId: "game1",
          categoryId: "cat2",
          isScoring: false,
        },
      };
      const result = reducer(currentState, action);
      const answeredOrder = result.getIn(["game1", "answered_order"]);
      expect(answeredOrder.toJS()).toEqual(["cat1", "cat3"]);
    });

    it("should initialize answered_order if missing when scoring", () => {
      const currentState = new Map().set(
        "game1",
        new Game({ id: "game1" })
      );
      const action = {
        type: UPDATE_ANSWERED_ORDER,
        payload: {
          gameId: "game1",
          categoryId: "cat1",
          isScoring: true,
        },
      };
      const result = reducer(currentState, action);
      const answeredOrder = result.getIn(["game1", "answered_order"]);
      expect(answeredOrder.toJS()).toEqual(["cat1"]);
    });

    it("should handle un-scoring with empty answered_order", () => {
      const currentState = new Map().set(
        "game1",
        new Game({ id: "game1", answered_order: List() })
      );
      const action = {
        type: UPDATE_ANSWERED_ORDER,
        payload: {
          gameId: "game1",
          categoryId: "cat1",
          isScoring: false,
        },
      };
      const result = reducer(currentState, action);
      const answeredOrder = result.getIn(["game1", "answered_order"]);
      expect(answeredOrder.toJS()).toEqual([]);
    });
  });

  it("should return current state for unknown action", () => {
    const currentState = new Map().set(1, new Game({ id: 1, name: "Game" }));
    const action = { type: "UNKNOWN_ACTION" };
    expect(reducer(currentState, action)).toBe(currentState);
  });
});
