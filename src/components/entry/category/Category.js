import React from "react";
import PropTypes from "prop-types";
import "./Category.css";
import { Record, Seq } from "immutable";
import { connect } from "react-redux";
import classNames from "classnames";
import { currentNomineesSelector } from "../../../selectors/nominees-selector";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import NomineesGrid from "./nomineesGrid/NomineesGrid";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import OscarIcon from "../../OscarIcon";

const Category = ({ category, value, nominees, selectedNomineeId }) => {
  const incorrect =
    category.correctAnswer && category.correctAnswer !== selectedNomineeId;
  const correct = category.correctAnswer && !incorrect;
  const categoryClasses = classNames("Category", {
    "Category--selected": !!selectedNomineeId,
    "Category--correct": correct,
    "Category--incorrect": incorrect,
  });
  const doneColor = "rgb(56, 109, 159)";

  return (
    <Card className={categoryClasses}>
      <CardHeader
        avatar={
          category.correctAnswer ? (
            incorrect ? (
              <CancelIcon
                className="Category__status-icon Category__status-icon--incorrect"
                sx={{ color: "rgb(255, 0, 0)" }}
              />
            ) : (
              <div className="Category__status-icon Category__status-icon--correct">
                <div className="Category__oscar-icon">
                  <OscarIcon width="18px" height="18px" fill="#fff" />
                </div>
              </div>
            )
          ) : selectedNomineeId ? (
            <CheckCircleIcon
              className="Category__status-icon Category__selection-icon Category__complete-icon"
              sx={{ color: doneColor }}
            />
          ) : (
            <div className="Category__status-icon Category__selection-icon Category__incomplete-icon" />
          )
        }
        title={category.name}
        subheader={`${value} points`}
        sx={{
          display: "flex",
          alignItems: "center",
          padding: "16px",
          "& .MuiCardHeader-content": {
            paddingRight: 0,
          },
          "& .MuiCardHeader-title": {
            fontSize: "16px",
            fontWeight: 600,
            color: "#333",
          },
          "& .MuiCardHeader-subheader": {
            fontSize: "13px",
            color: "#666",
          },
        }}
      />
      <NomineesGrid
        categoryId={category.id}
        nominees={nominees}
        selectedNomineeId={selectedNomineeId}
        correctNomineeId={category.correctAnswer}
        isIncorrect={incorrect}
      />
    </Card>
  );
};

Category.propTypes = {
  entry: PropTypes.instanceOf(Record),
  category: PropTypes.instanceOf(Record).isRequired,
  value: PropTypes.number,
  nominees: PropTypes.instanceOf(Seq).isRequired,
  selectedNomineeId: PropTypes.string,
};

const mapStateToProps = (state, props) => {
  return {
    nominees: currentNomineesSelector(state, props),
    selectedNomineeId: props.entry
      ? props.entry.getIn(["selections", props.category.id])
      : props.category.correctAnswer,
  };
};
export default connect(mapStateToProps)(Category);
