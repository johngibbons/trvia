import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import injectTapEventPlugin from "react-tap-event-plugin";
import { startFirebase } from "./firebaseSetup";
import firebase from "firebase";
import firebaseui from "firebaseui";
import {
  saveImages,
  deleteGame,
  syncCurrentGameWithJSONData,
} from "./helpers/game-helper";
import { STAGING_DATABASE, PROD_DATABASE } from "./constants";
injectTapEventPlugin();
startFirebase(PROD_DATABASE);
syncCurrentGameWithJSONData();
saveImages({ overwrite: true });
// deleteGame(true);
export const ui = new firebaseui.auth.AuthUI(firebase.auth());

ReactDOM.render(<App />, document.getElementById("root"));
