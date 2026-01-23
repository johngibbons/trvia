import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import "./NewEntryModal.css";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import User from "../../../models/User";

import { closeModal, updateNewEntryName } from "../../../actions/ui-actions";
import { createEntry } from "../../../actions/entry-actions";

const NewEntryModal = ({
  open,
  name,
  groupId,
  gameId,
  currentUser,
  onClose,
  onChange,
  onClickCreate,
}) => {
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
        Create Your Entry
      </DialogTitle>
      <DialogContent sx={{ padding: "0 24px 24px" }}>
        <form>
          <TextField
            type="text"
            autoFocus
            fullWidth
            margin="dense"
            className="NewEntryModal-name"
            value={name}
            label="Name"
            placeholder="What do you want to call your entry?"
            onChange={(e) => onChange(e.target.value)}
            sx={{
              marginBottom: "20px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            disabled={!name}
            onClick={(e) => {
              e.preventDefault();
              onClose();
              onChange("");
              onClickCreate(name, groupId, gameId, currentUser.id);
            }}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "15px",
            }}
          >
            Create Entry
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

NewEntryModal.propTypes = {
  open: PropTypes.bool,
  name: PropTypes.string,
  groupId: PropTypes.string.isRequired,
  gameId: PropTypes.string.isRequired,
  currentUser: PropTypes.instanceOf(User),
  onClose: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onClickCreate: PropTypes.func.isRequired,
};

const mapStateToProps = ({ ui, currentUser }) => {
  return {
    open: ui.modal === "NEW_ENTRY",
    name: ui.newEntryName,
    currentUser,
  };
};

export default connect(mapStateToProps, {
  onClose: closeModal,
  onChange: updateNewEntryName,
  onClickCreate: createEntry,
})(NewEntryModal);
