import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import { startFirebase, auth } from "./firebaseSetup";
import * as firebaseui from "firebaseui";
import {
  saveImages,
  deleteGame,
  syncCurrentGameWithJSONData,
  autoFetchNomineeImages,
} from "./helpers/game-helper";
import { STAGING_DATABASE, PROD_DATABASE } from "./constants";

// Use environment variable to choose database (defaults to staging for safety)
const database = process.env.REACT_APP_ENVIRONMENT === 'production'
  ? PROD_DATABASE
  : STAGING_DATABASE;

console.log(`🔥 Firebase Environment: ${process.env.REACT_APP_ENVIRONMENT || 'staging'}`);
startFirebase(database);

// Comment out automatic game sync for now - it requires write permissions
// Uncomment these when you need to set up a new game in the database
// syncCurrentGameWithJSONData()
//   .then(() => {
//     return autoFetchNomineeImages({ overwrite: false });
//   })
//   .then(() => {
//     saveImages({ overwrite: true });
//   });
// deleteGame(true);

export const ui = new firebaseui.auth.AuthUI(auth);

ReactDOM.render(<App />, document.getElementById("root"));
