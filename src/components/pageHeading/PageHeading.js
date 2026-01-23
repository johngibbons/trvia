import React from "react";
import PropTypes from "prop-types";
import "./PageHeading.css";

const PageHeading = ({ text, children }) => {
  return (
    <div className="PageHeading">
      <h1 className="PageHeading-text">{text}</h1>
      {children}
    </div>
  );
};

PageHeading.propTypes = {
  text: PropTypes.string,
  children: PropTypes.node,
};

export default PageHeading;
