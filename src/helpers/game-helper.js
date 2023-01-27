import { database } from "firebase";
import Nominee from "../models/Nominee";
import Category from "../models/Category";
import data from "../awardsShows/2023Oscars";
import { CURRENT_GAME } from "../constants";

export async function healOldData(dbCategories) {
  const localCategoriesWithKey = Object.keys(data.categories).map((key) => {
    return {
      key,
      ...data.categories[key],
    };
  });

  await Promise.all(
    Object.values(dbCategories).map(async (dbCategory) => {
      const localCategory = localCategoriesWithKey.filter(
        (category) => category.name === dbCategory.name
      )[0];

      const { key, value, order, presentationOrder, name } = localCategory;

      const updates = {
        [`/categories/${dbCategory.id}`]: new Category({
          id: dbCategory.id,
          key,
          game: CURRENT_GAME,
          value,
          order,
          presentationOrder: presentationOrder || 0,
          name,
        }).toJS(),
      };
      database().ref().update(updates);

      const categoryNomineesFetch = await database()
        .ref("nominees")
        .orderByChild("category")
        .equalTo(dbCategory.id)
        .once("value");

      const dbCategoryNominees = Object.values(categoryNomineesFetch.val());
      const localCategoryNominees = localCategory.nominees;

      localCategoryNominees.forEach((localNominee, index) => {
        const matchingDbNominee = dbCategoryNominees.filter(
          (dbNominee) => dbNominee.text === localNominee.text
        )[0];
        const updates = {
          [`/nominees/${matchingDbNominee.id}`]: new Nominee({
            ...localNominee,
            id: matchingDbNominee.id,
            category: matchingDbNominee.category,
            game: matchingDbNominee.game,
            key: index,
          }).toJS(),
          [`/categories/${dbCategory.id}/nominees/${matchingDbNominee.id}`]: true,
        };
        database().ref().update(updates);
      });
    })
  );
}

export async function createNewGame() {
  Object.keys(data.categories).map((key) => {
    const categoryKey = database().ref().child("categories").push().key;
    const { value, order, presentationOrder, name, nominees } = data.categories[
      key
    ];
    const updates = {
      [`/categories/${categoryKey}`]: new Category({
        id: categoryKey,
        key,
        game: CURRENT_GAME,
        value,
        order,
        presentationOrder: presentationOrder || 0,
        name,
      }).toJS(),
      [`/games/${CURRENT_GAME}/categories/${categoryKey}`]: true,
      [`/games/${CURRENT_GAME}/id`]: CURRENT_GAME,
    };
    database().ref().update(updates);

    nominees.map((nominee, index) => {
      const nomineeKey = database().ref().child("nominees").push().key;
      const updates = {
        [`/nominees/${nomineeKey}`]: new Nominee({
          ...nominee,
          id: nomineeKey,
          category: categoryKey,
          game: CURRENT_GAME,
          key: index,
        }).toJS(),
        [`/categories/${categoryKey}/nominees/${nomineeKey}`]: true,
      };
      database().ref().update(updates);
    });
  });
}

export async function syncCurrentGameWithJSONData() {
  const currentGameCategoriesFetch = await database()
    .ref("categories")
    .orderByChild("game")
    .equalTo(CURRENT_GAME)
    .once("value");

  const dbCategories = currentGameCategoriesFetch.val();

  if (!dbCategories) {
    createNewGame();
  } else {
    updateExistingGame(dbCategories);
  }
}

async function updateExistingGame(dbCategories) {
  await Promise.all(
    Object.values(dbCategories).map(async (category) => {
      const categoryNomineesFetch = await database()
        .ref("nominees")
        .orderByChild("category")
        .equalTo(category.id)
        .once("value");

      const dbCategoryNominees = Object.values(categoryNomineesFetch.val());
      const localCategoryNominees = data.categories[category.key].nominees;

      dbCategoryNominees.forEach((dbNominee) => {
        const localNominee = localCategoryNominees[dbNominee.key];
        const updates = {
          [`/nominees/${dbNominee.id}`]: new Nominee({
            ...localNominee,
            id: dbNominee.id,
            category: dbNominee.category,
            game: dbNominee.game,
            key: dbNominee.key,
          }).toJS(),
        };
        database().ref().update(updates);
      });
    })
  );
}

export async function saveImages({ overwrite } = {}) {
  const titlesReq = await database().ref("/titles").once("value");
  const peopleReq = await database().ref("/people").once("value");
  const nomineesReq = await database().ref("/nominees").once("value");

  const titles = titlesReq.val();
  const people = peopleReq.val();
  const nominees = nomineesReq.val();

  const titlesArr = Object.keys(titles).map((key) => titles[key]);
  const peopleArr = Object.keys(people).map((key) => people[key]);
  const nomineesArr = Object.keys(nominees).map((key) => nominees[key]);
  const all = [...titlesArr, ...peopleArr];

  nomineesArr.forEach((nominee) => {
    if (!overwrite && nominee.imageUrl) return;
    const match = findMatch(all, nominee);
    if (!match) {
      if (!nominee.imageUrl) {
        console.log("nominee without match:", JSON.stringify(nominee, null, 2));
      }
      return;
    }
    const isPerson = match.media_type === "person";
    const image = match && (isPerson ? match.profile_path : match.poster_path);
    if (image) setImage(nominee, image);
  });
}

export async function deleteGame(deleteGroups = false) {
  const categoriesToDelete = database()
    .ref("categories")
    .orderByChild("game")
    .equalTo(CURRENT_GAME);

  const categoriesResponse = await categoriesToDelete.once("value");
  const categoriesObj = categoriesResponse.val();

  categoriesObj &&
    Object.values(categoriesObj).forEach(async (category) => {
      await database()
        .ref("nominees")
        .orderByChild("category")
        .equalTo(category.id)
        .ref.remove();
    });

  await categoriesToDelete.ref.remove();

  if (deleteGroups) {
    const groupsToDelete = database()
      .ref("groups")
      .orderByChild("game")
      .equalTo(CURRENT_GAME);

    const groupsResponse = await groupsToDelete.once("value");
    const groupsObj = groupsResponse.val();

    groupsObj &&
      Object.values(groupsObj).forEach(async (group) => {
        const entriesToDelete = await database()
          .ref("entries")
          .orderByChild("group")
          .equalTo(group.id);

        const entriesResponse = await entriesToDelete.once("value");
        const entriesObj = entriesResponse.val();
        entriesObj &&
          Object.values(entriesObj).forEach(async (entry) => {
            const userWithEntriesToDelete = await database()
              .ref(`users/${entry.user}/entries/${entry.id}`)
              .remove();
          });

        entriesToDelete.ref.remove();
      });

    await groupsToDelete.ref.remove();
  }

  await database().ref(`games/${CURRENT_GAME}`).remove();
}

const toOptionalLowercaseText = (text) => (text ? text.toLowerCase() : "");

function findMatch(titlesAndPeopleArray, nomineeToFind) {
  const matches = titlesAndPeopleArray.filter((titleOrPerson) => {
    const titleOrPersonStrings = [
      titleOrPerson.title,
      titleOrPerson.original_title,
      titleOrPerson.name,
    ].map(toOptionalLowercaseText);
    const nomineeToFindStrings = [
      nomineeToFind.text,
      nomineeToFind.secondaryText,
      nomineeToFind.movieDBName,
    ].map(toOptionalLowercaseText);

    let hasMatch = false;
    for (const titleOrPersonString of titleOrPersonStrings) {
      if (hasMatch) {
        return true;
      }
      for (const nomineeToFindString of nomineeToFindStrings) {
        if (hasMatch) {
          return true;
        }
        const areStringsPresentAndMatch =
          titleOrPersonString &&
          nomineeToFindString &&
          titleOrPersonString === nomineeToFindString;

        if (areStringsPresentAndMatch) {
          hasMatch = true;
        }
      }
    }

    return hasMatch;
  });
  const personMatch = matches.filter((match) => match.media_type === "person");
  return personMatch && personMatch.length ? personMatch[0] : matches[0];
}

function setImage(nominee, image) {
  database()
    .ref()
    .update({
      [`/nominees/${nominee.id}/imageUrl`]: `https://image.tmdb.org/t/p/w500${image}`,
    });
}
