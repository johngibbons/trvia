import { signInSuccess, fetchOrCreateUser } from "./actions/user-actions";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, EmailAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import store from "./store";

let firebaseApp;
export let auth;
export let database;

export function startFirebase(config) {
  firebaseApp = initializeApp(config);
  auth = getAuth(firebaseApp);
  database = getDatabase(firebaseApp);
}

export function startFirebaseUI(ui) {
  // In mock mode, ui will be null - just return null
  if (!ui) {
    return null;
  }

  const uiConfig = {
    callbacks: {
      signInSuccessWithAuthResult(authResult) {
        const currentUser = authResult.user;
        store.dispatch(signInSuccess(currentUser));
        store.dispatch(fetchOrCreateUser(currentUser));
        // Don't redirect here — let the fetchOrCreateUser saga handle
        // the redirect after the user record is created/fetched.
        return false;
      },
    },
    signInFlow: "popup",
    signInOptions: [
      GoogleAuthProvider.PROVIDER_ID,
      EmailAuthProvider.PROVIDER_ID,
    ],
  };
  ui.start("#firebase-auth-container", uiConfig);
  return ui;
}

export function stopFirebaseUI(ui) {
  // In mock mode, ui will be null
  if (!ui) {
    return;
  }
  ui.reset();
}
