import {
  CREATE_GAME,
  CREATE_GAME_SUCCESS,
  UPDATE_GAME,
  FETCH_GAME,
  SET_GAME,
  SET_GAME_ATTR,
  UPDATE_ANSWERED_ORDER,
} from "./action-types";

export function createGame(name) {
  return {
    type: CREATE_GAME,
    payload: {
      name,
    },
  };
}

export function createGameSuccess(gameId, game) {
  return {
    type: CREATE_GAME_SUCCESS,
    payload: {
      gameId,
      game,
    },
  };
}

export function updateGame(game) {
  return {
    type: UPDATE_GAME,
    payload: { game },
  };
}

export function fetchGame(id) {
  return {
    type: FETCH_GAME,
    payload: { id },
  };
}

export function setGame(game) {
  return {
    type: SET_GAME,
    payload: { game },
  };
}

export function setGameAttr(response) {
  return {
    type: SET_GAME_ATTR,
    payload: {
      game: response.value,
    },
  };
}

export function updateAnsweredOrder(gameId, categoryId, isScoring) {
  return {
    type: UPDATE_ANSWERED_ORDER,
    payload: { gameId, categoryId, isScoring },
  };
}
