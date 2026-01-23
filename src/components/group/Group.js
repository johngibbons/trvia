import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import "./Group.css";
import { List, Seq } from "immutable";
import GroupModel from "../../models/Group";
import Game from "../../models/Game";
import {
  rankedGroupEntriesSelector,
  winningEntriesSelector,
} from "../../selectors/entries-selector";
import { currentGroupSelector } from "../../selectors/group-selector";
import { currentGroupCategoriesSelector } from "../../selectors/categories-selector";
import {
  groupGameStartedSelector,
  groupGameEndedSelector,
  groupGameSelector,
} from "../../selectors/games-selector";
import { openModal } from "../../actions/ui-actions";

import Button from "@mui/material/Button";
import NewEntryModal from "../../components/entry/newEntryModal/NewEntryModal";
import PageHeading from "../pageHeading/PageHeading";
import EntriesTable from "./entriesTable/EntriesTable";
import EditValuesModal from "./editValuesModal/EditValuesModal";
import WinnerBanner from "./winnerBanner/WinnerBanner";

const Group = ({
  currentUser,
  group,
  categories,
  game,
  entries,
  winningEntries,
  routeParams,
  gameStarted,
  gameEnded,
  onClickNewEntry,
}) => {
  // Show loading state if data isn't loaded yet
  if (!group || !game) {
    return <div className="Group">Loading...</div>;
  }

  return (
    <div className="Group">
      <h5 className="Group--game-name">{game.name}</h5>
      <PageHeading text={group.name} />
      {!gameStarted && (
        <div className="Group--actions">
          <Button
            className="Group--create-entry-button"
            variant="contained"
            sx={{
              color: "#212121",
              textTransform: "none",
              fontWeight: 600,
              padding: "10px 24px",
              borderRadius: "8px",
            }}
            onClick={() => onClickNewEntry("NEW_ENTRY")}
          >
            Create your entry
          </Button>
          {currentUser.id === group.admin && (
            <Button
              variant="outlined"
              sx={{
                color: "#b7a261",
                borderColor: "#b7a261",
                textTransform: "none",
                fontWeight: 600,
                padding: "10px 24px",
                borderRadius: "8px",
                "&:hover": {
                  borderColor: "#9a8a52",
                  backgroundColor: "rgba(183, 162, 97, 0.08)",
                },
              }}
              onClick={() => onClickNewEntry("EDIT_VALUES")}
            >
              Edit Category Values
            </Button>
          )}
        </div>
      )}
      {gameEnded && <WinnerBanner winningEntries={winningEntries} />}
      <EntriesTable
        entries={entries}
        categories={categories}
        gameStarted={gameStarted}
      />
      {group.id && <NewEntryModal groupId={routeParams.id} gameId={group.game} />}
      {currentUser.id === group.admin && <EditValuesModal group={group} />}
    </div>
  );
};

Group.propTypes = {
  currentUser: PropTypes.object.isRequired,
  game: PropTypes.instanceOf(Game),
  categories: PropTypes.instanceOf(Seq),
  group: PropTypes.instanceOf(GroupModel),
  entries: PropTypes.instanceOf(List),
  winningEntries: PropTypes.instanceOf(List),
  routeParams: PropTypes.object,
  gameStarted: PropTypes.bool,
  gameEnded: PropTypes.bool,
  onClickNewEntry: PropTypes.func.isRequired,
};

const mapStateToProps = (state, props) => {
  return {
    currentUser: state.currentUser,
    entries: rankedGroupEntriesSelector(state, props),
    group: currentGroupSelector(state, props),
    categories: currentGroupCategoriesSelector(state, props),
    gameStarted: groupGameStartedSelector(state, props),
    gameEnded: groupGameEndedSelector(state, props),
    game: groupGameSelector(state, props),
    winningEntries: winningEntriesSelector(state, props),
  };
};

export default connect(mapStateToProps, {
  onClickNewEntry: openModal,
})(Group);
