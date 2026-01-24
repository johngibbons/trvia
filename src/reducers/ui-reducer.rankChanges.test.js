import uiReducer from "./ui-reducer";
import { captureRankings } from "../actions/ui-actions";
import { UI } from "../models/UI";
import { Map, fromJS } from "immutable";

describe("ui-reducer - CAPTURE_RANKINGS", () => {
  it("should set previousRanks when capturing rankings", () => {
    const initialState = new UI();
    const rankings = fromJS({
      "entry-1": 1,
      "entry-2": 2,
      "entry-3": 3,
    });

    const action = captureRankings(rankings);
    const newState = uiReducer(initialState, action);

    expect(newState.previousRanks).toEqual(rankings);
  });

  it("should replace existing previousRanks when capturing new rankings", () => {
    const oldRankings = fromJS({
      "entry-1": 2,
      "entry-2": 1,
      "entry-3": 3,
    });
    const initialState = new UI().set("previousRanks", oldRankings);

    const newRankings = fromJS({
      "entry-1": 1,
      "entry-2": 3,
      "entry-3": 2,
    });

    const action = captureRankings(newRankings);
    const newState = uiReducer(initialState, action);

    expect(newState.previousRanks).toEqual(newRankings);
    expect(newState.previousRanks).not.toEqual(oldRankings);
  });

  it("should handle empty rankings", () => {
    const initialState = new UI();
    const emptyRankings = fromJS({});

    const action = captureRankings(emptyRankings);
    const newState = uiReducer(initialState, action);

    expect(newState.previousRanks).toEqual(emptyRankings);
    expect(newState.previousRanks.size).toBe(0);
  });

  it("should handle rankings with ties (multiple entries at same rank)", () => {
    const initialState = new UI();
    const rankingsWithTies = fromJS({
      "entry-1": 1,
      "entry-2": 1, // Tied at rank 1
      "entry-3": 3, // Rank 3 (not 2) because two entries ahead
      "entry-4": 4,
    });

    const action = captureRankings(rankingsWithTies);
    const newState = uiReducer(initialState, action);

    expect(newState.previousRanks).toEqual(rankingsWithTies);
    expect(newState.previousRanks.get("entry-1")).toBe(1);
    expect(newState.previousRanks.get("entry-2")).toBe(1);
    expect(newState.previousRanks.get("entry-3")).toBe(3);
  });

  it("should maintain UI state immutability", () => {
    const initialState = new UI().merge({
      modal: "TEST_MODAL",
      searchValue: "test search",
      isAlertBarOpen: true,
    });

    const rankings = fromJS({
      "entry-1": 1,
      "entry-2": 2,
    });

    const action = captureRankings(rankings);
    const newState = uiReducer(initialState, action);

    // Other UI state should be unchanged
    expect(newState.modal).toBe("TEST_MODAL");
    expect(newState.searchValue).toBe("test search");
    expect(newState.isAlertBarOpen).toBe(true);

    // Only previousRanks should change
    expect(newState.previousRanks).toEqual(rankings);
  });

  it("should handle large numbers of entries", () => {
    const initialState = new UI();
    const manyEntries = {};

    // Create rankings for 100 entries
    for (let i = 1; i <= 100; i++) {
      manyEntries[`entry-${i}`] = i;
    }
    const rankings = fromJS(manyEntries);

    const action = captureRankings(rankings);
    const newState = uiReducer(initialState, action);

    expect(newState.previousRanks.size).toBe(100);
    expect(newState.previousRanks.get("entry-1")).toBe(1);
    expect(newState.previousRanks.get("entry-50")).toBe(50);
    expect(newState.previousRanks.get("entry-100")).toBe(100);
  });

  it("should preserve Immutable.js Map structure", () => {
    const initialState = new UI();
    const rankings = fromJS({
      "entry-1": 1,
      "entry-2": 2,
    });

    const action = captureRankings(rankings);
    const newState = uiReducer(initialState, action);

    expect(Map.isMap(newState.previousRanks)).toBe(true);
    expect(newState.previousRanks.get).toBeDefined();
    expect(newState.previousRanks.toJS).toBeDefined();
  });
});
