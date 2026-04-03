import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { useEffect, useState, useRef } from "react";
import socket from "../sockets/socket";
import { useDebounce } from "../hooks/useDebounce";
import { searchUsers } from "../features/profile/profileService";
import { useNotifications } from "../store/NotificationContext";

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { unreadCount } = useNotifications();
    const profileRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const userInitials = user?.name ? user.name.charAt(0).toUpperCase() : "U";

    // User Search States
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const debouncedSearch = useDebounce(searchQuery, 300);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setIsProfileOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
        setIsProfileOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const controller = new AbortController();
        if (!debouncedSearch) {
            setSearchResults([]);
            return;
        }

        const fetchSearch = async () => {
            setIsSearching(true);
            try {
                const res = await searchUsers(debouncedSearch, controller.signal);
                setSearchResults(res || []);
            } catch (e) {
                if (e.name !== "CanceledError" && e.message !== "canceled") {
                    console.error("Error searching users", e);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsSearching(false);
                }
            }
        };
        fetchSearch();
        return () => {
            controller.abort();
        };
    }, [debouncedSearch]);

    const handleSelectUser = (id) => {
        navigate(`/profile/${id}`);
        setSearchQuery("");
        setSearchResults([]);
    };

    const isActive = (path) => location.pathname === path;
    const navLinks = [
        { path: "/", label: "Home", icon: "🏠" },
        { path: "/jobs", label: "Jobs", icon: "💼" },
        { path: "/chat", label: "Chat", icon: "💬" },
        { path: "/notifications", label: "Notifications", icon: "🔔", badge: unreadCount },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full bg-surface/80 backdrop-blur-md px-4 md:px-6 py-2.5 sm:py-3 shadow-lg border-b border-white/5 transition-all">
            <div className="flex items-center justify-between gap-4">
                {/* Logo */}
                <Link to="/" className="text-xl font-bold gradient-text shrink-0">
                    Talent Sync
                </Link>
                {/* Search - Desktop */}
                <div className="relative hidden md:block flex-1 max-w-md mx-4">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textSoft/60 text-sm">🔍</span>
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="input-field pl-9 py-2 w-full bg-bg/50 border-white/5 text-sm focus:border-primary/50 focus:bg-bg"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    {/* Search Dropdown */}
                    {searchQuery.length > 0 && (
                        <div className="absolute top-full mt-2 w-full glass shadow-2xl rounded-xl overflow-hidden z-[100] max-h-[320px] overflow-y-auto hide-scrollbar animate-scale-in">
                            {isSearching ? (
                                <div className="p-4 text-center text-textSoft text-sm">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                        Searching...
                                    </div>
                                </div>
                            ) : searchResults.length === 0 ? (
                                <div className="p-6 text-center">
                                    <span className="text-3xl opacity-40 block mb-2">🔍</span>
                                    <p className="text-textSoft text-sm">No users found for "{searchQuery}"</p>
                                </div>
                            ) : (
                                searchResults.map(u => (
                                    <div
                                        key={u.id}
                                        onClick={() => handleSelectUser(u.id)}
                                        className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center gap-3 transition-all border-b border-white/5 last:border-0 group"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs text-primaryHover shrink-0 border border-primary/30 group-hover:bg-primary/30 transition-colors">
                                            {u.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-textMain truncate group-hover:text-primaryHover transition-colors">{u.name}</p>
                                            {u.headline && <p className="text-xs text-textSoft truncate mt-0.5">{u.headline}</p>}
                                        </div>
                                        <span className="text-textSoft/30 group-hover:text-primaryHover transition-colors text-sm">↗</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map(link => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(link.path)
                                    ? 'text-textMain bg-white/5 shadow-sm'
                                    : 'text-textSoft hover:text-textMain hover:bg-white/5'
                                }`}
                        >
                            <span className="hidden lg:inline">{link.label}</span>
                            <span className="lg:hidden">{link.icon}</span>
                            {link.badge > 0 && (
                                <span className="absolute -top-1 -right-1 bg-accent text-bg text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full animate-pulse-soft shadow-glow-accent">
                                    {link.badge > 9 ? '9+' : link.badge}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
                {/* Profile Dropdown & Mobile Menu Button */}
                <div className="flex items-center gap-2">
                    {/* Profile Dropdown - Desktop */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-transparent hover:ring-primaryHover/50 transition-all duration-200 hover:scale-105"
                        >
                            {userInitials}
                        </button>
                        {isProfileOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 glass rounded-xl shadow-2xl overflow-hidden animate-scale-in z-[100]">
                                <div className="p-4 border-b border-white/5">
                                    <p className="font-semibold text-textMain text-sm truncate">{user?.name || "User"}</p>
                                    <p className="text-xs text-textSoft truncate mt-0.5">{user?.email || ""}</p>
                                </div>
                                <div className="py-1">
                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-textSoft hover:text-textMain hover:bg-white/5 transition-colors"
                                    >
                                        <span>👤</span> View Profile
                                    </Link>
                                    <Link
                                        to="/jobs"
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-textSoft hover:text-textMain hover:bg-white/5 transition-colors"
                                    >
                                        <span>💼</span> My Applications
                                    </Link>
                                </div>
                                <div className="border-t border-white/5 py-1">
                                    <button
                                        onClick={logout}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors w-full text-left"
                                    >
                                        <span>🚪</span> Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden btn-icon"
                    >
                        <span className="text-xl transition-transform duration-200" style={{ display: 'inline-block', transform: isMenuOpen ? 'rotate(90deg)' : 'none' }}>
                            {isMenuOpen ? '✕' : '☰'}
                        </span>
                    </button>
                </div>
            </div>
            {/* Mobile Menu */}
            {isMenuOpen && (
                <div ref={mobileMenuRef} className="md:hidden mt-3 pt-3 border-t border-white/5 animate-slide-down">
                    {/* Mobile Search */}
                    <div className="relative mb-3">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textSoft/60 text-sm">🔍</span>
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="input-field pl-9 py-2.5 w-full bg-bg/50 border-white/5 text-sm"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        {/* Mobile search dropdown reuses same logic */}
                        {searchQuery.length > 0 && (
                            <div className="absolute top-full mt-1 w-full glass shadow-2xl rounded-xl overflow-hidden z-[100] max-h-[240px] overflow-y-auto hide-scrollbar animate-scale-in">
                                {isSearching ? (
                                    <div className="p-3 text-center text-textSoft text-sm animate-pulse">Searching...</div>
                                ) : searchResults.length === 0 ? (
                                    <div className="p-4 text-center text-textSoft text-sm">No users found</div>
                                ) : (
                                    searchResults.map(u => (
                                        <div
                                            key={u.id}
                                            onClick={() => handleSelectUser(u.id)}
                                            className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center gap-3 transition-colors border-b border-white/5 last:border-0"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs text-primaryHover shrink-0 border border-primary/30">
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <p className="text-sm font-medium text-textMain truncate">{u.name}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                    {/* Mobile Nav Links */}
                    <div className="flex flex-col gap-1">
                        {navLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive(link.path)
                                        ? 'text-textMain bg-white/5'
                                        : 'text-textSoft hover:text-textMain hover:bg-white/5'
                                    }`}
                            >
                                <span>{link.icon}</span>
                                <span>{link.label}</span>
                                {link.badge > 0 && (
                                    <span className="ml-auto badge badge-accent text-[10px]">
                                        {link.badge}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Navbar;