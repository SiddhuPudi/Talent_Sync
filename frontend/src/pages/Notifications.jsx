import { useEffect, useState } from "react";
import { useNotifications } from "../store/NotificationContext";
import { useNavigate } from "react-router-dom";

function Notifications() {
  const navigate = useNavigate();
  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const [filterMode, setFilterMode] = useState("all");
  const [isMarking, setIsMarking] = useState(false);
  const handleRead = async (id, isRead, type) => {
    try {
      if (!isRead) {
        await markAsRead(id);
      }
      if (type && type.includes("connection")) navigate("/profile");
      else if (type && type.includes("message")) navigate("/chat");
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    setIsMarking(true);
    try {
      await markAllAsRead();
    } catch (err) {
      console.error(err);
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

  const formatRelativeTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const visibleNotifications = notifications.filter(n =>
    filterMode === "unread" ? !n.isRead : true
  );

  const hasUnread = notifications.some(n => !n.isRead);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-4xl mx-auto animate-fade-in font-sans pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5 sm:pb-6">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text inline-block pb-0.5">Notifications</h1>
          <p className="text-textSoft text-xs sm:text-sm mt-1 truncate">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up!"}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex p-1 bg-surface border border-white/5 rounded-xl shadow-sm">
            <button
              onClick={() => setFilterMode("all")}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${filterMode === "all" ? "bg-primary text-white shadow-glow-primary" : "text-textSoft hover:text-textMain"}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterMode("unread")}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${filterMode === "unread" ? "bg-primary text-white shadow-glow-primary" : "text-textSoft hover:text-textMain"}`}
            >
              Unread
              {hasUnread && filterMode !== "unread" && <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse-soft"></span>}
            </button>
          </div>
          {hasUnread && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={isMarking}
              className="btn-ghost py-2 px-3 sm:px-4 text-xs sm:text-sm text-primaryHover hover:bg-primary/10 rounded-xl transition-all active:scale-95 shrink-0"
            >
              {isMarking ? (
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              ) : '✓ Mark all'}
            </button>
          )}
        </div>
      </div>
      {/* Content */}
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
        <div className="card text-center py-20 flex flex-col items-center justify-center gap-3 bg-transparent border-dashed border-2 border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-surface border border-white/5 flex items-center justify-center text-3xl">
            📭
          </div>
          <h3 className="text-xl font-bold text-textMain mt-2">
            {filterMode === "unread" ? "No unread notifications" : "You're all caught up!"}
          </h3>
          <p className="text-textSoft">We'll let you know when something happens.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 sm:gap-3">
          {visibleNotifications.map((n, index) => (
            <div
              key={n.id}
              onClick={() => handleRead(n.id, n.isRead, n.type)}
              className={`relative overflow-hidden p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex gap-3 sm:gap-4 items-start sm:items-center group cursor-pointer active:scale-[0.99] ${n.isRead
                ? "bg-surface/40 border-white/5 hover:border-white/10 hover:bg-surface/60"
                : "bg-surface border-primary/20 shadow-md hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/40"
                }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {!n.isRead && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primaryHover"></div>
              )}

              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-lg sm:text-xl shrink-0 transition-colors ${n.isRead ? "bg-bg/40 text-textSoft/50" : "bg-primary/10 text-primary"
                }`}>
                {getIconForType(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-xs sm:text-sm leading-relaxed break-words ${n.isRead ? "text-textSoft/70" : "text-textMain font-medium"}`}>
                  {n.message}
                </p>
                <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5 overflow-hidden">
                  <span className={`text-[10px] sm:text-xs font-semibold truncate ${n.isRead ? "text-textSoft/30" : "text-primary/60"
                    }`}>
                    {n.type || "Notification"}
                  </span>
                  <span className="text-textSoft/20 shrink-0">·</span>
                  <span className="text-[10px] sm:text-xs text-textSoft/40 shrink-0">
                    {formatRelativeTime(n.createdAt)}
                  </span>
                  {!n.isRead && (
                    <span className="badge badge-accent text-[9px] sm:text-[10px] px-1.5 py-0.5 ml-1 shrink-0 scale-90 sm:scale-100">New</span>
                  )}
                </div>
              </div>
              <span className="text-textSoft/20 group-hover:text-textSoft/40 transition-colors text-xs sm:text-sm shrink-0 self-center hidden sm:block">
                →
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;