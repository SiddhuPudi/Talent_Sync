import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getProfile,
  getUserProfile,
  getMyConnections,
} from "../features/profile/profileService";
import { getMyApplications } from "../services/applicationService";
import { sendConnectionRequest, updateConnectionStatus } from "../features/connection/connectionService";
import { useAuth } from "../store/AuthContext";

function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [connections, setConnections] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [connectionRole, setConnectionRole] = useState(null);
  const [connectionId, setConnectionId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const isOwnProfile = !id || id === authUser?.id;

  useEffect(() => {
    if (authUser) {
      setLoading(true);
      Promise.all([
        fetchProfileData(),
        fetchConnectionsData(),
        fetchStatsData()
      ]).finally(() => setLoading(false));
    }
  }, [id, authUser]);
  const fetchProfileData = async () => {
    try {
      if (isOwnProfile) {
        const data = await getProfile();
        setProfileUser(data);
      } else {
        const data = await getUserProfile(id);
        setProfileUser(data);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const fetchConnectionsData = async () => {
    try {
      const data = await getMyConnections();
      if (isOwnProfile) {
        const users = data
          .map((conn) => conn.senderId === authUser.id ? conn.receiver : conn.sender)
          .filter(Boolean);
        setConnections(users);
      } else {
        const parsedId = Number(id);
        const sharedConn = data.find(c => c.senderId === parsedId || c.receiverId === parsedId);
        if (sharedConn) {
          setConnectionId(sharedConn.id);
          setConnectionStatus(sharedConn.status === 'accepted' ? 'connected' : 'pending');
          if (sharedConn.receiverId === authUser.id) {
            setConnectionRole('receiver');
          } else {
            setConnectionRole('sender');
          }
        } else {
          setConnectionStatus('none');
          setConnectionRole(null);
        }
        setConnections([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStatsData = async () => {
    try {
      // Derive stats from real backend data
      const [appsResult, connsResult] = await Promise.allSettled([
        getMyApplications(),
        getMyConnections(),
      ]);
      const appsCount = appsResult.status === 'fulfilled' ? (appsResult.value?.length || 0) : 0;
      const connsCount = connsResult.status === 'fulfilled' ? (connsResult.value?.length || 0) : 0;
      setStats({
        applied: appsCount,
        connections: connsCount,
      });
    } catch (e) {
      console.error("Error fetching stats:", e);
      setStats({ applied: 0, connections: 0 });
    }
  };
  const handleEditProfile = () => {
    setIsEditing(true);
  };
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await sendConnectionRequest(id);
      await fetchConnectionsData();
    } catch (e) {
      console.error(e);
      setConnectionStatus('pending');
      setConnectionRole('sender');
    }
    finally { setIsConnecting(false); }
  };
  const handleAcceptConnection = async (status) => {
    setIsConnecting(true);
    try {
      if (connectionId) await updateConnectionStatus(connectionId, status);
      await fetchConnectionsData();
    } catch (e) {
      console.error(e);
    } finally { setIsConnecting(false); }
  };
  if (loading) {
    return (
      <div className="flex flex-col gap-8 max-w-5xl mx-auto animate-fade-in font-sans pb-10">
        <div className="card p-0 overflow-hidden border-white/5">
          <div className="h-32 skeleton rounded-none"></div>
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 -mt-12 md:-mt-16">
            <div className="w-28 h-28 rounded-full skeleton border-4 border-surface shrink-0"></div>
            <div className="flex flex-col gap-3 w-full pt-4">
              <div className="skeleton h-8 w-48 rounded-lg"></div>
              <div className="skeleton h-4 w-32 rounded"></div>
              <div className="skeleton h-10 w-36 rounded-xl mt-2"></div>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="card h-20 skeleton border-white/5"></div>)}
        </div>
      </div>
    );
  }
  if (!profileUser) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-surface border border-white/5 flex items-center justify-center text-3xl mb-4">😕</div>
        <p className="text-textSoft text-lg font-medium">Profile not found</p>
        <p className="text-textSoft/50 text-sm mt-1">This user might not exist or has been removed.</p>
      </div>
    );
  }
  const statItems = [
    { label: "Jobs Applied", value: stats?.applied, icon: "📄", color: "text-primaryHover" },
    { label: "Connections", value: stats?.connections, icon: "🤝", color: "text-accent" },
  ];
  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-5xl mx-auto animate-fade-in font-sans pb-10">
      {/* PROFILE CARD */}
      <div className="card relative overflow-hidden bg-gradient-to-br from-surface to-surface/80 p-0 border-white/5 shadow-2xl rounded-2xl sm:rounded-3xl">
        {/* Banner */}
        <div className="h-28 sm:h-32 md:h-36 bg-gradient-to-r from-primary via-primaryHover to-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-50"></div>
        </div>
        {/* Profile Info */}
        <div className="relative px-4 sm:px-6 md:px-10 pb-6 sm:pb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 -mt-12 sm:-mt-14 md:-mt-16">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-3 sm:gap-5">
              {/* Avatar */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-bg border-4 border-surface shadow-2xl flex items-center justify-center text-4xl sm:text-5xl md:text-6xl font-bold text-primary uppercase shrink-0 hover:scale-105 transition-transform duration-300 ring-2 ring-white/10">
                {profileUser.name.charAt(0)}
              </div>
              <div className="text-center md:text-left pb-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-textMain tracking-tight truncate">{profileUser.name}</h1>
                <p className="text-textSoft text-xs sm:text-sm md:text-base flex items-center justify-center md:justify-start gap-1.5 mt-1 sm:mt-1.5 font-medium truncate">
                  ✉️ {profileUser.email}
                </p>
                <div className="mt-2.5 sm:mt-3 inline-flex items-center gap-2 badge badge-primary px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-sm font-semibold">
                  <span>🤝</span> {isOwnProfile ? connections.length : "Mutual"} Connections
                </div>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 pb-1 mt-2 md:mt-0 w-full md:w-auto">
              {isOwnProfile ? (
                <button
                  onClick={handleEditProfile}
                  className="btn-secondary w-full sm:w-auto text-xs sm:text-sm py-2.5 sm:py-2"
                >
                  ✏️ Edit Profile
                </button>
              ) : (
                <>
                  {connectionStatus === 'connected' ? (
                    <button
                      className="btn-secondary w-full sm:w-auto cursor-default badge-success border-green-500/30 text-green-400 py-2.5 sm:py-2"
                      disabled
                    >
                      ✓ Connected
                    </button>
                  ) : connectionStatus === 'pending' ? (
                    connectionRole === 'receiver' ? (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          className="btn-primary flex-1 shadow-md bg-green-600 hover:bg-green-700 text-xs sm:text-sm py-2.5 sm:py-2"
                          onClick={() => handleAcceptConnection('accepted')}
                          disabled={isConnecting}
                        >
                          ✅ Accept
                        </button>
                        <button
                          className="btn-secondary flex-1 border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs sm:text-sm py-2.5 sm:py-2"
                          onClick={() => handleAcceptConnection('rejected')}
                          disabled={isConnecting}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn-secondary w-full sm:w-auto border-yellow-500/30 text-yellow-500 cursor-default text-xs sm:text-sm py-2.5 sm:py-2"
                        disabled
                      >
                        ⏳ Request Pending
                      </button>
                    )
                  ) : (
                    <button
                      className="btn-primary w-full sm:w-auto shadow-md text-xs sm:text-sm py-2.5 sm:py-2"
                      onClick={handleConnect}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Connecting...
                        </span>
                      ) : '+ Connect'}
                    </button>
                  )}
                  {connectionStatus === 'connected' && (
                    <button
                      onClick={() => navigate('/chat')}
                      className="btn-primary w-full sm:w-auto shadow-md text-xs sm:text-sm py-2.5 sm:py-2"
                    >
                      💬 Message
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        {/* Stats Banner */}
        {stats && (
          <div className="grid grid-cols-2 divide-x divide-white/5 border-t border-white/5 bg-black/10">
            {statItems.map((stat) => (
              <div key={stat.label} className="p-3 sm:p-4 text-center hover:bg-white/5 transition-colors group cursor-default">
                <span className="text-xs sm:text-sm mb-0.5 sm:mb-1 block opacity-60 group-hover:opacity-100 transition-opacity">{stat.icon}</span>
                <span className={`block text-lg sm:text-xl md:text-2xl font-black ${stat.color}`}>{stat.value ?? 0}</span>
                <span className="text-[10px] sm:text-[11px] text-textSoft/60 uppercase tracking-wider font-semibold">{stat.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* CONNECTIONS GRID */}
      {isOwnProfile && (
        <div>
          <div className="flex items-center justify-between mb-4 sm:mb-5 px-1">
            <h2 className="text-lg sm:text-xl font-bold text-textMain">Your Network</h2>
            <span className="badge badge-primary text-[10px] sm:text-xs py-1 px-3">
              {connections.length} connections
            </span>
          </div>
          {connections.length === 0 ? (
            <div className="card border-dashed border-2 bg-transparent border-white/10 py-10 sm:py-14 text-center shadow-none">
              <div className="w-12 h-12 rounded-2xl bg-surface border border-white/5 flex items-center justify-center text-xl sm:text-2xl mx-auto mb-4">
                🤝
              </div>
              <p className="text-textMain font-semibold text-base sm:text-lg">No connections yet</p>
              <p className="text-xs sm:text-sm text-textSoft/60 mt-1">Start connecting with professional sync!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {connections.map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/profile/${c.id}`)}
                  className="card card-hover flex items-center gap-3 sm:gap-4 !p-3 sm:!p-4 group cursor-pointer border-white/5 hover:border-primary/30 relative active:scale-[0.98]"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-bg border-2 border-white/10 flex items-center justify-center text-base sm:text-lg font-black group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all duration-300 uppercase shrink-0">
                    {c.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-textMain group-hover:text-primaryHover transition-colors truncate text-sm sm:text-base">{c.name}</h3>
                    <p className="text-[10px] sm:text-xs text-textSoft/60 font-medium">1st degree</p>
                  </div>
                  <span className="text-textSoft/20 group-hover:text-primaryHover transition-colors shrink-0 text-sm">
                    ↗
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm" onClick={() => setIsEditing(false)}></div>
          <div className="card w-full sm:max-w-md relative z-10 animate-slide-up bg-surface border-white/10 shadow-2xl rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 pb-3 sm:pb-4 border-b border-white/5 shrink-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-textMain">Edit Profile</h2>
                <p className="text-textSoft text-xs sm:text-sm mt-0.5">Update your public profile information.</p>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="btn-icon shrink-0"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 flex flex-col gap-4 hide-scrollbar">
              <div>
                <label className="block text-sm font-medium text-textSoft mb-1.5">Full Name</label>
                <input type="text" className="input-field" defaultValue={profileUser.name} />
              </div>
              <div>
                <label className="block text-sm font-medium text-textSoft mb-1.5">Headline</label>
                <input type="text" className="input-field" placeholder="e.g. Senior Software Engineer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-textSoft mb-1.5">Bio</label>
                <textarea className="input-field min-h-[100px] sm:min-h-[120px] resize-y" placeholder="Tell us about yourself..." />
              </div>

              <div className="flex gap-3 mt-4 shrink-0 pb-2">
                <button onClick={() => setIsEditing(false)} className="btn-secondary flex-1 text-sm sm:text-base py-2.5 sm:py-2">Cancel</button>
                <button onClick={() => setIsEditing(false)} className="btn-primary flex-1 text-sm sm:text-base py-2.5 sm:py-2">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;