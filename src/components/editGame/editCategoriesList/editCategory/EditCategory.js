import React from "react";
import PropTypes from "prop-types";
import "./EditCategory.css";
import { Record, Seq } from "immutable";
import { connect } from "react-redux";
import { currentNomineesSelector } from "../../../../selectors/nominees-selector";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import NomineesList from "../../../nomineesList/NomineesList";

const EditCategory = ({ category, nominees }) => {
  return (
    <Card className="EditCategory">
      <CardHeader title={category.text} subheader={`${category.value} points`} />
      <NomineesList nominees={nominees} />
    </Card>
  );
};

EditCategory.propTypes = {
  category: PropTypes.instanceOf(Record).isRequired,
  nominees: PropTypes.instanceOf(Seq).isRequired,
};

const mapStateToProps = (state, props) => {
  return {
    nominees: currentNomineesSelector(state, props),
  };
};
export default connect(mapStateToProps)(EditCategory);
