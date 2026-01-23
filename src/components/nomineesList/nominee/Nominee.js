import React from "react";
import PropTypes from "prop-types";
import "./Nominee.css";
import { Record } from "immutable";

import { ListItem } from "@mui/material";

const Nominee = ({ nominee, disabled }) => {
  return (
    <div>
      <ListItem
        disabled={disabled}
        primaryText={nominee.text}
        secondaryText={nominee.secondaryText}
      />
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
