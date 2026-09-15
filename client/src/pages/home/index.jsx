import React, { useEffect, useState } from "react";
import { getAllUsers, getLoggedUser } from "../../apiCalls/users";
import Header from "./components/Header";
import { useDispatch, useSelector } from "react-redux";
import { setAllChats, setAllUser, setUser } from "../../redux/userSlice";
import toast from "react-hot-toast";
import Sidebar from "./components/Sidebar";
import { getAllChats } from "../../apiCalls/chat";
import ChatArea from "./components/ChatArea";
import { io } from "socket.io-client";

const socket = io("http://127.0.0.1:5000");

const Home = () => {
  const dispatch = useDispatch();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { selectedChats, user } = useSelector((state) => state.userReducer);

  useEffect(() => {
    if (user) {
      socket.emit("join-room", user._id);
      socket.emit("user-login", user._id);
      socket.on("online-users", (onlineusers) => {
        console.log("onlineUsers index.js",onlineusers)
        setOnlineUsers(onlineusers);
      });
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const response = await getLoggedUser();
      dispatch(setUser(response.data));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await getAllUsers();
      dispatch(setAllUser(response.data));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getCurrentUserChats = async () => {
    try {
      const response = await getAllChats();
      if (response.success) {
        dispatch(setAllChats(response.data));
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    try {
      fetchUserData();
      fetchAllUsers();
      getCurrentUserChats();
    } catch (error) {}
  }, []);

  return (
    <div className="home-page">
      <Header />
      <div className="main-content">
        {/* SIDEBAR LAYOUT */}
        <Sidebar socket={socket} onlineUsers={onlineUsers}></Sidebar>
        {selectedChats && <ChatArea socket={socket} />}
        {/* CHAT SECTION LAYOUT */}
      </div>
    </div>
  );
};

export default Home;
