import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import { startFirebase, auth } from "./firebaseSetup";
import firebaseui from "firebaseui";
import {
  saveImages,
  deleteGame,
  syncCurrentGameWithJSONData,
  autoFetchNomineeImages,
} from "./helpers/game-helper";
import { STAGING_DATABASE, PROD_DATABASE } from "./constants";
startFirebase(PROD_DATABASE);
syncCurrentGameWithJSONData()
  .then(() => {
    return autoFetchNomineeImages({ overwrite: false });
  })
  .then(() => {
    saveImages({ overwrite: true });
  });
// deleteGame(true);
export const ui = new firebaseui.auth.AuthUI(auth);

ReactDOM.render(<App />, document.getElementById("root"));
