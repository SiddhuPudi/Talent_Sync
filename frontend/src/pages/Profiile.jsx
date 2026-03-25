import { useEffect, useState } from "react";
import {
  getProfile,
  getMyConnections,
} from "../features/profile/profileService";
import { useAuth } from "../store/AuthContext";

function Profile() {
  const [user, setUser] = useState(null);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
        Promise.all([fetchProfile(), fetchConnections()]).finally(() => setLoading(false));
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      setUser(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchConnections = async () => {
    try {
      const data = await getMyConnections();
      const userId = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
      ).id;
      const users = data
        .map((conn) => 
          conn.senderId === userId ? conn.receiver : conn.sender
        )
        .filter(Boolean);
  
      setConnections(users);
  
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
     return (
        <div className="flex flex-col gap-8 max-w-5xl mx-auto animate-fade-in font-sans">
            <div className="card h-48 skeleton flex items-center p-8 gap-6 border-white/5">
                 <div className="w-24 h-24 rounded-full bg-white/10 shrink-0"></div>
                 <div className="flex flex-col gap-3 w-full">
                     <div className="w-48 h-6 bg-white/10 rounded"></div>
                     <div className="w-32 h-4 bg-white/10 rounded"></div>
                 </div>
            </div>
            <div>
               <div className="w-40 h-8 bg-white/5 rounded skeleton mb-4"></div>
               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1,2,3].map(i => <div key={i} className="card h-20 skeleton border-white/5"></div>)}
               </div>
            </div>
        </div>
     );
  }

  if (!user) {
    return <div className="text-center mt-20"><p className="text-textSoft text-lg">Failed to load profile.</p></div>;
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto animate-fade-in font-sans">

      {/* PROFILE CARD */}
      <div className="card relative overflow-hidden bg-gradient-to-br from-surface to-surface/80 p-0 border-white/5">
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-primary to-primaryHover"></div>
        <div className="relative pt-12 pb-8 px-8 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-32 h-32 rounded-full bg-bg border-4 border-surface shadow-xl flex items-center justify-center text-5xl font-bold text-primary z-10 uppercase shrink-0">
                {user.name.charAt(0)}
            </div>
            <div className="flex-1 text-center md:text-left pt-2 md:pt-16 pb-2">
                <h1 className="text-3xl font-extrabold text-textMain">{user.name}</h1>
                <p className="text-textSoft text-lg flex items-center justify-center md:justify-start gap-2 mt-1">
                    ✉️ {user.email}
                </p>
                <div className="mt-4 inline-block bg-primary/20 text-primaryHover px-4 py-1.5 rounded-full font-medium shadow-sm">
                    {connections.length} Connections
                </div>
            </div>
        </div>
      </div>

      {/* CONNECTIONS */}
      <div>
        <h2 className="text-2xl font-bold text-accent mb-6 px-1">Your Network</h2>

        {connections.length === 0 ? (
          <div className="card border-dashed border-2 bg-transparent border-white/10 py-16 text-center">
            <span className="text-5xl opacity-50 mb-4 block">🤝</span>
            <p className="text-textSoft font-medium text-lg">No connections yet</p>
            <p className="text-sm text-textSoft/60 mt-1">Start chatting with people to build your network.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connections.map((c) => (
              <div
                key={c.id}
                className="card card-hover flex items-center gap-4 !p-4 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-bg border border-white/10 flex items-center justify-center text-lg font-bold group-hover:bg-primary group-hover:text-white transition-colors duration-300 uppercase shrink-0">
                   {c.name.charAt(0)}
                </div>
                <div className="min-w-0">
                   <h3 className="font-bold text-textMain group-hover:text-primaryHover transition-colors truncate">{c.name}</h3>
                   <p className="text-xs text-textSoft">Connected</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default Profile;