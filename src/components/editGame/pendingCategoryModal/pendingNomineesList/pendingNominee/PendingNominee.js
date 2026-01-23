import React from "react";
import PropTypes from "prop-types";
import "./PendingNominee.css";

import { connect } from "react-redux";

import { Record } from "immutable";

import { deleteNominee } from "../../../../../actions/pending-game-actions";

import { ListItem, ListItemText } from "@mui/material";
import DeleteButton from "./deleteButton/DeleteButton";

const PendingNominee = ({ nominee, onDelete }) => {
  return (
    <ListItem
      disabled
      className="PendingNominee"
      secondaryAction={<DeleteButton onClick={() => onDelete(nominee)} />}
    >
      <ListItemText
        primary={nominee.text}
        secondary={nominee.secondaryText}
      />
    </ListItem>
  );
};

PendingNominee.propTypes = {
  nominee: PropTypes.instanceOf(Record).isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default connect(undefined, {
  onDelete: deleteNominee,
})(PendingNominee);
