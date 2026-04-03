import { useEffect, useState, useRef, useCallback } from "react";
import socket from "../sockets/socket";
import api from "../services/api";
import { getConnections } from "../features/connection/connectionService";
import { useAuth } from "../store/AuthContext";

function Chat() {
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const userId = user?.id;
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [contactSearch, setContactSearch] = useState("");
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const selectedUserRef = useRef(selectedUser);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUser, scrollToBottom]);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    socket.emit("join", userId);
    fetchConnections();
    const handleUserOnline = (userId) => setOnlineUsers((prev) => [...new Set([...prev, userId])]);
    const handleUserOffline = (userId) => setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    const handleReceiveMessage = (msg) => {
      setMessages((prev) => {
        if (msg.senderId === userId) return prev;
        const currentSelectedId = selectedUserRef.current?.id;
        if (
          (msg.senderId === currentSelectedId && msg.receiverId === userId) ||
          (msg.receiverId === currentSelectedId && msg.senderId === userId)
        ) {
          const exists = prev.some(m => m.id === msg.id || (m.content === msg.content && m.createdAt === msg.createdAt));
          if (!exists) return [...prev, msg];
        }
        return prev;
      });
    };
    const handleUserTyping = ({ senderId }) => {
      if (senderId === selectedUserRef.current?.id) setTypingUser(senderId);
    };
    const handleUserStoppedTyping = ({ senderId }) => {
      if (senderId === selectedUserRef.current?.id) setTypingUser(null);
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
  }, [userId]);

  const fetchConnections = async () => {
    try {
      const data = await getConnections();
      const users = data.map((conn) => {
        let friend = conn.senderId === userId ? conn.receiver : conn.sender;
        if (friend) friend.connectionStatus = conn.status;
        return friend;
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
    // Hide sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  const handleBackToList = () => {
    setShowSidebar(true);
    setSelectedUser(null);
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

  const filteredConnections = connections.filter(c =>
    contactSearch ? c.name.toLowerCase().includes(contactSearch.toLowerCase()) : true
  );

  const onlineCount = connections.filter(c => onlineUsers.includes(c.id)).length;

  return (
    <div className="flex h-[calc(100vh-5rem)] sm:h-[calc(100vh-8rem)] gap-0 md:gap-5 animate-fade-in font-sans -mx-4 md:mx-0" style={{ height: 'calc(var(--vh-full, 100vh) - 5rem)' }}>
      {/* LEFT: CONTACTS SIDEBAR */}
      <div className={`${showSidebar ? 'flex' : 'hidden'} md:flex w-full md:w-80 lg:w-96 card p-0 overflow-hidden flex-col bg-surface border border-white/5 shadow-lg shrink-0 rounded-none md:rounded-2xl`}>
        {/* Sidebar Header */}
        <div className="p-3 sm:p-4 border-b border-white/5 bg-bg/50 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-bold text-textMain">Messages</h2>
            <span className="badge badge-success text-[10px]">
              {onlineCount} online
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textSoft/40 text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search contacts..."
              className="input-field pl-8 py-2 text-sm bg-bg/50 border-white/5"
              value={contactSearch}
              onChange={e => setContactSearch(e.target.value)}
            />
          </div>
        </div>
        {/* Contact List */}
        <div className="flex-1 overflow-y-auto hide-scrollbar overscroll-contain">
          {filteredConnections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <span className="text-4xl opacity-40 mb-3">💬</span>
              <p className="text-textSoft text-sm font-medium">
                {contactSearch ? "No contacts match your search" : "No connections yet"}
              </p>
              <p className="text-textSoft/50 text-xs mt-1">Connect with professionals to start chatting</p>
            </div>
          ) : (
            filteredConnections.map((user) => (
              <div
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className={`px-3 sm:px-4 py-3 sm:py-3.5 cursor-pointer flex items-center gap-3 transition-all border-b border-white/[0.03] last:border-0 active:scale-[0.98] ${selectedUser?.id === user.id
                    ? "bg-primary/10 border-l-2 border-l-primary"
                    : "hover:bg-white/[0.03]"
                  }`}
              >
                <div className="relative shrink-0">
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-sm border transition-colors ${selectedUser?.id === user.id
                      ? "bg-primary text-white border-primary"
                      : "bg-bg text-textMain border-white/10"
                    }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {onlineUsers.includes(user.id) && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-500 rounded-full border-2 border-surface shadow-glow-green"></span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-semibold truncate block text-sm">{user.name}</span>
                  <span className="text-xs text-textSoft/60">{onlineUsers.includes(user.id) ? "Online" : "Offline"}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* RIGHT: CHAT AREA */}
      <div className={`${!showSidebar || selectedUser ? 'flex' : 'hidden'} md:flex flex-1 flex-col card p-0 overflow-hidden bg-surface border border-white/5 shadow-lg relative rounded-none md:rounded-2xl`}>
        {!selectedUser ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-60 px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl sm:text-4xl mb-4 sm:mb-5">
              💬
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-textMain mb-2">Start a Conversation</h3>
            <p className="text-textSoft text-xs sm:text-sm text-center max-w-xs">Select a contact from the sidebar to begin messaging</p>
          </div>
        ) : (
          <>
            {/* Chat Header – sticky at top of chat area */}
            <div className="bg-bg/50 backdrop-blur-sm p-3 sm:p-4 border-b border-white/5 flex items-center gap-3 z-10 shadow-sm shrink-0">
              {/* Back button on mobile */}
              <button
                onClick={handleBackToList}
                className="md:hidden btn-icon shrink-0 -ml-1"
              >
                ←
              </button>
              <div className="relative shrink-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center font-bold text-sm">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                {onlineUsers.includes(selectedUser.id) && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-bg shadow-glow-green"></span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-textMain text-sm truncate">{selectedUser.name}</h2>
                <p className={`text-xs font-medium ${onlineUsers.includes(selectedUser.id) ? "text-green-400" : "text-textSoft/50"}`}>
                  {onlineUsers.includes(selectedUser.id) ? "● Online" : "Offline"}
                </p>
              </div>
            </div>
            {selectedUser.connectionStatus !== "accepted" ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 p-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-2xl sm:text-3xl">
                  🤝
                </div>
                <p className="text-base sm:text-lg font-bold text-textMain mt-2">Connect to start chatting</p>
                <p className="text-xs sm:text-sm text-textSoft max-w-xs">You can only message accepted connections.</p>
              </div>
            ) : (
              <>
                {/* Messages – scrollable area occupies all remaining space */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 md:p-6 flex flex-col gap-2 sm:gap-3 hide-scrollbar"
                >
                  {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <span className="text-4xl opacity-30 mb-2">💬</span>
                      <p className="text-textSoft/60 text-sm">No messages yet. Say hello!</p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isMe = msg.senderId === userId;
                      return (
                        <div
                          key={index}
                          className={`flex flex-col max-w-[85%] sm:max-w-[80%] md:max-w-[70%] ${isMe ? "self-end items-end" : "self-start items-start"
                            }`}
                        >
                          <div
                            className={`px-3 sm:px-4 py-2 sm:py-2.5 shadow-sm ${isMe
                                ? "bg-primary text-white rounded-2xl rounded-br-md"
                                : "bg-bg text-textMain rounded-2xl rounded-bl-md border border-white/5"
                              }`}
                          >
                            <p className="leading-relaxed whitespace-pre-wrap break-words text-sm">{msg.content}</p>
                          </div>
                          <span className="text-[10px] text-textSoft/40 mt-1 px-1">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      );
                    })
                  )}
                  {/* Typing indicator */}
                  {typingUser && (
                    <div className="self-start max-w-[70%] animate-fade-in">
                      <div className="bg-bg text-textSoft rounded-2xl rounded-bl-md px-4 py-3 shadow-sm flex gap-1.5 border border-white/5 items-center">
                        <div className="w-2 h-2 bg-textSoft/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-textSoft/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-textSoft/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  )}
                  {/* Extra padding so last message isn't hidden behind input */}
                  <div ref={messagesEndRef} className="h-1 shrink-0" />
                </div>
                {/* Input – pinned to bottom of the flex column */}
                <form
                  onSubmit={sendMessage}
                  className="shrink-0 p-2 sm:p-3 md:p-4 bg-bg/80 backdrop-blur-sm border-t border-white/5 flex gap-2 sm:gap-3 items-center safe-area-bottom"
                  style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0.5rem)' }}
                >
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Type a message..."
                    className="input-field rounded-full px-4 sm:px-5 py-2.5 border-white/5 bg-surface text-sm flex-1 min-w-0"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primaryHover disabled:opacity-30 transition-all hover:scale-105 active:scale-95 shadow-md shrink-0"
                  >
                    <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                  </button>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Chat;