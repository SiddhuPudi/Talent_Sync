import { useEffect, useState } from "react";
import {
  getNotifications,
  markAsRead,
} from "../features/notifications/notificationService";
import socket from "../sockets/socket";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

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
    }
  };

  const handleRead = async (id) => {
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

  return (
    <div className="flex flex-col gap-4">

      <h1 className="text-2xl text-accent">Notifications</h1>

      {notifications.length === 0 ? (
        <p className="text-textSoft">No notifications</p>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleRead(n.id)}
              className={`p-3 rounded cursor-pointer ${
                n.isRead ? "bg-surface" : "bg-primary/30"
              }`}
            >
              <p>{n.message}</p>
              <span className="text-xs text-textSoft">
                {n.type}
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default Notifications;