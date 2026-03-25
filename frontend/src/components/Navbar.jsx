import { Link } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { useEffect, useState } from "react";
import socket from "../sockets/socket";

function Navbar() {
    const { logout } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    useEffect(() => {
        socket.on("newNotification", () => {
            setUnreadCount((prev) => prev + 1);
        });
        setTimeout(() => {
            // reset unread count in navbar via event
            socket.emit("notificationsRead");
        }, 500);
        return () => {
            socket.off("newNotification");
        };
    }, []);
    return (
        <nav className = "w-full bg-surface px-6 py-4 flex justify-between items-center shadow-md">
            <h1 className = "text-x1 font-semibold text-accent">
                Talent Sync
            </h1>

            <div className = "flex gap-6 items-center text-textSoft">
                <Link to="/" className = "hover:text-primaryHover cursor-pointer">Home</Link>
                <Link to="/jobs" className = "hover:text-primaryHover cursor-pointer">Jobs</Link>
                <Link to="/chat" className = "hover:text-primaryHover cursor-pointer">Chat</Link>
                <Link to="/notifications" className="relative">
                    Notifications
                    {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-3 bg-red-500 text-xs px-1 rounded">
                        {unreadCount}
                        </span>
                    )}
                </Link>
                <button
                    onClick={logout}
                    className="bg-primary px-3 py-1 rounded text-white hover:bg-primaryHover"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;