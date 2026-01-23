import React from "react";
import PropTypes from "prop-types";
import "./Admin.css";

const Admin = ({ children }) => {
  return <div className="Admin">{children}</div>;
};

Admin.propTypes = {
  children: PropTypes.node,
};

export default Admin;
