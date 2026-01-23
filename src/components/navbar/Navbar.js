import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import { connect } from "react-redux";

import AppBar from "material-ui/AppBar";
import LoginButton from "./loginButton/LoginButton";
import AccountDropdown from "./accountDropdown/AccountDropdown";

const Navbar = ({ loggedIn }) => {
  const navigate = useNavigate();

  return (
    <AppBar
      title="trvia"
      titleStyle={{
        cursor: "pointer",
        color: "#212121",
        fontSize: "14px",
        fontWeight: 500,
        textTransform: "uppercase",
        marginLeft: "24px",
      }}
      className="Navbar"
      iconElementRight={loggedIn ? <AccountDropdown /> : <LoginButton />}
      showMenuIconButton={false}
      onTitleTouchTap={() => navigate("/")}
      iconStyleRight={{
        marginTop: 0,
        marginRight: "12px",
      }}
      style={{
        padding: 0,
      }}
    />
  );
};

Navbar.propTypes = {
  loggedIn: PropTypes.bool,
};

const mapStateToProps = ({ currentUser }) => {
  return {
    loggedIn: !!currentUser.email,
  };
};

export default connect(mapStateToProps)(Navbar);
