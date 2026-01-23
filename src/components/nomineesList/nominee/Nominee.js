import React from "react";
import PropTypes from "prop-types";
import "./Nominee.css";
import { Record } from "immutable";

import { ListItem, ListItemText } from "@mui/material";

const Nominee = ({ nominee, disabled }) => {
  return (
    <div>
      <ListItem disabled={disabled}>
        <ListItemText
          primary={nominee.text}
          secondary={nominee.secondaryText}
        />
      </ListItem>
      <img
        src={nominee.imageUrl}
        style={{
          maxWidth: "100%",
        }}
      />
    </div>
  );
};

Nominee.propTypes = {
  nominee: PropTypes.instanceOf(Record),
};

export default Nominee;
