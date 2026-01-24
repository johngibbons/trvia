import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./EntryRow.css";
import Entry from "../../../../models/Entry";
import User from "../../../../models/User";
import { entryPossibleScoreSelector } from "../../../../selectors/categories-selector";
import {
  entryUserSelector,
  entryCompleteSelector,
  entryPeoplesChoiceScore,
  entryRankChangeSelector,
} from "../../../../selectors/entries-selector";
import { entryGameStartedSelector } from "../../../../selectors/games-selector";
import classNames from "classnames";
import { Map, Seq } from "immutable";
import WarningIcon from "@mui/icons-material/Warning";
import CheckIcon from "@mui/icons-material/CheckCircle";

import UserAvatar from "../../../users/userAvatar/UserAvatar";

const RankChangeIndicator = ({ rankChange }) => {
  if (!rankChange) return null;

  const indicators = {
    up: { symbol: "↑", className: "EntryRow--rank-change-up" },
    down: { symbol: "↓", className: "EntryRow--rank-change-down" },
    same: { symbol: "–", className: "EntryRow--rank-change-same" },
  };

  const indicator = indicators[rankChange];
  if (!indicator) return null;

  return (
    <span className={`EntryRow--rank-change ${indicator.className}`}>
      {indicator.symbol}
    </span>
  );
};

const EntryRow = ({
  entry,
  possibleScore,
  peoplesChoiceScore,
  categories,
  nominees,
  entryComplete,
  gameStarted,
  user,
  rankChange,
  mostRecentCategoryId,
}) => {
  const navigate = useNavigate();

  return (
    <tr
      key={entry.id}
      className={"EntriesTable--row"}
      onClick={() => navigate(`/entries/${entry.id}`)}
    >
      <td className={"EntriesTable--col EntriesTable--col-rank"}>
        {gameStarted ? (
          <span className="EntryRow--rank-container">
            {entry.rank}
            <RankChangeIndicator rankChange={rankChange} />
          </span>
        ) : entryComplete ? (
          <CheckIcon
            className="EntriesTable__status-icon"
            sx={{ height: "20px", width: "20px", color: "#689F38" }}
          />
        ) : (
          <WarningIcon
            className="EntriesTable__status-icon"
            sx={{ height: "20px", width: "20px", color: "#D32F2F" }}
          />
        )}
      </td>
      <td className={"EntriesTable--col EntriesTable--col-avatar"}>
        <UserAvatar user={user} />
      </td>
      <td className={"EntriesTable--col EntriesTable--col-entry-name"}>
        <div className="EntriesTable--entry-name-container">
          <div className="EntriesTable--entry-name">{entry.name}</div>
          <div className="EntriesTable--user-name">{user.name}</div>
        </div>
      </td>
      <td className={"EntriesTable--col EntriesTable--col-score"}>
        {entry.score} / {possibleScore}
      </td>
      {gameStarted &&
        categories
          .toList()
          .toJS()
          .map((category) => {
            const categoryClasses = classNames(
              "EntriesTable--col",
              "EntriesTable--col-category",
              {
                "EntriesTable--col-correct":
                  category.correctAnswer &&
                  category.correctAnswer === entry.selections[category.id],
              },
              {
                "EntriesTable--col-incorrect":
                  category.correctAnswer &&
                  category.correctAnswer !== entry.selections[category.id],
              },
              {
                "EntriesTable--col-recent":
                  category.id === mostRecentCategoryId,
              }
            );
            const selectedNomineeId = entry.selections[category.id];
            const nominee = nominees[selectedNomineeId];
            return (
              nominee && <td key={category.id} className={categoryClasses}>{nominee.text}</td>
            );
          })}
    </tr>
  );
};

RankChangeIndicator.propTypes = {
  rankChange: PropTypes.oneOf(["up", "down", "same", null]),
};

EntryRow.propTypes = {
  user: PropTypes.instanceOf(User),
  entry: PropTypes.object,
  categories: PropTypes.oneOfType([
    PropTypes.instanceOf(Map),
    PropTypes.instanceOf(Seq),
  ]),
  possibleScore: PropTypes.number,
  entryComplete: PropTypes.bool,
  gameStarted: PropTypes.bool,
  rankChange: PropTypes.oneOf(["up", "down", "same", null]),
  mostRecentCategoryId: PropTypes.string,
};

const mapStateToProps = (state, props) => {
  return {
    peoplesChoiceScore: entryPeoplesChoiceScore(state, props),
    possibleScore: entryPossibleScoreSelector(state, props),
    user: entryUserSelector(state, props),
    entryComplete: entryCompleteSelector(state, props),
    gameStarted: entryGameStartedSelector(state, props),
    nominees: state.nominees.toJS(),
    rankChange: entryRankChangeSelector(state, props.entry.id),
  };
};

export default connect(mapStateToProps)(EntryRow);
