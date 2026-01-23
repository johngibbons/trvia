import React from "react";
import PropTypes from "prop-types";
import "./PendingCategoryModal.css";
import { connect } from "react-redux";
import { Record, Seq } from "immutable";
import shortid from "shortid";

import Game from "../../../models/Game";

import {
  updatePendingCategory,
  updatePendingNominee,
  savePendingCategory,
  savePendingNominee,
} from "../../../actions/pending-game-actions";

import { closeModal } from "../../../actions/ui-actions";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import PendingNomineesList from "./pendingNomineesList/PendingNomineesList";

const PendingCategoryModal = ({
  open,
  game,
  pendingNominee,
  pendingCategory,
  onChangeCategory,
  onChangeNominee,
  onSaveNominee,
  onClickSave,
  onClose,
}) => {
  const textFieldSx = {
    marginBottom: "12px",
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
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
        Create New Category
      </DialogTitle>
      <DialogContent sx={{ padding: "0 24px 24px" }}>
        <form>
          <section className="PendingCategoryModal-section">
            <h5 className="PendingCategoryModal-section-title">Category</h5>
            <TextField
              type="text"
              autoFocus
              fullWidth
              margin="dense"
              className="PendingCategoryModal-text PendingCategoryModal-input"
              value={pendingCategory.name}
              label="Category"
              placeholder="What's the category?"
              onChange={(e) => onChangeCategory({ name: e.target.value })}
              sx={textFieldSx}
            />
            <TextField
              type="number"
              fullWidth
              margin="dense"
              className="PendingCategoryModal-point-value PendingCategoryModal-input"
              value={pendingCategory.value}
              label="Point Value"
              placeholder="How much is this Category worth?"
              onChange={(e) => onChangeCategory({ value: e.target.value })}
              sx={textFieldSx}
            />
          </section>
          <section className="PendingCategoryModal-section">
            <h5 className="PendingCategoryModal-section-title">Nominees</h5>
            <TextField
              type="text"
              fullWidth
              margin="dense"
              id="PendingCategoryModal-nominee-input"
              className="PendingCategoryModal-nominee-input PendingCategoryModal-input"
              value={pendingNominee.text}
              label="Nominee"
              placeholder="Enter a nominee and hit return to save"
              onChange={(e) => onChangeNominee({ text: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  pendingNominee.text &&
                    onSaveNominee(pendingNominee.set("id", shortid.generate()));
                }
              }}
              sx={textFieldSx}
            />
            <TextField
              type="text"
              fullWidth
              margin="dense"
              className="PendingCategoryModal-nominee-secondary-input PendingCategoryModal-input"
              value={pendingNominee.secondaryText}
              label="Secondary Text (Optional)"
              placeholder="Enter any secondary text, like a subtitle or hint"
              onChange={(e) => onChangeNominee({ secondaryText: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  pendingNominee.text &&
                    onSaveNominee(pendingNominee.set("id", shortid.generate()));
                  document
                    .getElementById("PendingCategoryModal-nominee-input")
                    .focus();
                }
              }}
              sx={textFieldSx}
            />
            <PendingNomineesList
              nominees={pendingCategory.nominees.toIndexedSeq()}
            />
          </section>
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={
                !pendingCategory.name ||
                !pendingCategory.nominees.size ||
                !pendingCategory.value
              }
              onClick={(e) => {
                e.preventDefault();
                onClickSave(
                  pendingCategory.set("id", shortid.generate()),
                  game.id
                );
              }}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "15px",
              }}
            >
              Save Category
            </Button>
            <Button
              className="PendingCategoryModal-cancel-button"
              onClick={onClose}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "15px",
                color: "#666",
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

PendingCategoryModal.propTypes = {
  open: PropTypes.bool,
  game: PropTypes.instanceOf(Game),
  pendingCategory: PropTypes.instanceOf(Record),
  pendingNominee: PropTypes.instanceOf(Record),
  nominees: PropTypes.instanceOf(Seq),
  onChangeCategory: PropTypes.func.isRequired,
  onChangeNominee: PropTypes.func.isRequired,
  onSaveNominee: PropTypes.func.isRequired,
  onClickSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const { ui, pendingCategory, pendingNominee } = state;
  return {
    open: ui.modal === "NEW_CATEGORY",
    pendingNominee,
    pendingCategory,
  };
};

export default connect(mapStateToProps, {
  onChangeCategory: updatePendingCategory,
  onChangeNominee: updatePendingNominee,
  onSaveNominee: savePendingNominee,
  onClickSave: savePendingCategory,
  onClose: closeModal,
})(PendingCategoryModal);
