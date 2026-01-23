import React from "react";
import PropTypes from "prop-types";
import "./LoginButton.css";
import { connect } from "react-redux";
import { openModal } from "../../../actions/ui-actions";
import { useNavigate } from "react-router-dom";

import FlatButton from "material-ui/FlatButton";

const LoginButton = () => {
  const navigate = useNavigate();

  return (
    <FlatButton
      label="login"
      className="LoginButton"
      onClick={() => navigate("/login")}
    />
  );
};

LoginButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default connect(undefined, {
  onClick: openModal,
})(LoginButton);
