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
    <AppBar position="static" className="Navbar" sx={{ padding: 0 }}>
      <Toolbar>
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
            marginLeft: "24px",
            flexGrow: 1,
          }}
        >
          trvia
        </Typography>
        <Box sx={{ marginTop: 0, marginRight: "12px" }}>
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
