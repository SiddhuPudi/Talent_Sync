import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { useEffect, useState } from "react";
import socket from "../sockets/socket";

function Navbar() {
    const { logout } = useAuth();
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);

    const userInitials = "U"; 

    useEffect(() => {
        socket.on("newNotification", () => {
            setUnreadCount((prev) => prev + 1);
        });
        setTimeout(() => {
            socket.emit("notificationsRead");
        }, 500);
        return () => {
            socket.off("newNotification");
        };
    }, []);

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 w-full bg-surface/80 backdrop-blur-md px-6 py-4 flex justify-between items-center shadow-lg border-b border-white/5 transition-all">
            <Link to="/" className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primaryHover to-accent">
                Talent Sync
            </Link>

            <div className="flex gap-6 items-center text-textSoft font-medium">
                <Link to="/" className={`transition-all ${isActive('/') ? 'text-textMain drop-shadow-[0_0_8px_rgba(232,241,248,0.5)]' : 'hover:text-textMain'}`}>Home</Link>
                <Link to="/jobs" className={`transition-all ${isActive('/jobs') ? 'text-textMain drop-shadow-[0_0_8px_rgba(232,241,248,0.5)]' : 'hover:text-textMain'}`}>Jobs</Link>
                <Link to="/chat" className={`transition-all ${isActive('/chat') ? 'text-textMain drop-shadow-[0_0_8px_rgba(232,241,248,0.5)]' : 'hover:text-textMain'}`}>Chat</Link>
                <Link to="/notifications" className={`relative transition-all ${isActive('/notifications') ? 'text-textMain drop-shadow-[0_0_8px_rgba(232,241,248,0.5)]' : 'hover:text-textMain'}`}>
                    Notifications
                    {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-4 bg-accent text-bg text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce shadow-md">
                            {unreadCount}
                        </span>
                    )}
                </Link>
                
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/10">
                    <Link to="/profile" className="flex items-center gap-2 hover:scale-105 transition-transform" title="Profile">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-inner ring-2 ring-transparent hover:ring-accent transition-all">
                            {userInitials}
                        </div>
                    </Link>
                    <button
                        onClick={logout}
                        className="btn-secondary text-sm py-1.5 px-4"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;