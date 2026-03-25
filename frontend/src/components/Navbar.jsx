import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { useEffect, useState } from "react";
import socket from "../sockets/socket";
import { useDebounce } from "../hooks/useDebounce";
import { searchUsers } from "../features/profile/profileService";

function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);

    const userInitials = user?.name ? user.name.charAt(0).toUpperCase() : "U"; 

    // Search States
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const debouncedSearch = useDebounce(searchQuery, 300);

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

    useEffect(() => {
        if (!debouncedSearch) {
            setSearchResults([]);
            return;
        }
        const fetchSearch = async () => {
            setIsSearching(true);
            try {
                // Assume returns array of users matching
                const res = await searchUsers(debouncedSearch);
                setSearchResults(res || []);
            } catch (e) {
                console.error("Error searching users", e);
            } finally {
                setIsSearching(false);
            }
        };
        fetchSearch();
    }, [debouncedSearch]);

    const handleSelectUser = (id) => {
        navigate(`/profile/${id}`);
        setSearchQuery("");
        setSearchResults([]);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 w-full bg-surface/80 backdrop-blur-md px-4 md:px-6 py-4 flex flex-wrap md:flex-nowrap justify-between items-center shadow-lg border-b border-white/5 transition-all gap-4">
            <Link to="/" className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primaryHover to-accent shrink-0">
                Talent Sync
            </Link>

            {/* Global User Search */}
            <div className="relative group flex-1 max-w-md mx-auto md:mx-4 order-3 md:order-none w-full md:w-auto">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textSoft text-sm">🔍</span>
               <input 
                  type="text" 
                  placeholder="Search users..." 
                  className="input-field pl-9 py-2 w-full bg-bg border-white/5 text-sm focus:border-primary/50"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
               />
               
               {/* Search Dropdown */}
               {searchQuery.length > 0 && (
                   <div className="absolute top-full mt-2 w-full bg-surface border border-white/10 shadow-2xl rounded-xl overflow-hidden z-[100] max-h-[300px] overflow-y-auto hide-scrollbar">
                       {isSearching ? (
                           <div className="p-4 text-center text-textSoft text-sm animate-pulse">Searching...</div>
                       ) : searchResults.length === 0 ? (
                           <div className="p-4 text-center text-textSoft text-sm">No users found</div>
                       ) : (
                           searchResults.map(u => (
                              <div 
                                 key={u.id} 
                                 onClick={() => handleSelectUser(u.id)}
                                 className="px-4 py-3 hover:bg-bg cursor-pointer flex items-center gap-3 transition-colors border-b border-white/5 last:border-0"
                              >
                                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs text-primaryHover shrink-0 border border-primary/30">
                                      {u.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                      <p className="text-sm font-medium text-textMain truncate">{u.name}</p>
                                      {u.headline && <p className="text-xs text-textSoft truncate mt-0.5">{u.headline}</p>}
                                  </div>
                              </div>
                           ))
                       )}
                   </div>
               )}
            </div>

            <div className="flex gap-4 md:gap-6 items-center text-textSoft font-medium text-sm md:text-base shrink-0">
                <Link to="/" className={`transition-all ${isActive('/') ? 'text-textMain drop-shadow-[0_0_8px_rgba(232,241,248,0.5)]' : 'hover:text-textMain'}`}>Home</Link>
                <Link to="/jobs" className={`transition-all ${isActive('/jobs') ? 'text-textMain drop-shadow-[0_0_8px_rgba(232,241,248,0.5)]' : 'hover:text-textMain'}`}>Jobs</Link>
                <div className="hidden sm:block">
                    <Link to="/chat" className={`transition-all ${isActive('/chat') ? 'text-textMain drop-shadow-[0_0_8px_rgba(232,241,248,0.5)]' : 'hover:text-textMain'}`}>Chat</Link>
                </div>
                <Link to="/notifications" className={`relative transition-all ${isActive('/notifications') ? 'text-textMain drop-shadow-[0_0_8px_rgba(232,241,248,0.5)]' : 'hover:text-textMain'}`}>
                    <span className="hidden sm:inline">Notifications</span>
                    <span className="sm:hidden text-lg">🔔</span>
                    {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-3 md:-right-4 bg-accent text-bg text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce shadow-md">
                            {unreadCount}
                        </span>
                    )}
                </Link>
                
                <div className="flex items-center gap-3 md:gap-4 ml-2 md:ml-4 pl-2 md:pl-4 border-l border-white/10">
                    <Link to="/profile" className="flex items-center gap-2 hover:scale-105 transition-transform" title="Profile">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-inner ring-2 ring-transparent hover:ring-accent transition-all">
                            {userInitials}
                        </div>
                    </Link>
                    <button
                        onClick={logout}
                        className="btn-secondary text-xs md:text-sm py-1 md:py-1.5 px-3 md:px-4 hidden sm:block"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;