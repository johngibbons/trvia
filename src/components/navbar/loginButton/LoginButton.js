import React from "react";
import PropTypes from "prop-types";
import "./LoginButton.css";
import { connect } from "react-redux";
import { openModal } from "../../../actions/ui-actions";
import { useNavigate } from "react-router-dom";

import Button from "@mui/material/Button";

const LoginButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="text"
      className="LoginButton"
      onClick={() => navigate("/login")}
    >
      login
    </Button>
  );
};

LoginButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default connect(undefined, {
  onClick: openModal,
})(LoginButton);
