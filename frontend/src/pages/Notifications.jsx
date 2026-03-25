import { useEffect, useState } from "react";
import {
  getNotifications,
  markAsRead,
} from "../features/notifications/notificationService";
import socket from "../sockets/socket";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleRead = async (id, isRead) => {
    if (isRead) return; // already read
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const getIconForType = (type) => {
      if (!type) return "🔔";
      if (type.toLowerCase().includes("job")) return "💼";
      if (type.toLowerCase().includes("message")) return "💬";
      if (type.toLowerCase().includes("connection")) return "🤝";
      return "🔔";
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto animate-fade-in font-sans">

      <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primaryHover to-accent inline-block pb-1">Notifications</h1>

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
      ) : notifications.length === 0 ? (
        <div className="card text-center py-20 flex flex-col items-center justify-center gap-4">
           <span className="text-6xl opacity-50 drop-shadow-lg">📭</span>
           <p className="text-textSoft text-lg font-medium mt-2">You're all caught up!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleRead(n.id, n.isRead)}
              className={`relative overflow-hidden p-5 rounded-xl border transition-all duration-300 flex gap-4 items-center group cursor-pointer ${
                n.isRead 
                  ? "bg-surface border-white/5 hover:border-white/10 opacity-70 hover:opacity-100" 
                  : "bg-surface border-primary/30 shadow-md transform hover:-translate-y-1 hover:shadow-lg"
              }`}
            >
              {!n.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
              )}
              
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-inner ${
                  n.isRead ? "bg-bg text-textSoft" : "bg-primary/20 text-textMain"
              }`}>
                  {getIconForType(n.type)}
              </div>

              <div className="flex-1">
                <p className={`text-base ${n.isRead ? "text-textSoft" : "text-textMain font-medium"}`}>
                    {n.message}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs uppercase tracking-wider font-semibold ${
                        n.isRead ? "text-textSoft/50" : "text-primary/80"
                    }`}>
                        {n.type || "Notification"}
                    </span>
                    {!n.isRead && (
                        <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full">New</span>
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