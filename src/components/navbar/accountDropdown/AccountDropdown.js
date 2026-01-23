import React from "react";
import PropTypes from "prop-types";
import "./AccountDropdown.css";
import { connect } from "react-redux";
import { Record } from "immutable";
import { signOut } from "../../../actions/user-actions";
import { useNavigate } from "react-router-dom";

import IconMenu from "@mui/material/Menu";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import UserAvatar from "../../users/userAvatar/UserAvatar";

const AccountDropdown = ({ currentUser, onClickSignOut }) => {
  const navigate = useNavigate();

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
        onClick={() => navigate(`/users/${currentUser.id}/entries`)}
      />
      <MenuItem primaryText="Sign out" onClick={onClickSignOut} />
    </IconMenu>
  );
};

AccountDropdown.propTypes = {
  currentUser: PropTypes.instanceOf(Record),
  onClickSignOut: PropTypes.func.isRequired,
};

const mapStateToProps = ({ currentUser }) => {
  return {
    currentUser,
  };
};

export default connect(mapStateToProps, {
  onClickSignOut: signOut,
})(AccountDropdown);
