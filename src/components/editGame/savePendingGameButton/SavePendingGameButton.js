import React from "react";
import PropTypes from "prop-types";
import "./SavePendingGameButton.css";

import RaisedButton from "@mui/material/Button";
import { Link } from "react-router-dom";

const SavePendingGameButton = ({ id, disabled }) => (
  <Link to={`/games/${id}`}>
    <RaisedButton primary disabled={disabled} label="Done" />
  </Link>
);

SavePendingGameButton.propTypes = {
  id: PropTypes.string,
  disabled: PropTypes.bool,
};

export default SavePendingGameButton;
