import { useEffect, useState } from "react";
import socket from "../sockets/socket";
import api from "../services/api";
import { getConnections } from "../features/connection/connectionService";
import { useAuth } from "../store/AuthContext";

function Chat() {
  const { token } = useAuth();
  const [connections, setConnections] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const userId = token ? JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).id : null;
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState(null);

  useEffect(() => {
    socket.emit("join", userId);
    fetchConnections();
    socket.on("userOnline", (userId) => {
      setOnlineUsers((prev) => [...new Set([...prev, userId])]);
    });
    socket.on("userOffline", (userId) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });
    socket.on("receiveMessage", (msg) => {
      if (
        msg.senderId === selectedUser?.id ||
        msg.receiverId === selectedUser?.id
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    return () => {
      socket.off("receiveMessage");
      socket.off("userOnline");
      socket.off("userOffline");
      socket.off("userTyping");
      socket.off("userStoppedTyping");
    };
  }, [selectedUser]);
  socket.on("userTyping", ({ senderId }) => {
    if (senderId === selectedUser?.id) {
      setTypingUser(senderId);
    }
  });
  socket.on("userStoppedTyping", ({ senderId }) => {
    if (senderId === selectedUser?.id) {
      setTypingUser(null);
    }
  });
  socket.on("userStoppedTyping", ({ senderId }) => {
    if (senderId === selectedUser?.id) {
      setTypingUser(null);
    }
  });
  const fetchConnections = async () => {
    try {
      const data = await getConnections();
      // normalize users
      const users = data.map((conn) => {
        if (conn.senderId === userId) return conn.receiver;
        return conn.sender;
      })
      .filter(Boolean);
      setConnections(users);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchMessages = async (user) => {
    try {
      const res = await api.get(`/chat/${user.id}`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    fetchMessages(user);
  };
  const sendMessage = () => {
    if (!input.trim() || !selectedUser) return;
    socket.emit("sendMessage", {
      senderId: userId,
      receiverId: selectedUser.id,
      content: input,
    });
    setMessages((prev) => [
      ...prev,
      {
        senderId: userId,
        content: input,
      },
    ]);
    setInput("");
  };
  return (
    <div className="flex h-[80vh]">
      {/* LEFT: USERS */}
      <div className="w-1/3 bg-surface p-4 flex flex-col gap-2 overflow-y-auto">
        <h2 className="text-accent text-lg mb-2">Connections</h2>
        {connections.map((user) => (
          <div
            key={user.id}
            onClick={() => handleSelectUser(user)}
            className={`p-2 rounded cursor-pointer flex justify-between items-center ${
              selectedUser?.id === user.id
                ? "bg-primary text-white"
                : "hover:bg-bg"
            }`}
          >
            <span>{user.name}</span>
            {onlineUsers.includes(user.id) && (
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            )}
          </div>
        ))}
      </div>
      {/* RIGHT: CHAT */}
      <div className="flex-1 flex flex-col p-4">
        {!selectedUser ? (
          <p className="text-textSoft">
            Select a user to start chatting
          </p>
        ) : (
          <>
            <h2 className="text-accent mb-2">
              Chat with {selectedUser.name}
            </h2>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-surface p-4 rounded-lg flex flex-col gap-2">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 rounded max-w-xs ${
                    msg.senderId === userId
                      ? "bg-primary self-end text-white"
                      : "bg-bg self-start"
                  }`}
                >
                  {msg.content}
                </div>
              ))}
            </div>
            {/*Typing indicator*/}
            {typingUser && (
              <p className="text-sm text-textSoft mt-2">
                {selectedUser.name} is typing...
              </p>
            )}
            {/* Input */}
            <div className="flex mt-4 gap-2">
              <input
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  socket.emit("typing", {
                    senderId: userId,
                    receiverId: selectedUser?.id,
                  });
                  // stop typing after delay
                  setTimeout(() => {
                    socket.emit("stopTyping", {
                      senderId: userId,
                      receiverId: selectedUser?.id,
                    });
                  }, 1000);
                }}
                placeholder="Type a message..."
                className="flex-1 p-2 rounded bg-surface text-textMain outline-none"
              />
              <button
                onClick={sendMessage}
                className="bg-primary px-4 rounded text-white"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Chat;