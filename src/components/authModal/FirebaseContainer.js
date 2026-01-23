import React, { Component } from "react";
import { startFirebaseUI, stopFirebaseUI } from "../../firebaseSetup";
import { ui } from "../../index";

class FirebaseContainer extends Component {
  constructor() {
    super();
    this.state = { ui: undefined };
  }

  componentDidMount() {
    this.setState({ ui: startFirebaseUI(ui) });
  }

  componentWillUnmount() {
    stopFirebaseUI(this.state.ui);
  }

  render() {
    return <div id="firebase-auth-container" />;
  }
}

export default FirebaseContainer;
