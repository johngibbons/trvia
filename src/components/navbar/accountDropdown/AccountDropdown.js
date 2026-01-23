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
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import ListIcon from "@mui/icons-material/FormatListBulleted";
import LogoutIcon from "@mui/icons-material/Logout";
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
        PaperProps={{
          sx: {
            borderRadius: "10px",
            minWidth: "180px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.12)",
            mt: 1,
          },
        }}
      >
        <MenuItem
          onClick={handleMyEntries}
          sx={{
            padding: "10px 16px",
            fontSize: "14px",
            "&:hover": {
              backgroundColor: "rgba(183, 162, 97, 0.08)",
            },
          }}
        >
          <ListItemIcon>
            <ListIcon sx={{ fontSize: 20, color: "#666" }} />
          </ListItemIcon>
          My Entries
        </MenuItem>
        <Divider sx={{ margin: "4px 0" }} />
        <MenuItem
          onClick={handleSignOut}
          sx={{
            padding: "10px 16px",
            fontSize: "14px",
            color: "#666",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <ListItemIcon>
            <LogoutIcon sx={{ fontSize: 20, color: "#666" }} />
          </ListItemIcon>
          Sign out
        </MenuItem>
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
