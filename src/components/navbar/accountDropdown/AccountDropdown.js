import React, { PropTypes } from "react";
import "./AccountDropdown.css";
import { connect } from "react-redux";
import { Record } from "immutable";
import { signOut } from "../../../actions/user-actions";
import { push } from "react-router-redux";

import IconMenu from "material-ui/IconMenu";
import IconButton from "material-ui/IconButton";
import MenuItem from "material-ui/MenuItem";
import UserAvatar from "../../users/userAvatar/UserAvatar";

const AccountDropdown = ({ currentUser, onClickSignOut, onClickMyGroups }) => {
  return (
    <IconMenu
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      targetOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      iconButtonElement={
        <IconButton className="AccountDropdown-icon">
          <UserAvatar user={currentUser} />
        </IconButton>
      }
    >
      <MenuItem
        primaryText="My Entries"
        onClick={() => onClickMyGroups(currentUser.id)}
      />
      <MenuItem primaryText="Sign out" onClick={onClickSignOut} />
    </IconMenu>
  );
};

AccountDropdown.propTypes = {
  currentUser: PropTypes.instanceOf(Record),
  onClickSignOut: PropTypes.func.isRequired,
  onClickMyGroups: PropTypes.func.isRequired,
};

const mapStateToProps = ({ currentUser }) => {
  return {
    currentUser,
  };
};

export default connect(mapStateToProps, {
  onClickSignOut: signOut,
  onClickMyGroups: (id) => push(`/users/${id}/entries`),
})(AccountDropdown);
