import React, { useState } from "react";
import PropTypes from "prop-types";
import "./AccountDropdown.css";
import { connect } from "react-redux";
import { Record } from "immutable";
import { signOut } from "../../../actions/user-actions";
import { useNavigate } from "react-router-dom";

import Menu from "@mui/material/Menu";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import UserAvatar from "../../users/userAvatar/UserAvatar";

const AccountDropdown = ({ currentUser, onClickSignOut }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMyEntries = () => {
    navigate(`/users/${currentUser.id}/entries`);
    handleClose();
  };

  const handleSignOut = () => {
    onClickSignOut();
    handleClose();
  };

  return (
    <>
      <IconButton
        className="AccountDropdown-icon"
        onClick={handleClick}
        aria-controls={open ? 'account-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <UserAvatar user={currentUser} />
      </IconButton>
      <Menu
        id="account-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleMyEntries}>My Entries</MenuItem>
        <MenuItem onClick={handleSignOut}>Sign out</MenuItem>
      </Menu>
    </>
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
