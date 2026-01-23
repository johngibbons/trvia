import React from "react";
import { Outlet } from "react-router-dom";
import "./PageContainer.css";

import Navbar from "../navbar/Navbar.js";
import AlertBar from "../alertBar/AlertBar.js";

const PageContainer = () => {
  return (
    <div className="PageContainer">
      <Navbar />
      <div className="PageContainer-body">
        <Outlet />
      </div>
      <AlertBar />
    </div>
  );
};

export default PageContainer;
