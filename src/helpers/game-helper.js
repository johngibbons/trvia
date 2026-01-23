import {
  ref,
  update,
  push,
  child,
  get as firebaseGet,
  query,
  orderByChild,
  equalTo,
  remove as firebaseRemove,
  set,
} from "firebase/database";
import { database } from "../firebaseSetup";
import { Map, fromJS } from "immutable";
import Nominee from "../models/Nominee";
import Category from "../models/Category";
import data from "../awardsShows/2026Oscars";
import { CURRENT_GAME, CURRENT_TITLE } from "../constants";
import MovieDB from "../moviedb";
import API from "../api";

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
      update(ref(database), updates);

      const categoryNomineesFetch = await firebaseGet(query(ref(database, "nominees"), orderByChild("category"), equalTo(dbCategory.id)));

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
            // Preserve existing imageUrl if it exists
            imageUrl: matchingDbNominee.imageUrl || localNominee.imageUrl || "",
          }).toJS(),
          [`/categories/${dbCategory.id}/nominees/${matchingDbNominee.id}`]: true,
        };
        update(ref(database), updates);
      });
    })
  );
}

export async function createNewGame() {
  await Promise.all(
    Object.keys(data.categories).map(async (key) => {
      const categoryKey = push(child(ref(database), "categories")).key;
      const {
        value,
        order,
        presentationOrder,
        name,
        nominees,
      } = data.categories[key];
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
        [`/games/${CURRENT_GAME}/name`]: CURRENT_TITLE,
      };
      await update(ref(database), updates);

      await Promise.all(
        nominees.map(async (nominee, index) => {
          const nomineeKey = push(child(ref(database), "nominees")).key;
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
          await update(ref(database), updates);
        })
      );
    })
  );
}

export async function syncCurrentGameWithJSONData() {
  const currentGameCategoriesFetch = await firebaseGet(query(ref(database, "categories"), orderByChild("game"), equalTo(CURRENT_GAME)));

  const dbCategories = currentGameCategoriesFetch.val();

  if (!dbCategories) {
    await createNewGame();
  } else {
    await updateExistingGame(dbCategories);
  }
}

async function updateExistingGame(dbCategories) {
  await Promise.all(
    Object.values(dbCategories).map(async (category) => {
      const categoryNomineesFetch = await firebaseGet(query(ref(database, "nominees"), orderByChild("category"), equalTo(category.id)));

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
            // Preserve existing imageUrl if it exists
            imageUrl: dbNominee.imageUrl || localNominee.imageUrl || "",
          }).toJS(),
        };
        update(ref(database), updates);
      });
    })
  );
}

export async function saveImages({ overwrite } = {}) {
  const titlesReq = await firebaseGet(ref(database, "/titles"));
  const peopleReq = await firebaseGet(ref(database, "/people"));
  const nomineesReq = await firebaseGet(ref(database, "/nominees"));

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

  await firebaseRemove(ref(database, `games/${CURRENT_GAME}`));
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

function determineNomineeType(nominee, categoryName) {
  // If nominee has secondaryText, it's likely a person (text = person name, secondaryText = movie)
  if (nominee.secondaryText) {
    return "person";
  }

  // Check category name for hints
  const categoryLower = (categoryName || "").toLowerCase();
  if (
    categoryLower.includes("performance") ||
    categoryLower.includes("actor") ||
    categoryLower.includes("actress") ||
    categoryLower.includes("director") ||
    categoryLower.includes("screenplay")
  ) {
    return "person";
  }

  // Default to title for categories like "Best Motion Picture", "Animated", etc.
  return "title";
}

function isExactMatch(result, nominee) {
  const resultName = (result.name || result.title || "").toLowerCase().trim();
  const nomineeText = (nominee.text || "").toLowerCase().trim();
  const nomineeMovieDBName = (nominee.movieDBName || "").toLowerCase().trim();

  return resultName === nomineeText || resultName === nomineeMovieDBName;
}

function selectBestMatch(searchResults, nominee, nomineeType) {
  if (
    !searchResults ||
    !searchResults.results ||
    searchResults.results.length === 0
  ) {
    return null;
  }

  const results = searchResults.results;

  // Filter results by type and ensure they have images
  const filteredResults = results.filter((result) => {
    if (nomineeType === "person") {
      return result.media_type === "person" && result.profile_path;
    } else {
      return (
        (result.media_type === "movie" || result.media_type === "tv") &&
        result.poster_path
      );
    }
  });

  if (filteredResults.length === 0) {
    return null;
  }

  // Prefer exact matches
  const exactMatches = filteredResults.filter((result) =>
    isExactMatch(result, nominee)
  );

  if (exactMatches.length > 0) {
    return exactMatches[0];
  }

  // If no exact match, prefer results that match nominee text or secondaryText
  const textMatches = filteredResults.filter((result) => {
    const resultName = (result.name || result.title || "").toLowerCase();
    const nomineeText = (nominee.text || "").toLowerCase();
    const nomineeSecondaryText = (nominee.secondaryText || "").toLowerCase();
    const nomineeMovieDBName = (nominee.movieDBName || "").toLowerCase();

    return (
      resultName.includes(nomineeText) ||
      nomineeText.includes(resultName) ||
      resultName.includes(nomineeMovieDBName) ||
      nomineeMovieDBName.includes(resultName) ||
      (nomineeSecondaryText &&
        (resultName.includes(nomineeSecondaryText) ||
          nomineeSecondaryText.includes(resultName)))
    );
  });

  if (textMatches.length > 0) {
    return textMatches[0];
  }

  // Return first result if no better match found
  return filteredResults[0];
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function autoFetchNomineeImages({ overwrite } = {}) {
  console.log("Starting auto-fetch of nominee images...");

  // Fetch all nominees for the current game
  const nomineesReq = await firebaseGet(query(ref(database, "nominees"), orderByChild("game"), equalTo(CURRENT_GAME)));

  const nominees = nomineesReq.val();

  if (!nominees) {
    console.log("No nominees found for current game");
    return;
  }

  // Fetch categories to get category names
  const categoriesReq = await firebaseGet(query(ref(database, "categories"), orderByChild("game"), equalTo(CURRENT_GAME)));

  const categories = categoriesReq.val() || {};
  const categoryMap = Object.values(categories).reduce((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {});

  const nomineesArr = Object.values(nominees);

  // Debug: Check a few sample nominees to see their structure
  if (nomineesArr.length > 0) {
    const sampleNominee = nomineesArr[0];
    console.log("Sample nominee structure:", {
      id: sampleNominee.id,
      text: sampleNominee.text,
      imageUrl: sampleNominee.imageUrl,
      imageUrlType: typeof sampleNominee.imageUrl,
      imageUrlLength: sampleNominee.imageUrl
        ? sampleNominee.imageUrl.length
        : 0,
      allKeys: Object.keys(sampleNominee),
    });
  }

  // Check for nominees with images - handle empty strings, null, undefined
  const nomineesWithImages = nomineesArr.filter(
    (nominee) => nominee.imageUrl && nominee.imageUrl.trim() !== ""
  );

  const nomineesWithoutImages = nomineesArr.filter((nominee) => {
    const hasImage = nominee.imageUrl && nominee.imageUrl.trim() !== "";
    return overwrite || !hasImage;
  });

  console.log(
    `Found ${nomineesWithoutImages.length} nominees without images (out of ${nomineesArr.length} total)`
  );
  console.log(
    `Nominees with images: ${nomineesWithImages.length}, Sample imageUrl: ${
      (nomineesWithImages[0] && nomineesWithImages[0].imageUrl) || "N/A"
    }`
  );

  // Early exit if all nominees already have images
  if (nomineesWithoutImages.length === 0) {
    console.log("All nominees already have images. Skipping auto-fetch.");
    return;
  }

  let savedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  // Process nominees sequentially to avoid rate limiting
  for (let i = 0; i < nomineesWithoutImages.length; i++) {
    const nominee = nomineesWithoutImages[i];

    // Double-check that nominee doesn't have an image (skip if it does)
    const hasImage = nominee.imageUrl && nominee.imageUrl.trim() !== "";
    if (!overwrite && hasImage) {
      console.log(
        `Skipping nominee ${nominee.text} (ID: ${nominee.id}): already has image`
      );
      skippedCount++;
      continue;
    }

    const categoryName = categoryMap[nominee.category] || "";

    try {
      // Determine search query
      const searchQuery = nominee.movieDBName || nominee.text;
      if (!searchQuery) {
        console.log(
          `Skipping nominee ${nominee.id}: no search query available`
        );
        skippedCount++;
        continue;
      }

      // Determine nominee type
      const nomineeType = determineNomineeType(nominee, categoryName);

      // Search MovieDB
      console.log(
        `Searching for: "${searchQuery}" (type: ${nomineeType}) [${i + 1}/${
          nomineesWithoutImages.length
        }]`
      );
      const searchResults = await MovieDB.searchMulti(searchQuery);

      // Select best match
      const bestMatch = selectBestMatch(searchResults, nominee, nomineeType);

      if (!bestMatch) {
        console.log(
          `No match found for nominee: ${nominee.text} (ID: ${nominee.id})`
        );
        skippedCount++;
        // Add delay even when no match to avoid rate limiting
        await delay(250);
        continue;
      }

      // Convert to Immutable Map for API
      const matchMap = fromJS(bestMatch);

      // Save to Firebase
      if (nomineeType === "person") {
        await API.savePerson(matchMap);
        console.log(
          `Saved person: ${bestMatch.name} (ID: ${bestMatch.id}) for nominee: ${nominee.text}`
        );
      } else {
        await API.saveTitle(matchMap);
        console.log(
          `Saved title: ${bestMatch.title || bestMatch.name} (ID: ${
            bestMatch.id
          }) for nominee: ${nominee.text}`
        );
      }

      savedCount++;

      // Add delay between API calls to avoid rate limiting (250ms = ~4 requests/second)
      await delay(250);
    } catch (error) {
      console.error(
        `Error processing nominee ${nominee.text} (ID: ${nominee.id}):`,
        error
      );
      errorCount++;
      // Add delay even on error
      await delay(250);
    }
  }

  console.log(
    `Auto-fetch complete. Saved: ${savedCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`
  );

  // After all nominees are processed, call saveImages to update nominee imageUrls
  if (savedCount > 0) {
    console.log("Updating nominee imageUrls...");
    await saveImages({ overwrite });
    console.log("Nominee imageUrls updated");
  }
}
