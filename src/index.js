import React from "react";
import { createRoot } from "react-dom/client";
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

// Check if we're using mock data
const useMockData = process.env.REACT_APP_USE_MOCK_DATA === "true";

// Only initialize Firebase and AuthUI if not in mock mode
let ui = null;

if (!useMockData) {
  // Use environment variable to choose database (defaults to staging for safety)
  const database =
    process.env.REACT_APP_ENVIRONMENT === "production"
      ? PROD_DATABASE
      : STAGING_DATABASE;

  console.log(
    `🔥 Firebase Environment: ${process.env.REACT_APP_ENVIRONMENT || "staging"}`
  );
  startFirebase(database);

  // Initialize FirebaseUI only after Firebase is started
  ui = new firebaseui.auth.AuthUI(auth);
} else {
  console.log("🎭 Mock Mode - Skipping Firebase initialization");
}

// Export ui (will be null in mock mode)
export { ui };

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

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
