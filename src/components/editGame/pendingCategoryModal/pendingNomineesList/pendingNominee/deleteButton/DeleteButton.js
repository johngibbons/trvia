import React from "react";
import PropTypes from "prop-types";
import "./DeleteButton.css";

import IconButton from "@mui/material/IconButton";
import CancelIcon from "@mui/icons-material/Cancel";
import { red } from "@mui/material/colors";

const DeleteButton = ({ onClick }) => {
  return (
    <IconButton
      className="DeleteButton"
      onClick={onClick}
      sx={{ color: red[50], '&:hover': { color: red[900] } }}
    >
      <CancelIcon />
    </IconButton>
  );
};

DeleteButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default DeleteButton;
