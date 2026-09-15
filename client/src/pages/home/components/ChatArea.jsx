import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createNewMessage, getAllMessages } from "../../../apiCalls/message";
import { showLoader, hideLoader } from "../../../redux/loaderSlice";
import { useEffect } from "react";
import moment from "moment";
import { clearUnreadMessageCount } from "../../../apiCalls/chat";
import store from "./../../../redux/store";
import { setAllChats } from "../../../redux/userSlice";
import EmojiPicker from "emoji-picker-react";

const ChatArea = ({ socket }) => {
  const dispatch = useDispatch();
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [message, setMessage] = useState("");
  const [allMessage, setAllMessage] = useState([]);
  const { selectedChats, user } = useSelector((state) => state.userReducer);
  const selectedUser =
    selectedChats?.members &&
    selectedChats?.members?.find((u) => u._id !== user._id);

  const chatRef = useRef(null);

  const sendMessage = async () => {
    if(message==="") return
    try {
      const payload = {
        chatId: selectedChats._id,
        sender: user._id,
        text: message,
      };

      socket.emit("send-message", {
        ...payload,
        members: selectedChats?.members?.map((m) => m._id),
        read: false,

        createdAt: moment().format("DD-MM-YYYY hh:mm:ss"),
      });

      // dispatch(showLoader());
      const response = await createNewMessage(payload);
      if (response.success) {
        setMessage("");
        setShowEmojiPicker(false)
      }

      // dispatch(hideLoader());
    } catch (error) {
      dispatch(hideLoader());
    }
  };

  const getAllMessage = async () => {
    try {
      dispatch(showLoader());
      const response = await getAllMessages(selectedChats._id);
      if (response.success) {
        setAllMessage(response.data);
      }
      dispatch(hideLoader());
    } catch (error) {
      dispatch(hideLoader());
    }
  };

  const formatTime = (timestamp) => {
    const now = moment();
    const diff = now.diff(moment(timestamp), "days");

    if (diff < 1) {
      return `Today ${moment(timestamp).format("hh:mm A")}`;
    } else if (diff === 1) {
      return `Yesterday ${moment(timestamp).format("hh:mm A")}`;
    } else {
      return moment(timestamp).format("MMM D, hh:mm A");
    }
  };

  const clearUnreadMessages = async () => {
    try {
      // dispatch(showLoader());
      socket.emit("clear-unread-message", {
        chatId: selectedChats?._id,
        members: selectedChats?.members.map((m) => m._id),
      });
      const response = await clearUnreadMessageCount(selectedChats?._id);
      // dispatch(hideLoader());
      if (response.success) {
        allMessage?.map((chat) => {
          if (chat._id === selectedChats?._id) {
            return response.data;
          }
          return chat;
        });
      }
    } catch (error) {
      // dispatch(hideLoader());
    }
  };

  useEffect(() => {
    getAllMessage();
    if (selectedChats?.lastMessage?.sender !== user._id) {
      clearUnreadMessages();
    }
    socket.on("receive-message", (message) => {
      const selectedChat = store.getState()?.userReducer?.selectedChats;
      if (selectedChat._id === message.chatId) {
        setAllMessage((prev) => [...prev, message]);
      }
      if (selectedChat._id === message.chatId && message.sender !== user._id) {
        clearUnreadMessages();
      }
      // setAllMessage((prev) => [...prev, data]);
    });

    socket.on("message-count-cleared", (data) => {
      const selectedChats = store.getState().userReducer.selectedChats;
      const allChats = store.getState().userReducer.allChats;

      if (selectedChats._id === data.chatId) {
        const updatedChats = allChats.map((chat) => {
          if (chat._id === data.chatId) {
            return { ...chat, unreadMessageCount: 0 };
          }
          return chat;
        });
        dispatch(setAllChats(updatedChats));

        setAllMessage((prevMsg) => {
          return prevMsg.map((msg) => {
            return { ...msg, read: true };
          });
        });
      }
    });

    socket.on("started-typing", (data) => {
      if (selectedChats._id === data.chatId && data.sender !== user._id) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
        }, 200);
      }
    });
  }, [selectedChats]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [allMessage, isTyping]);

  return (
    <>
      {selectedChats && (
        <div className="app-chat-area">
          <div className="app-chat-area-header">
            {selectedUser?.firstname?.toUpperCase() +
              " " +
              selectedUser?.lastname?.toUpperCase()}
          </div>
          <div className="main-chat-area" ref={chatRef}>
            {allMessage.length &&
              allMessage?.map((item) => {
                const isCurrentUser = item.sender === user._id;
                return (
                  <div
                    className="message-container"
                    style={
                      isCurrentUser
                        ? { justifyContent: "end" }
                        : { justifyContent: "start" }
                    }
                    key={item._id}
                  >
                    <div>
                      <div
                        className={
                          isCurrentUser ? "send-message" : "received-message"
                        }
                      >
                        {item?.text}
                      </div>
                      <div
                        className="message-timestamp"
                        style={
                          isCurrentUser ? { float: "right" } : { float: "left" }
                        }
                      >
                        {formatTime(item.createdAt)}{" "}
                        {isCurrentUser && item?.read && (
                          <i
                            className="fa fa-check-circle"
                            aria-hidden="true"
                            style={{ color: "#e74c3c" }}
                          ></i>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            <div className="typing-indicator">
              {isTyping && <i>typing...</i>}
            </div>
          </div>
          {showEmojiPicker && (
            <div>
              <EmojiPicker onEmojiClick={(e)=>setMessage((prev)=> prev+e.emoji)}></EmojiPicker>
            </div>
          )}
          <div className="send-message-div">
            <input
              type="text"
              className="send-message-input"
              placeholder="Type a message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                socket.emit("user-typing", {
                  chatId: selectedChats._id,
                  members: selectedChats.members.map((m) => m._id),
                  sender: user._id,
                });
              }}
            />
            <button
              className="fa fa-smile-o send-emoji-btn"
              onClick={()=>setShowEmojiPicker(prev=>!prev)}
            ></button>
            <button
              className="fa fa-paper-plane send-message-btn"
              onClick={sendMessage}
            ></button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatArea;
