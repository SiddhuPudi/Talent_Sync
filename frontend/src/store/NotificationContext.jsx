import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { 
  getNotifications, 
  markAsRead as markAsReadApi, 
  markAllAsRead as markAllAsReadApi 
} from "../features/notifications/notificationService";
import socket from "../sockets/socket";
const NotificationContext = createContext();
export function NotificationProvider({ children }) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setLoading(false);
            return;
        }
        const fetchInitial = async () => {
            setLoading(true);
            try {
                const data = await getNotifications();
                setNotifications(data || []);
            } catch (err) {
                console.error("Error fetching notifications via context:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitial();
        const handleNewNotification = (notif) => {
            setNotifications(prev => [notif, ...prev]);
        };
        socket.on("newNotification", handleNewNotification);
        return () => {
            socket.off("newNotification", handleNewNotification);
        };
    }, [user]);
    const markAsRead = async (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        try {
            await markAsReadApi(id);
        } catch (err) {
            console.error("Error marking notification true locally:", err);
        }
    };
    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        try {
            await markAllAsReadApi();
        } catch (err) {
            console.error(err);
        }
    };
    const unreadCount = notifications.filter(n => !n.isRead).length;
    return (
        <NotificationContext.Provider value={{ notifications, loading, unreadCount, markAsRead, markAllAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => useContext(NotificationContext);
