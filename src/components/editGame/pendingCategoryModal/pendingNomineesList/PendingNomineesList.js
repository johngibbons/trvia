import React from "react";
import PropTypes from "prop-types";
import "./PendingNomineesList.css";

import { Seq } from "immutable";

import { List } from "@mui/material";
import PendingNominee from "./pendingNominee/PendingNominee";

const PendingNomineesList = ({ nominees }) => {
  return (
    <List>
      {nominees.map((nominee, i) => (
        <PendingNominee key={i} nominee={nominee} index={i} />
      ))}
    </List>
  );
};

PendingNomineesList.propTypes = {
  nominees: PropTypes.instanceOf(Seq),
};

export default PendingNomineesList;
