import React from "react";
import PropTypes from "prop-types";
import "./UserEntries.css";
import { connect } from "react-redux";
import { List } from "immutable";

import { userEntriesSelector } from "../../../selectors/entries-selector";

import PageHeading from ".././../pageHeading/PageHeading";
import UserEntriesGroup from "./userEntriesGroup/UserEntriesGroup";

const UserEntries = ({ entriesByGroup }) => {
  if (!entriesByGroup) {
    return <div>Loading...</div>;
  }

  return (
    <div className="UserEntries">
      <PageHeading text="My Entries" />
      {entriesByGroup.size ? (
        <div className="UserEntries--entries-container">
          {entriesByGroup.map((group) => {
            return <UserEntriesGroup key={group.first().group} group={group} />;
          })}
        </div>
      ) : (
        <div>No entries yet.</div>
      )}
    </div>
  );
};

UserEntries.propTypes = {
  entriesByGroup: PropTypes.instanceOf(List),
};

const mapStateToProps = (state, props) => {
  return {
    entriesByGroup: userEntriesSelector(state, props),
  };
};

export default connect(mapStateToProps)(UserEntries);
