import React from "react";
import PropTypes from "prop-types";
import "./EditValuesModal.css";
import { connect } from "react-redux";
import { closeModal } from "../../../actions/ui-actions";
import { saveGroupValues } from "../../../actions/group-actions";
import Group from "../../../models/Group";
import { groupCategoriesSelector } from "../../../selectors/categories-selector";
import { Seq } from "immutable";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import EditValueField from "./editValueField/EditValueField";

const EditValuesModal = ({ open, group, categories, onClickSave, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Category Values</DialogTitle>
      <DialogContent>
        <form className="EditValuesModal--form-container">
          {categories.map((category, i) => {
            return <EditValueField key={i} category={category} group={group} />;
          })}
          <Button
            variant="contained"
            color="primary"
            className="EditValuesModal--save"
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              onClickSave(group.id);
            }}
          >
            save
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

EditValuesModal.propTypes = {
  open: PropTypes.bool,
  group: PropTypes.instanceOf(Group),
  categories: PropTypes.instanceOf(Seq),
  onClickSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

const mapStateToProps = (state, props) => {
  const {
    ui: { modal },
  } = state;
  return {
    open: modal === "EDIT_VALUES",
    categories: groupCategoriesSelector(state, props),
  };
};

export default connect(mapStateToProps, {
  onClose: closeModal,
  onClickSave: saveGroupValues,
})(EditValuesModal);
