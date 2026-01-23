import React from "react";
import { Outlet } from "react-router-dom";
import "./Admin.css";

const Admin = () => {
  return (
    <div className="Admin">
      <Outlet />
    </div>
  );
};

export default Admin;
