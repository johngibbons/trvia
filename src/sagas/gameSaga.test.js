import { watchCreateGame, createGame, syncGames } from "./gameSaga";

import { CREATE_GAME } from "../actions/action-types";
import * as actions from "../actions/game-actions";

import { fork, takeLatest, call, put } from "redux-saga/effects";
import API from "../api";
import { sync, CHILD_CHANGED } from "./firebase-saga";

describe("game saga", () => {
  it("should watch for game create", () => {
    const generator = watchCreateGame();
    expect(generator.next().value).toEqual(
      fork(takeLatest, CREATE_GAME, createGame)
    );
  });

  it("should create a game", () => {
    const action = actions.createGame("New Game");
    const generator = createGame(action);
    expect(generator.next().value).toEqual(call(API.createGameId, null));
    const newGameId = "abc";
    expect(generator.next(newGameId).value).toEqual(
      call(API.createGame, newGameId, action.payload)
    );
  });

  it("should sync games with Firebase listener", () => {
    const generator = syncGames();
    expect(generator.next().value).toEqual(
      fork(sync, "games", {
        [CHILD_CHANGED]: actions.setGameAttr,
      })
    );
  });
});
