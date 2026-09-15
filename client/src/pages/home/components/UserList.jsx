import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { showLoader, hideLoader } from "../../../redux/loaderSlice";
import { setAllChats, setSelectedChats } from "../../../redux/userSlice";
import { createNewChat } from "../../../apiCalls/chat";
import moment from "moment";
import store from "../../../redux/store";

const UserList = ({ searchKey, socket,onlineUsers }) => {
  console.log("onlineUsers",onlineUsers)
  const {
    allUsers,
    allChats,
    user: currentUser,
    selectedChats,
  } = useSelector((state) => state.userReducer);

  const dispatch = useDispatch();

  const startNewChat = async (searchedUserId) => {
    try {
      dispatch(showLoader());
      const response = await createNewChat([currentUser?._id, searchedUserId]);
      dispatch(hideLoader());

      if (response.success) {
        toast.success(response.message);
        const newChat = response.data;
        const updatedChat = [...allChats, newChat];
        dispatch(setAllChats(updatedChat));
        dispatch(setSelectedChats(newChat));
      }
    } catch (error) {
      dispatch(hideLoader());
      toast.error();
    }
  };

  const IsSelectedChat = (user) => {
    if (selectedChats) {
      return selectedChats?.members.map((m) => m._id).includes(user._id);
    }
    return false;
  };

  const openChat = (selectedUserId) => {
    try {
      const chat = allChats.find(
        (chat) =>
          chat.members.map((m) => m._id).includes(currentUser?._id) &&
          chat.members.map((m) => m._id).includes(selectedUserId),
      );
      if (chat) {
        dispatch(setSelectedChats(chat));
      }
    } catch (error) {}
  };

  const getLastMessage = (userId) => {
    const chat = allChats.find((chat) =>
      chat.members.map((m) => m._id).includes(userId),
    );

    if (!chat || !chat?.lastMessage) {
      return "";
    } else {
      const msgPrefix =
        chat?.lastMessage?.sender === currentUser._id ? "You: " : "";
      return msgPrefix + chat?.lastMessage?.text?.substring(0, 25);
    }
  };

  const getLastMessageTimeStamp = (userId) => {
    const chat = allChats.find((chat) =>
      chat.members.map((m) => m._id).includes(userId),
    );

    if (!chat && chat?.lastMessage) {
      return "";
    } else {
      return moment(chat?.lastMessage?.createdAt).format("hh:mm A");
    }
  };

  const getUnreadMessageCount = (userId) => {
    const chat = allChats?.find((chat) =>
      chat?.members?.map((m) => m._id).includes(userId),
    );

    if (
      chat &&
      chat?.unreadMessageCount &&
      chat?.lastMessage?.sender !== currentUser._id
    ) {
      return chat.unreadMessageCount;
    } else {
      return "";
    }
  };

  const getData = () => {
    if (searchKey === "") {
      return allChats;
    } else {
      return allUsers.filter((user) => {
        return (
          user.firstname.toLowerCase().includes(searchKey.toLowerCase()) ||
          user.lastname.toLowerCase().includes(searchKey.toLowerCase())
        );
      });
    }
  };

  useEffect(() => {
    socket.on("receive-message", (message) => {
      const selectedChat = store.getState()?.userReducer?.selectedChats;
      let allChats = store.getState()?.userReducer?.allChats;

      if (selectedChat?._id !== message.chatId) {
        const updatedChats = allChats.map((chat) => {
          if (chat._id === message.chatId) {
            return {
              ...chat,
              unreadMessageCount: (chat?.unreadMessageCount || 0) + 1,
              lastMessage: message,
            };
          }
          return chat;
        });
        allChats = updatedChats;
        
      }
      // FIND THE LATEST CHAT
      const latestChat = allChats.find(chat=>chat._id===message.chatId);
      // GET ALL OTHER CHAT

      const otherChats = allChats.filter(chat=>chat._id !== message.chatId);

      // Create A New Array Latest Chat On Top & Then other Chats
      allChats = [latestChat,...otherChats];
      dispatch(setAllChats(allChats))
    });
  }, []);

  // return allUsers
  //   ?.filter((user) => {
  //     return (
  //       ((user.firstname.toLowerCase().includes(searchKey.toLowerCase()) ||
  //         user.lastname.toLowerCase().includes(searchKey.toLowerCase())) &&
  //         searchKey) ||
  //       allChats.some((chat) =>
  //         chat.members.map((m) => m._id).includes(user._id),
  //       )
  //     );
  //   })
  return getData()?.map((obj) => {
    let user = obj;
    if (obj.members) {
      user = obj.members.find((mem) => mem._id !== currentUser._id);
    }
    return (
      <div
        class="user-search-filter"
        onClick={() => openChat(user?._id)}
        key={user?._id}
      >
        <div
          className={!IsSelectedChat(user) ? "filtered-user" : "selected-user"}
        >
          <div className="filter-user-display">
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt="Profile Pic"
                className="user-profile-image"
                style={onlineUsers.includes(user._id) ? {"border":'#52eb34 3px solid'}:{}}
              />
            ) : (
              <div
                className={
                  IsSelectedChat(user)
                    ? "user-selected-avatar"
                    : "user-default-avatar"
                }
                style={onlineUsers?.includes(user._id) ? {border:'#52eb34 3px solid'}:{}}
              >
                {user?.firstname.charAt(0).toUpperCase() +
                  user?.lastname.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="filter-user-details">
              <div className="user-display-name">
                {user?.firstname + " " + user?.lastname}
              </div>
              <div className="user-display-email">
                {getLastMessage(user._id) || user?.email}
              </div>
            </div>
            <div>
              {getUnreadMessageCount(user._id) && (
                <div className="unread-message-counter">
                  {getUnreadMessageCount(user._id)}
                </div>
              )}
              <div className="last-message-timestamp">
                {getLastMessageTimeStamp(user._id)}
              </div>
            </div>
            {!allChats.find((chat) =>
              chat.members.map((m) => m._id).includes(user?._id),
            ) && (
              <div className="user-start-chat">
                <button
                  className="user-start-chat-btn"
                  onClick={() => startNewChat(user?._id)}
                >
                  Start Chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  });
};

export default UserList;
