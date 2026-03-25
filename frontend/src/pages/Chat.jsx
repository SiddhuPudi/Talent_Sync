import { useEffect, useState, useRef } from "react";
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
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUser]);

  useEffect(() => {
    socket.emit("join", userId);
    fetchConnections();
    
    const handleUserOnline = (userId) => setOnlineUsers((prev) => [...new Set([...prev, userId])]);
    const handleUserOffline = (userId) => setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    const handleReceiveMessage = (msg) => {
      setMessages((prev) => {
          if (msg.senderId === selectedUser?.id || msg.receiverId === selectedUser?.id) {
              return [...prev, msg];
          }
          return prev;
      });
    };
    const handleUserTyping = ({ senderId }) => {
      if (senderId === selectedUser?.id) setTypingUser(senderId);
    };
    const handleUserStoppedTyping = ({ senderId }) => {
      if (senderId === selectedUser?.id) setTypingUser(null);
    };

    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);
    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("userTyping", handleUserTyping);
    socket.on("userStoppedTyping", handleUserStoppedTyping);

    return () => {
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("userTyping", handleUserTyping);
      socket.off("userStoppedTyping", handleUserStoppedTyping);
    };
  }, [userId, selectedUser]);

  const fetchConnections = async () => {
    try {
      const data = await getConnections();
      const users = data.map((conn) => {
        if (conn.senderId === userId) return conn.receiver;
        return conn.sender;
      }).filter(Boolean);
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

  const sendMessage = (e) => {
    if (e) e.preventDefault();
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
        createdAt: new Date().toISOString()
      },
    ]);
    setInput("");
    socket.emit("stopTyping", { senderId: userId, receiverId: selectedUser.id });
  };

  let typingTimeout;
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!selectedUser) return;
    
    socket.emit("typing", { senderId: userId, receiverId: selectedUser.id });
    
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit("stopTyping", { senderId: userId, receiverId: selectedUser.id });
    }, 1500);
  };

  const formatTime = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-[80vh] gap-6 animate-fade-in font-sans">
      {/* LEFT: USERS */}
      <div className="w-1/3 md:w-1/4 card p-0 overflow-hidden flex flex-col bg-surface border border-white/5 shadow-lg">
        <h2 className="text-xl font-bold bg-bg p-4 border-b border-white/5">Connections</h2>
        <div className="flex-1 overflow-y-auto hide-scrollbar p-2">
            {connections.length === 0 ? (
                 <p className="text-textSoft p-4 text-center text-sm">No connections yet.</p>
            ) : (
                connections.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className={`p-3 mb-1 rounded-xl cursor-pointer flex justify-between items-center transition-all ${
                      selectedUser?.id === user.id
                        ? "bg-primary text-white shadow-md"
                        : "hover:bg-bg text-textMain"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-bg flex items-center justify-center font-bold text-sm relative border border-white/10">
                            {user.name.charAt(0).toUpperCase()}
                            {onlineUsers.includes(user.id) && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                            )}
                        </div>
                        <span className="font-medium truncate">{user.name}</span>
                    </div>
                  </div>
                ))
            )}
        </div>
      </div>

      {/* RIGHT: CHAT */}
      <div className="flex-1 flex flex-col card p-0 overflow-hidden bg-surface border border-white/5 shadow-lg relative">
        {!selectedUser ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-60">
              <span className="text-6xl mb-4">💬</span>
              <p className="text-lg text-textSoft">Select a user to start chatting</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="bg-bg p-4 border-b border-white/5 flex items-center gap-3 z-10 shadow-sm">
                 <div className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center font-bold relative">
                    {selectedUser.name.charAt(0).toUpperCase()}
                    {onlineUsers.includes(selectedUser.id) && (
                         <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                     )}
                 </div>
                 <div>
                    <h2 className="font-bold text-textMain">{selectedUser.name}</h2>
                    <p className="text-xs text-textSoft">{onlineUsers.includes(selectedUser.id) ? "Online" : "Offline"}</p>
                 </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 hide-scrollbar bg-surface/50">
              {messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-textSoft italic text-sm">
                      Say hi to start the conversation!
                  </div>
              ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.senderId === userId;
                    return (
                      <div
                        key={index}
                        className={`flex flex-col max-w-[75%] animate-slide-up ${
                          isMe ? "self-end items-end" : "self-start items-start"
                        }`}
                      >
                        <div
                          className={`px-4 py-2.5 shadow-md ${
                            isMe
                              ? "bg-primary text-white rounded-2xl rounded-tr-sm"
                              : "bg-bg text-textMain rounded-2xl rounded-tl-sm border border-white/5"
                          }`}
                        >
                          <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                        <span className="text-[10px] text-textSoft/60 mt-1 px-1">
                            {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    );
                  })
              )}
              
              {/*Typing indicator*/}
              {typingUser && (
                <div className="self-start items-start max-w-[75%] animate-fade-in flex flex-col mt-2">
                   <div className="bg-bg text-textSoft rounded-2xl rounded-tl-sm px-4 py-3 shadow-md flex gap-1 border border-white/5">
                      <div className="w-2 h-2 bg-textSoft/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-textSoft/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-textSoft/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 bg-bg border-t border-white/5 flex gap-3 items-center">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="input-field rounded-full px-6 py-3 border-none bg-surface shadow-inner"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primaryHover disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shadow-md shrink-0"
              >
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default Chat;