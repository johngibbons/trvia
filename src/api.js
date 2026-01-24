import { ref, set, update, push, child } from "firebase/database";
import { signOut as firebaseSignOut } from "firebase/auth";
import { database, auth } from "./firebaseSetup";
import { Map } from "immutable";
import Game from "./models/Game";
import Group from "./models/Group";
import Entry from "./models/Entry";

export default class API {
  static signOut() {
    return firebaseSignOut(auth);
  }

  static saveTitle(title) {
    return set(ref(database, `/titles/${title.get("id")}`), title.toJS());
  }

  static savePerson(person) {
    return set(ref(database, `/people/${person.get("id")}`), person.toJS());
  }

  static createUser(user) {
    return set(ref(database, `/users/${user.id}`), user.toJS());
  }

  static createGameId() {
    return push(child(ref(database), "games")).key;
  }

  static createGame(newGameId, game) {
    const updates = {
      [`/games/${newGameId}`]: new Game({ ...game, id: newGameId }).toJS(),
    };
    return update(ref(database), updates);
  }

  static createGroupId() {
    return push(child(ref(database), "groups")).key;
  }

  static createGroup(newGroupId, group, user, categoryValues) {
    const updates = {
      [`/groups/${newGroupId}`]: new Group({
        ...group,
        id: newGroupId,
        admin: user.id,
        values: new Map(categoryValues),
      }).toJS(),
      [`/users/${user.id}/groups/${newGroupId}`]: { admin: true },
      [`/games/${group.game}/groups/${newGroupId}`]: true,
    };
    return update(ref(database), updates);
  }

  static createEntryId() {
    return push(child(ref(database), "entries")).key;
  }

  static createEntry(newEntryId, entry, user) {
    const updates = user.groups.get(entry.group)
      ? {
          [`/entries/${newEntryId}`]: new Entry({
            ...entry,
            id: newEntryId,
          }).toJS(),
          [`/groups/${entry.group}/entries/${newEntryId}`]: true,
          [`/games/${entry.game}/entries/${newEntryId}`]: true,
          [`/users/${user.id}/entries/${newEntryId}`]: true,
        }
      : {
          [`/entries/${newEntryId}`]: new Entry({
            ...entry,
            id: newEntryId,
          }).toJS(),
          [`/groups/${entry.group}/entries/${newEntryId}`]: true,
          [`/games/${entry.game}/entries/${newEntryId}`]: true,
          [`/users/${user.id}/groups/${entry.group}`]: true,
          [`/users/${user.id}/entries/${newEntryId}`]: true,
        };
    return update(ref(database), updates);
  }

  static selectNominee(entryId, nominee) {
    return set(
      ref(database, `/entries/${entryId}/selections/${nominee.category}`),
      nominee.id
    );
  }

  static selectCorrectNominee(nominee) {
    const key = push(
      child(ref(database), `games/${nominee.game}/answeredOrder`)
    ).key;
    const updates = {
      [`/categories/${nominee.category}/correctAnswer`]: nominee.id,
      [`/games/${nominee.game}/answeredOrder/${key}`]: nominee.id,
    };
    return update(ref(database), updates);
  }

  static updateGame(gameId, updates) {
    const gameUpdates = Object.keys(updates).reduce((acc, key) => {
      acc[`/games/${gameId}/${key}`] = updates[key];
      return acc;
    }, {});
    return update(ref(database), gameUpdates);
  }
}
