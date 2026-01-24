import { createSelector } from "reselect";
import { currentGroupSelector } from "./group-selector";
import { Map, Seq, List } from "immutable";
import Entry from "../models/Entry";
import Game from "../models/Game";
import Group from "../models/Group";
import User from "../models/User";

export const entriesSelector = (state) => state.entries;
const categoriesSelector = (state) => state.categories;
const gamesSelector = (state) => state.games;
const currentUserSelector = (state) => state.currentUser;
const groupsSelector = (state) => state.groups;
const usersSelector = (state) => state.users;
const userFromParamsSelector = (state, props) =>
  state.users.get(props.routeParams.id);

const entryScore = (entry, categories, games, group) => {
  const isMockMode = process.env.REACT_APP_USE_MOCK_DATA === "true";
  const game = games.get(entry.game);
  const gameCategories = game ? game.categories : [];

  if (isMockMode) {
    console.log(`🎯 entryScore calculating for entry ${entry.id}`);
  }

  const score = gameCategories.reduce((acc, _, categoryId) => {
    const category = categories.get(categoryId);
    const hasCorrectAnswer = category && category.correctAnswer;
    const isCorrect = hasCorrectAnswer && category.correctAnswer === entry.selections.get(category.id);

    if (isMockMode && hasCorrectAnswer) {
      console.log(`  Category ${categoryId}: correctAnswer=${category.correctAnswer}, userSelection=${entry.selections.get(category.id)}, isCorrect=${isCorrect}`);
    }

    return isCorrect ? acc + group.values.get(category.id) : acc;
  }, 0);

  if (isMockMode) {
    console.log(`  Total score: ${score}`);
  }

  return score;
};

const entryRankReducer = (entries, curr) => {
  const withSameRank = entries.filter(
    (entry) => entry.score === entries.last().score
  ).size;
  return entries.last() && entries.last().score > curr.score
    ? entries.push(curr.set("rank", entries.last().rank + withSameRank))
    : entries.push(curr.set("rank", entries.last() ? entries.last().rank : 1));
};

export const groupEntriesSelector = createSelector(
  entriesSelector,
  currentGroupSelector,
  (entries, currentGroup) =>
    currentGroup
      .get("entries")
      .mapEntries(([key, val]) => [key, entries.get(key)])
);

export const peoplesChoicesSelector = createSelector(
  groupEntriesSelector,
  (entries) => {
    return entries
      .map((entry) => entry.selections)
      .toList()
      .reduce((acc, selections) => {
        return acc.size === 0
          ? selections.map((val) => new List().push(val))
          : acc.mapEntries(([key, val]) => [
              key,
              val.push(selections.get(key)),
            ]);
      }, new Map())
      .map((selectionsByCategory) => {
        return selectionsByCategory
          .reduce((acc, selection) => {
            return acc.set(selection, (acc.get(selection) || 0) + 1);
          }, new Map())
          .sort((a, b) => b - a)
          .reduce((acc, count, nomineeKey) => {
            return acc.size === 0
              ? acc.set(nomineeKey, count)
              : count === acc.first()
              ? acc.set(nomineeKey, count)
              : acc;
          }, new Map());
      });
  }
);

export const rankedGroupEntriesSelector = createSelector(
  entriesSelector,
  currentGroupSelector,
  categoriesSelector,
  gamesSelector,
  usersSelector,
  (state) => state.ui.previousRanks, // Get previousRanks directly from state
  (entries, group, categories, games, users, previousRanks) => {
    const isMockMode = process.env.REACT_APP_USE_MOCK_DATA === "true";

    if (isMockMode) {
      console.log("🏆 rankedGroupEntriesSelector called");
      console.log(`  Group: ${group ? group.id : 'null'}`);
      console.log(`  Categories with correctAnswer:`, categories.filter(cat => cat.correctAnswer).map((cat, id) => ({ id, correctAnswer: cat.correctAnswer })).toJS());
      console.log(`  previousRanks:`, previousRanks ? previousRanks.toJS() : 'null');
    }

    if (!group) return new Seq();

    const rankedEntries = group.entries
      .keySeq()
      .map((key) => {
        const entry = entries.get(key);
        return entry
          ? entry
              .set("score", entryScore(entry, categories, games, group))
              .set("user", users.get(entry.user) || new User())
          : new Entry({ user: new User() });
      })
      .sort((entryA, entryB) => entryB.score - entryA.score)
      .reduce(entryRankReducer, new List());

    if (isMockMode) {
      console.log("  Ranked entries:", rankedEntries.map(e => ({ id: e.id, name: e.user?.name || 'Unknown', score: e.score, rank: e.rank })).toJS());
    }

    return rankedEntries;
  }
);

export const currentEntrySelector = (state, props) => {
  if (props.entry && props.entry.id) {
    return state.entries.get(props.entry.id) || new Entry();
  } else if (props.routeParams) {
    return state.entries.get(props.routeParams.id) || new Entry();
  } else {
    return new Entry();
  }
};

export const entryPeoplesChoiceScore = createSelector(
  currentEntrySelector,
  peoplesChoicesSelector,
  currentGroupSelector,
  (entry, answersWithCounts, group) => {
    const answersByCategory = answersWithCounts.map((obj) => obj.keySeq());
    return answersByCategory.reduce((acc, answers, category) => {
      return answers.includes(entry.selections.get(category))
        ? acc + group.values.get(category)
        : acc;
    }, 0);
  }
);

const gameStarted = (categoriesSet, categories) => {
  return categoriesSet.reduce((acc, _, key) => {
    const category = categories.get(key);
    return acc || !!(category && category.correctAnswer);
  }, false);
};

export const entryVisibleSelector = createSelector(
  gamesSelector,
  categoriesSelector,
  currentEntrySelector,
  currentUserSelector,
  (games, categories, entry, currentUser) => {
    if (currentUser.id && currentUser.id === entry.user) return true;
    const game = games.get(entry.game) || new Game();
    const gameCategories = game.categories;
    return gameStarted(gameCategories, categories);
  }
);

export const isEntryOwnerSelector = createSelector(
  currentUserSelector,
  currentEntrySelector,
  (user, entry) => user.id && user.id === entry.user
);

export const entryCompleteSelector = createSelector(
  currentEntrySelector,
  gamesSelector,
  (entry, games) => {
    const game = games.get(entry.game);
    return (
      entry && game && entry.selections.count() === game.categories.count()
    );
  }
);

export const entryPercentCompleteSelector = createSelector(
  currentEntrySelector,
  gamesSelector,
  (entry, games) => {
    const game = games.get(entry.game);
    if (!entry || !game) return 0;
    return (entry.selections.count() / game.categories.count()) * 100;
  }
);

export const entryGroupSelector = createSelector(
  groupsSelector,
  currentEntrySelector,
  (groups, entry) => groups.get(entry.group) || new Group()
);

export const entryUserSelector = createSelector(
  currentEntrySelector,
  usersSelector,
  (entry, users) => {
    return entry && entry.user
      ? users.get(entry.user) || new User()
      : new User();
  }
);

export const userEntriesSelector = createSelector(
  userFromParamsSelector,
  entriesSelector,
  (user, entries) =>
    entries
      .toList()
      .filter((entry) => user && entry.user === user.id)
      .sort((a, b) => {
        return b.get("group").localeCompare(a.get("group"));
      })
      .groupBy((entry) => entry.get("group"))
      .toList()
);

export const winningEntriesSelector = createSelector(
  rankedGroupEntriesSelector,
  (entries) => entries.filter((entry) => entry.rank === 1)
);

const previousRanksSelector = (state) => state.ui.previousRanks;

// Selector to get ranks for all entries (used by saga, doesn't require props)
export const allEntryRanksSelector = createSelector(
  entriesSelector,
  groupsSelector,
  categoriesSelector,
  gamesSelector,
  (entries, groups, categories, games) => {
    // Calculate ranks for all entries across all groups
    let allRanks = new Map();

    groups.forEach((group) => {
      if (!group || !group.entries) return;

      const rankedEntries = group.entries
        .keySeq()
        .map((key) => {
          const entry = entries.get(key);
          return entry
            ? entry.set("score", entryScore(entry, categories, games, group))
            : new Entry({ user: new User() });
        })
        .sort((entryA, entryB) => entryB.score - entryA.score)
        .reduce(entryRankReducer, new List());

      rankedEntries.forEach((entry) => {
        if (entry.id) {
          allRanks = allRanks.set(entry.id, entry.rank);
        }
      });
    });

    return allRanks;
  }
);

export const entryRankChangeSelector = (state, entryId) => {
  const isMockMode = process.env.REACT_APP_USE_MOCK_DATA === "true";
  const previousRanks = previousRanksSelector(state);

  // Handle case where previousRanks doesn't exist (e.g., after loading from localStorage)
  if (!previousRanks) {
    if (isMockMode) {
      console.log(`📊 entryRankChangeSelector(${entryId}): No previousRanks`);
    }
    return null;
  }

  const previousRank = previousRanks.get(entryId);

  if (previousRank === undefined) {
    if (isMockMode) {
      console.log(`📊 entryRankChangeSelector(${entryId}): Entry not in previousRanks`);
    }
    return null;
  }

  const entries = state.entries;
  const categories = state.categories;
  const games = state.games;
  const groups = state.groups;
  const users = state.users;

  // Find the group that contains this entry
  const entry = entries.get(entryId);
  if (!entry) return null;

  const group = groups.get(entry.group);
  if (!group) return null;

  // Calculate current rank for this entry
  const rankedEntries = group.entries
    .keySeq()
    .map((key) => {
      const e = entries.get(key);
      return e
        ? e.set("score", entryScore(e, categories, games, group))
        : new Entry({ user: new User() });
    })
    .sort((entryA, entryB) => entryB.score - entryA.score)
    .reduce(entryRankReducer, new List());

  const currentEntry = rankedEntries.find((e) => e.id === entryId);
  const currentRank = currentEntry ? currentEntry.rank : null;

  if (currentRank === null) return null;

  if (isMockMode) {
    console.log(`📊 entryRankChangeSelector(${entryId}): previousRank=${previousRank}, currentRank=${currentRank}`);
  }

  if (currentRank < previousRank) return "up";
  if (currentRank > previousRank) return "down";
  return "same";
};
