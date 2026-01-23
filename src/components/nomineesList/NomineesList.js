import React from "react";
import PropTypes from "prop-types";
import "./NomineesList.css";

import { Seq } from "immutable";

import { List } from "@mui/material";
import Nominee from "./nominee/Nominee";

const NomineesList = ({ nominees, answerable }) => {
  return (
    <List>
      {nominees.map((nominee, i) => {
        return <Nominee key={i} nominee={nominee} disabled={!answerable} />;
      })}
    </List>
  );
};

NomineesList.propTypes = {
  nominees: PropTypes.instanceOf(Seq),
  answerable: PropTypes.bool,
};

export default NomineesList;
