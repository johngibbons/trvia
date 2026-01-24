import Category from "../models/Category";
import { createSelector } from "reselect";
import { currentGameSelector, entryGameSelector, groupGameSelector } from "./games-selector.js";
import { currentEntrySelector } from "./entries-selector";
import { Seq } from "immutable";

export const givenCategorySelector = (state, props) => props.category;

const categoriesSelector = (state) => state.categories;
const groupsSelector = (state) => state.groups;
const groupFromPropsSelector = (state, props) => props.group;
const groupFromParamsSelector = (state, props) =>
  state.groups.get(props.routeParams.id);

export const currentCategorySelector = (state, props) =>
  state.categories.get(props.category.id);

export const currentCategoriesSelector = createSelector(
  currentGameSelector,
  categoriesSelector,
  (game, categories) =>
    game &&
    game.categories
      .keySeq()
      .map((id) => categories.get(id))
      .sort((catA, catB) => catA.presentationOrder - catB.presentationOrder)
);

export const entryCategoriesSelector = createSelector(
  entryGameSelector,
  categoriesSelector,
  (game, categories) => {
    return (
      game &&
      game.categories
        .keySeq()
        .map((id) => categories.get(id) || new Category())
        .sort((c1, c2) => c1.order - c2.order)
    );
  }
);

const entryGroupSelector = createSelector(
  currentEntrySelector,
  groupsSelector,
  (entry, groups) => groups.get(entry.group)
);

export const entryScoreSelector = createSelector(
  entryCategoriesSelector,
  currentEntrySelector,
  entryGroupSelector,
  (categories, entry, group) => {
    if (!categories || !group || !group.values) return 0;
    return categories.reduce(
      (acc, category) =>
        category &&
        category.correctAnswer &&
        category.correctAnswer === entry.selections.get(category.id)
          ? acc + (group.values.get(category.id) || 0)
          : acc,
      0
    );
  }
);

export const entryPossibleScoreSelector = createSelector(
  entryCategoriesSelector,
  entryGroupSelector,
  (categories, group) => {
    if (!categories || !group || !group.values) return 0;
    return categories
      .filter((category) => category && category.correctAnswer)
      .reduce((acc, category) => acc + (group.values.get(category.id) || 0), 0);
  }
);

export const gameTotalPossibleSelector = createSelector(
  entryGroupSelector,
  (group) =>
    group ? group.values.reduce((acc, value) => acc + value, 0) : 0
);

export const groupCategoriesSelector = createSelector(
  groupFromPropsSelector,
  categoriesSelector,
  (group, categories) => {
    if (!group || !group.values) return new Seq();
    return group.values
      .toKeyedSeq()
      .map((val, key) => {
        const category = categories.get(key);
        return category ? category.set("value", val) : null;
      })
      .filter((cat) => cat !== null);
  }
);

export const currentGroupCategoriesSelector = createSelector(
  groupFromParamsSelector,
  categoriesSelector,
  (group, categories) => {
    if (!group) return new Seq();
    return group.values
      .toKeyedSeq()
      .map((val, key) => {
        const category = categories.get(key);
        return category ? category.set("value", val) : null;
      })
      .filter((cat) => cat !== null)
      .sort((catA, catB) => catA.presentationOrder - catB.presentationOrder);
  }
);

export const reorderedGroupCategoriesSelector = createSelector(
  currentGroupCategoriesSelector,
  groupGameSelector,
  (categories, game) => {
    const isProduction = process.env.NODE_ENV === "production";
    const isMockMode = process.env.REACT_APP_USE_MOCK_DATA === "true";
    const shouldLog = isMockMode || isProduction;

    if (!categories || categories.size === 0) return categories;

    const answeredOrder = game?.answered_order;
    if (shouldLog) {
      console.log("📋 reorderedGroupCategoriesSelector:");
      console.log("  answered_order:", answeredOrder ? answeredOrder.toJS() : "null or empty");
    }

    if (!answeredOrder || answeredOrder.size === 0) return categories;

    const mostRecentId = answeredOrder.last();
    if (shouldLog) {
      console.log("  mostRecentId:", mostRecentId);
    }

    const categoriesList = categories.toList();

    // Find and remove the most recent category
    const recentIndex = categoriesList.findIndex(cat => cat?.id === mostRecentId);
    if (recentIndex === -1) {
      if (shouldLog) {
        console.log("  mostRecent category not found in list");
      }
      return categories;
    }

    const recentCategory = categoriesList.get(recentIndex);
    const withoutRecent = categoriesList.delete(recentIndex);

    // Put it at the front
    const reordered = withoutRecent.unshift(recentCategory).toKeyedSeq();

    if (shouldLog) {
      console.log("  Reordered categories (mostRecent moved to front):", reordered.map(c => c.id).toJS());
    }

    return reordered;
  }
);
