import {
  entriesSelector,
  rankedGroupEntriesSelector,
  currentEntrySelector,
  entryVisibleSelector,
  entryUserSelector,
  peoplesChoicesSelector,
  entryRankChangeSelector,
  winningEntriesSelector,
  entryCompleteSelector,
  entryPercentCompleteSelector,
} from "./entries-selector";
import { Map, List, is, fromJS } from "immutable";
import Entry from "../models/Entry";
import Group from "../models/Group";
import Category from "../models/Category";
import User from "../models/User";
import Game from "../models/Game";
import { createInitialState } from "../testUtils/storeUtils";
import {
  createEntry,
  createEntryWithSelections,
  createGame,
  createGameWithCategories,
  createCategory,
  createGroup,
  createGroupWithEntries,
  createUser,
  createUI,
  createUIWithPreviousRanks,
} from "../testUtils/factories";

// Create a base empty state for tests
const getBaseState = () => createInitialState({});

describe("entries selector", () => {
  it("should select all entries", () => {
    const entries = new Map({
      1: new Entry({
        name: "Some Entry",
      }),
      2: new Entry({
        name: "Another Entry",
      }),
    });

    const state = { ...getBaseState(), entries };

    expect(entriesSelector(state)).toEqual(entries);
  });

  it("should select the entries from a group ordered by score", () => {
    const games = new Map().set(
      "game1",
      new Game({
        id: "game1",
        categories: new Map().set("category1", true).set("category2", true),
      })
    );
    const categories = new Map()
      .set(
        "category1",
        new Category({
          id: "category1",
          correctAnswer: "nominee1",
        })
      )
      .set(
        "category2",
        new Category({
          id: "category2",
          correctAnswer: "nominee2",
        })
      );
    const groupEntries = new Map()
      .set(
        "entry1",
        new Entry({
          id: "entry1",
          game: "game1",
          name: "Entry 1",
          selections: fromJS({
            category2: "nominee2",
          }),
        })
      )
      .set(
        "entry2",
        new Entry({
          id: "entry2",
          game: "game1",
          name: "Entry 2",
          selections: fromJS({
            category1: "nominee1",
            category2: "nominee2",
          }),
        })
      );
    const group = new Group({
      id: "group1",
      game: "game1",
      name: "My Group",
      entries: fromJS({ entry1: true, entry2: true }),
      values: fromJS({ category1: 2, category2: 1 }),
    });
    const state = {
      ...getBaseState(),
      entries: groupEntries.set("entry3", new Entry({ id: "entry3", name: "Not in group" })),
      groups: new Map().set("group1", group),
      categories,
      games,
      users: new Map(),
    };
    const props = { routeParams: { id: "group1" } };

    const result = rankedGroupEntriesSelector(state, props);

    // Should return 2 entries (not the one not in group)
    expect(result.size).toEqual(2);
    // Entry2 should be first (higher score: 3 vs 1)
    expect(result.get(0).id).toEqual("entry2");
    expect(result.get(0).score).toEqual(3);
    expect(result.get(0).rank).toEqual(1);
    // Entry1 should be second (lower score)
    expect(result.get(1).id).toEqual("entry1");
    expect(result.get(1).score).toEqual(1);
    expect(result.get(1).rank).toEqual(2);
    // State should still have 3 entries
    expect(state.entries.size).toEqual(3);
  });

  it("should return empty List if no entries", () => {
    const group = new Group({ name: "My Group" });
    const state = {
      ...getBaseState(),
      entries: new Map().set(3, new Entry({ name: "Not in group" })),
      groups: new Map().set(1, group),
    };
    const props = { routeParams: { id: 1 } };
    const expectedResult = new List();
    expect(
      is(rankedGroupEntriesSelector(state, props), expectedResult)
    ).toEqual(true);
    expect(rankedGroupEntriesSelector(state, props).size).toEqual(0);
    expect(state.entries.size).toEqual(1);
  });

  it("should return empty entries if not yet set", () => {
    const group = new Group({
      id: "group1",
      name: "My Group",
      entries: new Map().set("entry1", true).set("entry2", true),
    });
    const state = {
      ...getBaseState(),
      groups: new Map().set("group1", group),
      users: new Map(),
    };
    const props = { routeParams: { id: "group1" } };

    const result = rankedGroupEntriesSelector(state, props);

    // Should return 2 placeholder entries (since entries not loaded yet)
    expect(result.size).toEqual(2);
    // Each entry should have a user field set
    expect(result.every((e) => e.user instanceof User)).toBe(true);
    expect(state.entries.size).toEqual(0);
  });

  it("should return empty seq if no group", () => {
    const state = {
      ...getBaseState(),
      entries: new Map().set(3, new Entry({ name: "Not in group" })),
    };
    const props = { routeParams: { id: 1 } };
    const expectedResult = new List();
    expect(
      is(rankedGroupEntriesSelector(state, props), expectedResult)
    ).toEqual(true);
    expect(rankedGroupEntriesSelector(state, props).size).toEqual(0);
    expect(state.entries.size).toEqual(1);
  });

  it("should select the current entry", () => {
    const currentEntry = new Entry({ name: "Entry 1" });
    const state = {
      ...getBaseState(),
      entries: new Map()
        .set(1, currentEntry)
        .set(2, new Entry({ name: "Other Entry" })),
    };
    const props = { routeParams: { id: 1 } };
    expect(currentEntrySelector(state, props)).toEqual(currentEntry);
  });

  it("should return empty entry if not yet set", () => {
    const state = {
      ...getBaseState(),
      entries: new Map(),
    };
    const props = { routeParams: { id: 1 } };
    expect(currentEntrySelector(state, props)).toEqual(new Entry());
  });

  describe("entryVisibleSelector", () => {
    const games = new Map().set(
      "game1",
      new Game({
        id: "game1",
        categories: fromJS({
          category1: true,
          category2: true,
        }),
      })
    );

    const entries = new Map().set(
      "entry1",
      new Entry({
        id: "entry1",
        game: "game1",
      })
    );

    const props = {
      entry: entries.get("entry1"),
    };

    it("should return false if game not started", () => {
      const games = new Map().set(
        "game1",
        new Game({
          id: "game1",
          categories: fromJS({
            category1: true,
            category2: true,
          }),
        })
      );

      const categories = new Map()
        .set("category1", new Category({ id: "category1" }))
        .set("category2", new Category({ id: "category2" }));
      const entries = new Map().set(
        "entry1",
        new Entry({
          id: "entry1",
          game: "game1",
        })
      );

      const state = {
        ...getBaseState(),
        games,
        categories,
        entries,
      };
      const props = {
        entry: entries.get("entry1"),
      };

      expect(entryVisibleSelector(state, props)).toEqual(false);
    });

    it("should return true if owner", () => {
      const currentUser = new User({ id: "user1" });

      const entries = new Map().set(
        "entry1",
        new Entry({
          id: "entry1",
          user: currentUser.id,
          game: "game1",
        })
      );

      const state = {
        ...getBaseState(),
        currentUser,
        entries,
      };
      const props = {
        entry: entries.get("entry1"),
      };

      expect(entryVisibleSelector(state, props)).toEqual(true);
    });

    it("should return true if game started", () => {
      const categories = new Map()
        .set(
          "category1",
          new Category({
            id: "category1",
            correctAnswer: "nominee1",
          })
        )
        .set("category2", new Category({ id: "category2" }));
      const state = {
        ...getBaseState(),
        games,
        categories,
        entries,
      };

      expect(entryVisibleSelector(state, props)).toEqual(true);
    });

    describe("entryUserSelctor", () => {
      it("should select entry user", () => {
        const users = new Map().set(
          "user1",
          new User({
            id: "user1",
            name: "john gibbons",
          })
        );
        const entries = new Map().set(
          "entry1",
          new Entry({
            id: "entry1",
            user: "user1",
          })
        );

        const state = {
          entries,
          users,
        };

        const props = { entry: new Entry({ id: "entry1" }) };

        expect(entryUserSelector(state, props)).toEqual(users.get("user1"));
      });

      it("should handle empty users", () => {
        const state = getBaseState();
        expect(entryUserSelector(state, props)).toEqual(new User());
      });
    });
  });

  describe("rankedGroupEntriesSelector with ties", () => {
    it("should assign same rank to entries with equal scores", () => {
      const games = new Map().set(
        "game1",
        new Game({
          id: "game1",
          categories: new Map().set("category1", true),
        })
      );
      const categories = new Map().set(
        "category1",
        new Category({
          id: "category1",
          correctAnswer: "nominee1",
        })
      );
      const entries = new Map()
        .set(
          "entry1",
          new Entry({
            id: "entry1",
            game: "game1",
            selections: fromJS({ category1: "nominee1" }),
          })
        )
        .set(
          "entry2",
          new Entry({
            id: "entry2",
            game: "game1",
            selections: fromJS({ category1: "nominee1" }),
          })
        )
        .set(
          "entry3",
          new Entry({
            id: "entry3",
            game: "game1",
            selections: fromJS({ category1: "wrong" }),
          })
        );
      const group = new Group({
        id: "group1",
        game: "game1",
        entries: fromJS({ entry1: true, entry2: true, entry3: true }),
        values: fromJS({ category1: 1 }),
      });

      const state = {
        ...getBaseState(),
        games,
        categories,
        entries,
        groups: new Map().set("group1", group),
        users: new Map(),
      };
      const props = { routeParams: { id: "group1" } };

      const result = rankedGroupEntriesSelector(state, props);
      const ranks = result.map((e) => e.rank).toArray();

      // First two should be tied at rank 1, third at rank 3
      expect(ranks).toEqual([1, 1, 3]);
    });

    it("should handle three-way tie", () => {
      const games = new Map().set(
        "game1",
        new Game({
          id: "game1",
          categories: new Map().set("category1", true),
        })
      );
      const categories = new Map().set(
        "category1",
        new Category({
          id: "category1",
          correctAnswer: "nominee1",
        })
      );
      const entries = new Map()
        .set(
          "entry1",
          new Entry({
            id: "entry1",
            game: "game1",
            selections: fromJS({ category1: "nominee1" }),
          })
        )
        .set(
          "entry2",
          new Entry({
            id: "entry2",
            game: "game1",
            selections: fromJS({ category1: "nominee1" }),
          })
        )
        .set(
          "entry3",
          new Entry({
            id: "entry3",
            game: "game1",
            selections: fromJS({ category1: "nominee1" }),
          })
        );
      const group = new Group({
        id: "group1",
        game: "game1",
        entries: fromJS({ entry1: true, entry2: true, entry3: true }),
        values: fromJS({ category1: 1 }),
      });

      const state = {
        ...getBaseState(),
        games,
        categories,
        entries,
        groups: new Map().set("group1", group),
        users: new Map(),
      };
      const props = { routeParams: { id: "group1" } };

      const result = rankedGroupEntriesSelector(state, props);
      const ranks = result.map((e) => e.rank).toArray();

      expect(ranks).toEqual([1, 1, 1]);
    });
  });

  describe("peoplesChoicesSelector", () => {
    it("should return the most popular pick for each category", () => {
      const entries = new Map()
        .set(
          "entry1",
          new Entry({
            id: "entry1",
            selections: fromJS({
              cat1: "nominee1",
              cat2: "nominee2",
            }),
          })
        )
        .set(
          "entry2",
          new Entry({
            id: "entry2",
            selections: fromJS({
              cat1: "nominee1",
              cat2: "nominee3",
            }),
          })
        )
        .set(
          "entry3",
          new Entry({
            id: "entry3",
            selections: fromJS({
              cat1: "nominee2",
              cat2: "nominee2",
            }),
          })
        );
      const group = new Group({
        id: "group1",
        entries: fromJS({ entry1: true, entry2: true, entry3: true }),
      });

      const state = {
        ...getBaseState(),
        entries,
        groups: new Map().set("group1", group),
      };
      const props = { routeParams: { id: "group1" } };

      const result = peoplesChoicesSelector(state, props);

      // cat1: nominee1 has 2 votes, nominee2 has 1
      expect(result.get("cat1").has("nominee1")).toBe(true);
      expect(result.get("cat1").get("nominee1")).toBe(2);

      // cat2: nominee2 has 2 votes, nominee3 has 1
      expect(result.get("cat2").has("nominee2")).toBe(true);
      expect(result.get("cat2").get("nominee2")).toBe(2);
    });

    it("should include tied top choices", () => {
      const entries = new Map()
        .set(
          "entry1",
          new Entry({
            id: "entry1",
            selections: fromJS({ cat1: "nominee1" }),
          })
        )
        .set(
          "entry2",
          new Entry({
            id: "entry2",
            selections: fromJS({ cat1: "nominee2" }),
          })
        );
      const group = new Group({
        id: "group1",
        entries: fromJS({ entry1: true, entry2: true }),
      });

      const state = {
        ...getBaseState(),
        entries,
        groups: new Map().set("group1", group),
      };
      const props = { routeParams: { id: "group1" } };

      const result = peoplesChoicesSelector(state, props);

      // Both should be included since they're tied
      expect(result.get("cat1").size).toBe(2);
      expect(result.get("cat1").get("nominee1")).toBe(1);
      expect(result.get("cat1").get("nominee2")).toBe(1);
    });
  });

  // entryRankChangeSelector tests moved to entries-selector.rankChanges.test.js
  // These tests used the old ui.previousRanks approach which has been replaced
  // with answered_order-based ranking calculation

  describe("winningEntriesSelector", () => {
    it("should return all entries with rank 1", () => {
      const games = new Map().set(
        "game1",
        new Game({
          id: "game1",
          categories: new Map().set("cat1", true),
        })
      );
      const categories = new Map().set(
        "cat1",
        new Category({
          id: "cat1",
          correctAnswer: "nominee1",
        })
      );
      const entries = new Map()
        .set(
          "entry1",
          new Entry({
            id: "entry1",
            game: "game1",
            selections: fromJS({ cat1: "nominee1" }),
          })
        )
        .set(
          "entry2",
          new Entry({
            id: "entry2",
            game: "game1",
            selections: fromJS({ cat1: "nominee1" }),
          })
        )
        .set(
          "entry3",
          new Entry({
            id: "entry3",
            game: "game1",
            selections: fromJS({ cat1: "wrong" }),
          })
        );
      const group = new Group({
        id: "group1",
        game: "game1",
        entries: fromJS({ entry1: true, entry2: true, entry3: true }),
        values: fromJS({ cat1: 1 }),
      });

      const state = {
        ...getBaseState(),
        games,
        categories,
        entries,
        groups: new Map().set("group1", group),
        users: new Map(),
      };
      const props = { routeParams: { id: "group1" } };

      const result = winningEntriesSelector(state, props);
      expect(result.size).toBe(2);
      expect(result.every((e) => e.rank === 1)).toBe(true);
    });
  });

  describe("entryCompleteSelector", () => {
    it("should return true when all categories have selections", () => {
      const games = new Map().set(
        "game1",
        new Game({
          id: "game1",
          categories: fromJS({ cat1: true, cat2: true }),
        })
      );
      const entries = new Map().set(
        "entry1",
        new Entry({
          id: "entry1",
          game: "game1",
          selections: fromJS({ cat1: "nom1", cat2: "nom2" }),
        })
      );

      const state = {
        ...getBaseState(),
        games,
        entries,
      };
      const props = { routeParams: { id: "entry1" } };

      expect(entryCompleteSelector(state, props)).toBe(true);
    });

    it("should return false when some categories missing", () => {
      const games = new Map().set(
        "game1",
        new Game({
          id: "game1",
          categories: fromJS({ cat1: true, cat2: true }),
        })
      );
      const entries = new Map().set(
        "entry1",
        new Entry({
          id: "entry1",
          game: "game1",
          selections: fromJS({ cat1: "nom1" }),
        })
      );

      const state = {
        ...getBaseState(),
        games,
        entries,
      };
      const props = { routeParams: { id: "entry1" } };

      expect(entryCompleteSelector(state, props)).toBe(false);
    });
  });

  describe("entryPercentCompleteSelector", () => {
    it("should return percentage of completed categories", () => {
      const games = new Map().set(
        "game1",
        new Game({
          id: "game1",
          categories: fromJS({ cat1: true, cat2: true, cat3: true, cat4: true }),
        })
      );
      const entries = new Map().set(
        "entry1",
        new Entry({
          id: "entry1",
          game: "game1",
          selections: fromJS({ cat1: "nom1", cat2: "nom2" }),
        })
      );

      const state = {
        ...getBaseState(),
        games,
        entries,
      };
      const props = { routeParams: { id: "entry1" } };

      expect(entryPercentCompleteSelector(state, props)).toBe(50);
    });

    it("should return 100 when all complete", () => {
      const games = new Map().set(
        "game1",
        new Game({
          id: "game1",
          categories: fromJS({ cat1: true, cat2: true }),
        })
      );
      const entries = new Map().set(
        "entry1",
        new Entry({
          id: "entry1",
          game: "game1",
          selections: fromJS({ cat1: "nom1", cat2: "nom2" }),
        })
      );

      const state = {
        ...getBaseState(),
        games,
        entries,
      };
      const props = { routeParams: { id: "entry1" } };

      expect(entryPercentCompleteSelector(state, props)).toBe(100);
    });

    it("should return 0 when no selections", () => {
      const games = new Map().set(
        "game1",
        new Game({
          id: "game1",
          categories: fromJS({ cat1: true, cat2: true }),
        })
      );
      const entries = new Map().set(
        "entry1",
        new Entry({
          id: "entry1",
          game: "game1",
          selections: fromJS({}),
        })
      );

      const state = {
        ...getBaseState(),
        games,
        entries,
      };
      const props = { routeParams: { id: "entry1" } };

      expect(entryPercentCompleteSelector(state, props)).toBe(0);
    });
  });
});
