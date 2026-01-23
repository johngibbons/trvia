import React from "react";
import PropTypes from "prop-types";
import "./NewGameModal.css";
import { connect } from "react-redux";

import { closeModal, updateNewGameName } from "../../../actions/ui-actions";
import { createGame } from "../../../actions/game-actions";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

const NewGameModal = ({ open, name, onChange, onClose, onClickCreate }) => {
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
        Create New Game
      </DialogTitle>
      <DialogContent sx={{ padding: "0 24px 24px" }}>
        <form>
          <TextField
            type="text"
            autoFocus
            fullWidth
            margin="dense"
            className="NewGameModal-name"
            value={name}
            label="Name"
            placeholder="What do you want to call your game?"
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
              onClickCreate(name);
            }}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "15px",
            }}
          >
            Create Game
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

NewGameModal.propTypes = {
  open: PropTypes.bool,
  name: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onClickCreate: PropTypes.func.isRequired,
};

const mapStateToProps = ({ ui: { modal, newGameName } }) => {
  return {
    open: modal === "NEW_GAME",
    name: newGameName,
  };
};

export default connect(mapStateToProps, {
  onChange: updateNewGameName,
  onClose: closeModal,
  onClickCreate: createGame,
})(NewGameModal);
