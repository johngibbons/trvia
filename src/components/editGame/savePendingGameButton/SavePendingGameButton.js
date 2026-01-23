import React from "react";
import PropTypes from "prop-types";
import "./SavePendingGameButton.css";

import Button from "@mui/material/Button";
import { Link } from "react-router-dom";

const SavePendingGameButton = ({ id, disabled }) => (
  <Link to={`/games/${id}`}>
    <Button variant="contained" color="primary" disabled={disabled}>
      Done
    </Button>
  </Link>
);

SavePendingGameButton.propTypes = {
  id: PropTypes.string,
  disabled: PropTypes.bool,
};

export default SavePendingGameButton;
