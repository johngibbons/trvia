import React from "react";
import PropTypes from "prop-types";
import "./NewGroupModal.css";
import { connect } from "react-redux";

import { closeModal, updateNewGroupName } from "../../../actions/ui-actions";
import { createGroup } from "../../../actions/group-actions";
import { CURRENT_GAME } from "../../../constants";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

const NewGroupModal = ({ open, name, onChange, onClose, onClickCreate }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create New Group</DialogTitle>
      <DialogContent>
        <form>
          <TextField
            type="text"
            autoFocus
            fullWidth
            margin="dense"
            className="NewGroupModal-name"
            value={name}
            label="Name"
            placeholder="Name your group"
            onChange={(e) => onChange(e.target.value)}
          />
          <div>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={!name}
              onClick={(e) => {
                e.preventDefault();
                onClickCreate(name, CURRENT_GAME);
              }}
            >
              create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

NewGroupModal.propTypes = {
  open: PropTypes.bool,
  name: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onClickCreate: PropTypes.func.isRequired,
};

const mapStateToProps = ({ ui: { modal, newGroupName } }) => {
  return {
    open: modal === "NEW_GROUP",
    name: newGroupName,
  };
};

export default connect(mapStateToProps, {
  onChange: updateNewGroupName,
  onClose: closeModal,
  onClickCreate: createGroup,
})(NewGroupModal);
