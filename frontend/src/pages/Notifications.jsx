import { useEffect, useState } from "react";
import {
  getNotifications,
  markAsRead,
} from "../features/notifications/notificationService";
import socket from "../sockets/socket";
import { useNavigate } from "react-router-dom";

function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState("all"); // "all" | "unread"
  const [isMarking, setIsMarking] = useState(false);

  useEffect(() => {
    fetchNotifications();

    socket.on("newNotification", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    return () => {
      socket.off("newNotification");
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRead = async (id, isRead, type) => {
    try {
      if (!isRead) {
          await markAsRead(id);
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === id ? { ...n, isRead: true } : n
            )
          );
      }
      
      if (type && type.includes("connection")) navigate("/profile");
      else if (type && type.includes("message")) navigate("/chat");
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
      if (unreadIds.length === 0) return;

      setIsMarking(true);
      try {
          // Optimistic UI update
          setNotifications(prev => prev.map(n => ({...n, isRead: true})));
          
          await Promise.all(unreadIds.map(id => markAsRead(id)));
      } catch (err) {
          console.error(err);
          // Normally we'd rollback here if a failure happened
      } finally {
          setIsMarking(false);
      }
  };

  const getIconForType = (type) => {
      if (!type) return "🔔";
      if (type.toLowerCase().includes("job")) return "💼";
      if (type.toLowerCase().includes("message")) return "💬";
      if (type.toLowerCase().includes("connection")) return "🤝";
      return "🔔";
  };

  const visibleNotifications = notifications.filter(n => 
      filterMode === "unread" ? !n.isRead : true
  );

  const hasUnread = notifications.some(n => !n.isRead);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto animate-fade-in font-sans pb-10">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primaryHover to-accent inline-block pb-1">Notifications</h1>
          
          <div className="flex items-center gap-4">
              <div className="flex p-1 bg-surface border border-white/5 rounded-xl">
                  <button 
                      onClick={() => setFilterMode("all")}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterMode === "all" ? "bg-primary text-white shadow" : "text-textSoft hover:text-textMain"}`}
                  >
                      All
                  </button>
                  <button 
                      onClick={() => setFilterMode("unread")}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterMode === "unread" ? "bg-primary text-white shadow" : "text-textSoft hover:text-textMain"}`}
                  >
                      Unread 
                      {hasUnread && filterMode !== "unread" && <span className="ml-1.5 w-2 h-2 bg-red-500 rounded-full inline-block mb-[1px]"></span>}
                  </button>
              </div>

              {hasUnread && (
                  <button 
                      onClick={handleMarkAllAsRead} 
                      disabled={isMarking}
                      className="btn-secondary text-sm px-4 py-2 hover:bg-primary/20 hover:text-primaryHover border-primary/30"
                  >
                      {isMarking ? '⏳' : '✓ Mark all as read'}
                  </button>
              )}
          </div>
      </div>

      {loading ? (
          <div className="flex flex-col gap-3">
              {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="card p-4 flex gap-4 items-center">
                      <div className="skeleton w-12 h-12 rounded-full"></div>
                      <div className="flex-1 flex flex-col gap-2">
                           <div className="skeleton h-4 w-3/4"></div>
                           <div className="skeleton h-3 w-1/4"></div>
                      </div>
                  </div>
              ))}
          </div>
      ) : visibleNotifications.length === 0 ? (
        <div className="card text-center py-24 flex flex-col items-center justify-center gap-4 bg-transparent border-dashed border-2 border-white/10">
           <span className="text-6xl opacity-40 drop-shadow-lg">📭</span>
           <h3 className="text-2xl font-bold text-textMain mt-2">
               {filterMode === "unread" ? "No unread notifications" : "You're all caught up!"}
           </h3>
           <p className="text-textSoft text-lg">We'll let you know when something happens.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleNotifications.map((n) => (
            <div
                key={n.id}
              onClick={() => handleRead(n.id, n.isRead, n.type)}
              className={`relative overflow-hidden p-5 rounded-xl border transition-all duration-300 flex gap-4 items-center group cursor-pointer ${
                n.isRead 
                  ? "bg-surface border-white/5 hover:border-white/10 opacity-70 hover:opacity-100" 
                  : "bg-surface border-primary/30 shadow-md transform hover:-translate-y-1 hover:shadow-lg"
              }`}
            >
              {!n.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>
              )}
              
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-inner shrink-0 ${
                  n.isRead ? "bg-bg text-textSoft" : "bg-primary/20 text-textMain"
              }`}>
                  {getIconForType(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-base truncate ${n.isRead ? "text-textSoft" : "text-textMain font-medium"}`}>
                    {n.message}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs uppercase tracking-wider font-semibold ${
                        n.isRead ? "text-textSoft/50" : "text-primary/80"
                    }`}>
                        {n.type || "Notification"}
                    </span>
                    {!n.isRead && (
                        <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full font-bold">New</span>
                    )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default Notifications;