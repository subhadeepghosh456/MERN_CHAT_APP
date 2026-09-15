import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("token");

  if (!isAuthenticated) {
    // Redirects immediately, replacing the current history entry
    return <Navigate to="/login" replace />;
  }

  return <div>{children}</div>; // Or just `return children;`
};

export default ProtectedRoute;