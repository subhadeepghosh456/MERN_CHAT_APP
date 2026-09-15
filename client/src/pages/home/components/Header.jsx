import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Link,useNavigate } from 'react-router-dom'

const Header = () => {
  const { user } = useSelector((state) => state.userReducer);
 
  const getInitials = () => {
    const first = user?.firstname[0].toUpperCase();
    const last = user?.lastname[0].toUpperCase();

    return first + last;
  };

  const getFullName = () => {
    const first = user?.firstname;
    const last = user?.lastname;
    return first + " " + last;
  };


  return (
    <div className="app-header">
      <div className="app-logo">
        <i className="fa fa-comments" aria-hidden="true"></i>
        Quick Chat
      </div>
      {user ? (
        <div className="app-user-profile">
          <div className="logged-user-name">{getFullName()}</div>
          <div className="logged-user-profile-pic">{getInitials()}</div>
        </div>
      ):<span>
        <Link to={"/login"}>Login</Link>
        </span>}
    </div>
  );
};

export default Header;
