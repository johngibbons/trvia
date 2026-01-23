import { signInSuccess, fetchOrCreateUser } from "./actions/user-actions";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, EmailAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import store from "./store";
import { browserHistory } from "react-router";

let firebaseApp;
export let auth;
export let database;

export function startFirebase(config) {
  firebaseApp = initializeApp(config);
  auth = getAuth(firebaseApp);
  database = getDatabase(firebaseApp);
}

export function startFirebaseUI(ui) {
  const uiConfig = {
    callbacks: {
      signInSuccessWithAuthResult(authResult) {
        const currentUser = authResult.user;
        store.dispatch(signInSuccess(currentUser));
        store.dispatch(fetchOrCreateUser(currentUser));
        const nextLocation = store.getState().ui.nextLocation;
        nextLocation
          ? browserHistory.push(nextLocation)
          : browserHistory.push("/");
        return false;
      },
    },
    signInFlow: "popup",
    signInOptions: [
      GoogleAuthProvider.PROVIDER_ID,
      FacebookAuthProvider.PROVIDER_ID,
      EmailAuthProvider.PROVIDER_ID,
    ],
  };
  ui.start("#firebase-auth-container", uiConfig);
  return ui;
}

export function stopFirebaseUI(ui) {
  ui.reset();
}
