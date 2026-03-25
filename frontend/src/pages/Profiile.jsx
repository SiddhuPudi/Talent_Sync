import { useEffect, useState } from "react";
import {
  getProfile,
  getMyConnections,
} from "../features/profile/profileService";
import { useAuth } from "../store/AuthContext";

function Profile() {
  const [user, setUser] = useState(null);
  const [connections, setConnections] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
        fetchProfile();
        fetchConnections();
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      console.log("Profile data:", data);
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

  if (!user) {
    return <p className="text-textSoft">Loading profile...</p>;
  }

  return (
    <div className="flex flex-col gap-6">

      {/* PROFILE CARD */}
      <div className="bg-surface p-6 rounded-xl shadow-md">
        <h1 className="text-2xl text-accent">{user.name}</h1>
        <p className="text-textSoft">{user.email}</p>
      </div>

      {/* CONNECTIONS */}
      <div>
        <h2 className="text-xl text-accent mb-2">Connections</h2>

        {connections.length === 0 ? (
          <p className="text-textSoft">No connections yet</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {connections.map((c) => (
              <div
                key={c.id}
                className="bg-surface p-3 rounded-lg"
              >
                {c.name}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default Profile;