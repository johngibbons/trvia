import { List, Map, fromJS } from "immutable";
import { peopleResultsSelector, titleResultsSelector } from "./admin-selector";
import { Admin } from "../models/Admin";
import { createInitialState } from "../testUtils/storeUtils";

describe("admin selectors", () => {
  const createMockPerson = (overrides = {}) =>
    fromJS({
      media_type: "person",
      name: "Test Actor",
      profile_path: "/test.jpg",
      ...overrides,
    });

  const createMockMovie = (overrides = {}) =>
    fromJS({
      media_type: "movie",
      title: "Test Movie",
      poster_path: "/movie.jpg",
      ...overrides,
    });

  const createMockTV = (overrides = {}) =>
    fromJS({
      media_type: "tv",
      name: "Test Show",
      poster_path: "/show.jpg",
      ...overrides,
    });

  describe("peopleResultsSelector", () => {
    it("should return only person results with profile_path", () => {
      const state = createInitialState({
        admin: new Admin({
          searchResults: List([
            createMockPerson({ name: "Actor 1" }),
            createMockMovie({ title: "Movie 1" }),
            createMockPerson({ name: "Actor 2" }),
          ]),
        }),
      });

      const result = peopleResultsSelector(state);
      expect(result.size).toBe(2);
      expect(result.get(0).get("name")).toBe("Actor 1");
      expect(result.get(1).get("name")).toBe("Actor 2");
    });

    it("should filter out people without profile_path", () => {
      const state = createInitialState({
        admin: new Admin({
          searchResults: List([
            createMockPerson({ name: "Actor 1" }),
            createMockPerson({ name: "Actor 2", profile_path: null }),
            createMockPerson({ name: "Actor 3" }),
          ]),
        }),
      });

      const result = peopleResultsSelector(state);
      expect(result.size).toBe(2);
    });

    it("should return empty list when no people results", () => {
      const state = createInitialState({
        admin: new Admin({
          searchResults: List([
            createMockMovie({ title: "Movie 1" }),
            createMockTV({ name: "Show 1" }),
          ]),
        }),
      });

      const result = peopleResultsSelector(state);
      expect(result.size).toBe(0);
    });

    it("should return empty list when search results are empty", () => {
      const state = createInitialState({
        admin: new Admin({
          searchResults: List(),
        }),
      });

      const result = peopleResultsSelector(state);
      expect(result.size).toBe(0);
    });
  });

  describe("titleResultsSelector", () => {
    it("should return movie and tv results with poster_path", () => {
      const state = createInitialState({
        admin: new Admin({
          searchResults: List([
            createMockPerson({ name: "Actor 1" }),
            createMockMovie({ title: "Movie 1" }),
            createMockTV({ name: "Show 1" }),
          ]),
        }),
      });

      const result = titleResultsSelector(state);
      expect(result.size).toBe(2);
      expect(result.get(0).get("title")).toBe("Movie 1");
      expect(result.get(1).get("name")).toBe("Show 1");
    });

    it("should filter out titles without poster_path", () => {
      const state = createInitialState({
        admin: new Admin({
          searchResults: List([
            createMockMovie({ title: "Movie 1" }),
            createMockMovie({ title: "Movie 2", poster_path: null }),
            createMockTV({ name: "Show 1" }),
          ]),
        }),
      });

      const result = titleResultsSelector(state);
      expect(result.size).toBe(2);
    });

    it("should return empty list when no title results", () => {
      const state = createInitialState({
        admin: new Admin({
          searchResults: List([
            createMockPerson({ name: "Actor 1" }),
            createMockPerson({ name: "Actor 2" }),
          ]),
        }),
      });

      const result = titleResultsSelector(state);
      expect(result.size).toBe(0);
    });

    it("should not include other media types", () => {
      const state = createInitialState({
        admin: new Admin({
          searchResults: List([
            createMockMovie({ title: "Movie 1" }),
            fromJS({
              media_type: "collection",
              name: "Collection",
              poster_path: "/collection.jpg",
            }),
          ]),
        }),
      });

      const result = titleResultsSelector(state);
      expect(result.size).toBe(1);
      expect(result.get(0).get("title")).toBe("Movie 1");
    });
  });
});
