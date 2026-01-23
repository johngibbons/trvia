import React from "react";
import PropTypes from "prop-types";
import "./AlertBar.css";
import { connect } from "react-redux";
import { hideAlertBar } from "../../actions/ui-actions";

import Snackbar from "@mui/material/Snackbar";

const AlertBar = ({ isOpen, message, onClose, isError }) => {
  return (
    <Snackbar
      open={isOpen}
      message={message}
      autoHideDuration={3000}
      onClose={onClose}
      ContentProps={{
        sx: {
          backgroundColor: isError ? "rgb(220, 0, 0)" : "#b7a261",
        },
      }}
      sx={{
        boxSizing: "border-box",
        left: 0,
        width: "100vw",
        transform: isOpen ? "translate(0, 0)" : "translate(0, 48px)",
        justifyContent: "center",
      }}
    />
  );
};

const mapStateToProps = ({ ui }) => {
  return {
    isOpen: ui.isAlertBarOpen,
    message: ui.alertBarMessage,
    isError: ui.isAlertBarError,
  };
};

export default connect(mapStateToProps, {
  onClose: hideAlertBar,
})(AlertBar);
