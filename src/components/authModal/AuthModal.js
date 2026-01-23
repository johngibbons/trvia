import React from "react";
import PropTypes from "prop-types";
import "./AuthModal.css";
import { connect } from "react-redux";
import { closeModal } from "../../actions/ui-actions";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import FirebaseContainer from "./FirebaseContainer";

const AuthModal = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: "12px",
          minWidth: "400px",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: "20px",
          fontWeight: 600,
          color: "#333",
          padding: "24px 24px 16px",
        }}
      >
        Log In
      </DialogTitle>
      <DialogContent sx={{ padding: "0 24px 24px" }}>
        <FirebaseContainer />
      </DialogContent>
    </Dialog>
  );
};

AuthModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};

const mapStateToProps = ({ ui }) => {
  return {
    open: ui.modal === "AUTH",
  };
};

export default connect(mapStateToProps, {
  onClose: closeModal,
})(AuthModal);
