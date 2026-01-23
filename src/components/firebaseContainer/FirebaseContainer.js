import React, { Component } from "react";
import { startFirebaseUI } from "../../firebaseSetup";
import { ui } from "../../index";

class FirebaseContainer extends Component {
  constructor() {
    super();
    this.state = { ui: undefined };
  }

  componentDidMount() {
    this.setState({ ui: startFirebaseUI(ui) });
  }

  render() {
    return <div id="firebase-auth-container" />;
  }
}

export default FirebaseContainer;
