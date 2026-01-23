import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import { connect } from "react-redux";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LoginButton from "./loginButton/LoginButton";
import AccountDropdown from "./accountDropdown/AccountDropdown";

const Navbar = ({ loggedIn }) => {
  const navigate = useNavigate();

  return (
    <AppBar position="static" className="Navbar" sx={{ padding: 0, boxShadow: "none", borderBottom: "1px solid #e0e0e0" }}>
      <Toolbar sx={{ justifyContent: "space-between", width: "100%" }}>
        <Typography
          variant="h6"
          component="div"
          onClick={() => navigate("/")}
          sx={{
            cursor: "pointer",
            color: "#212121",
            fontSize: "14px",
            fontWeight: 500,
            textTransform: "uppercase",
          }}
        >
          trvia
        </Typography>
        <Box>
          {loggedIn ? <AccountDropdown /> : <LoginButton />}
        </Box>
      </Toolbar>
    </AppBar>
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
