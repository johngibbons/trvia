import { SUBMIT_SEARCH_SUCCESS } from "../actions/action-types";
import { Admin } from "../models/Admin";
import { fromJS, List } from "immutable";
import reducer from "./admin-reducer";

describe("admin reducer", () => {
  it("should return initial state", () => {
    const initialState = new Admin();
    const action = { type: "UNKNOWN_ACTION" };
    expect(reducer(undefined, action)).toEqual(initialState);
  });

  it("should set search results on SUBMIT_SEARCH_SUCCESS", () => {
    const initialState = new Admin();
    const searchResults = [
      { id: 1, title: "Test Movie", media_type: "movie" },
      { id: 2, name: "Test Person", media_type: "person" },
    ];
    const action = {
      type: SUBMIT_SEARCH_SUCCESS,
      payload: {
        response: {
          results: searchResults,
        },
      },
    };

    const result = reducer(initialState, action);

    expect(result.searchResults.size).toBe(2);
    expect(result.searchResults.getIn([0, "title"])).toBe("Test Movie");
    expect(result.searchResults.getIn([1, "name"])).toBe("Test Person");
  });

  it("should replace existing search results", () => {
    const initialState = new Admin({
      searchResults: fromJS([
        { id: 100, title: "Old Movie", media_type: "movie" },
      ]),
    });

    const newSearchResults = [
      { id: 1, title: "New Movie", media_type: "movie" },
      { id: 2, title: "Another Movie", media_type: "movie" },
    ];

    const action = {
      type: SUBMIT_SEARCH_SUCCESS,
      payload: {
        response: {
          results: newSearchResults,
        },
      },
    };

    const result = reducer(initialState, action);

    expect(result.searchResults.size).toBe(2);
    expect(result.searchResults.getIn([0, "title"])).toBe("New Movie");
    expect(result.searchResults.getIn([1, "title"])).toBe("Another Movie");
  });

  it("should handle empty search results", () => {
    const initialState = new Admin();
    const action = {
      type: SUBMIT_SEARCH_SUCCESS,
      payload: {
        response: {
          results: [],
        },
      },
    };

    const result = reducer(initialState, action);

    expect(result.searchResults.size).toBe(0);
  });

  it("should return current state for unknown action", () => {
    const initialState = new Admin({
      searchResults: List([fromJS({ id: 1, title: "Test" })]),
    });
    const action = { type: "UNKNOWN_ACTION" };

    expect(reducer(initialState, action)).toBe(initialState);
  });
});
