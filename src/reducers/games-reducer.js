import {
  CREATE_GAME_SUCCESS,
  SET_GAME,
  UPDATE_GAME,
  SAVE_PENDING_CATEGORY,
  DELETE_GAME,
  UPDATE_ANSWERED_ORDER,
} from "../actions/action-types";
import Game from "../models/Game";
import { fromJS, Map, List } from "immutable";

const games = (state = new Map(), action) => {
  switch (action.type) {
    case CREATE_GAME_SUCCESS:
      return state.set(
        action.payload.gameId,
        new Game(fromJS({ ...action.payload.game, id: action.payload.gameId }))
      );
    case SET_GAME: {
      const { game } = action.payload;
      return state.set(game.id, new Game(fromJS(game)));
    }
    case UPDATE_GAME:
      return state.mergeIn([action.payload.game.id], action.payload.game);
    case SAVE_PENDING_CATEGORY:
      return state.setIn(
        [
          action.payload.gameId,
          "categories",
          action.payload.pendingCategory.id,
        ],
        true
      );
    case DELETE_GAME:
      return state.delete(action.payload.id);
    case UPDATE_ANSWERED_ORDER: {
      const { gameId, categoryId, isScoring } = action.payload;
      const currentOrder = state.getIn([gameId, "answered_order"]) || new List();
      const isMockMode = process.env.REACT_APP_USE_MOCK_DATA === "true";

      if (isMockMode) {
        console.log("🎭 Reducer: UPDATE_ANSWERED_ORDER for game", gameId, "category", categoryId, "isScoring:", isScoring);
        console.log("🎭 Current answered_order:", currentOrder.toJS());
      }

      if (isScoring) {
        // Add category to the end if not already present
        if (!currentOrder.includes(categoryId)) {
          const newState = state.setIn([gameId, "answered_order"], currentOrder.push(categoryId));
          if (isMockMode) {
            console.log("🎭 New answered_order:", newState.getIn([gameId, "answered_order"]).toJS());
          }
          return newState;
        }
      } else {
        // Remove category from the list when un-scoring
        const newState = state.setIn(
          [gameId, "answered_order"],
          currentOrder.filter((id) => id !== categoryId)
        );
        if (isMockMode) {
          console.log("🎭 New answered_order:", newState.getIn([gameId, "answered_order"]).toJS());
        }
        return newState;
      }
      return state;
    }
    default:
      return state;
  }
};

export default games;
