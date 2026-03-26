import { Link } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { useNotifications } from "../store/NotificationContext";
import { useEffect, useState } from "react";
import { getMyConnections } from "../features/profile/profileService";
import { getMyApplications } from "../services/applicationService";

function Home() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [connectionsCount, setConnectionsCount] = useState(null);
  const [applicationsCount, setApplicationsCount] = useState(null);
  const [loading, setLoading] = useState(true);

  const firstName = user?.name?.split(" ")[0] || "there";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [conns, apps] = await Promise.allSettled([
          getMyConnections(),
          getMyApplications(),
        ]);
        if (conns.status === "fulfilled") setConnectionsCount(conns.value?.length || 0);
        if (apps.status === "fulfilled") setApplicationsCount(apps.value?.length || 0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statItems = [
    { label: "Connections", value: connectionsCount, icon: "🤝", color: "text-primaryHover" },
    { label: "Applications", value: applicationsCount, icon: "📄", color: "text-accent" },
    { label: "Notifications", value: unreadCount, icon: "🔔", color: "text-red-400" },
  ];

  const quickActions = [
    {
      path: "/jobs",
      title: "Find Jobs",
      desc: "Explore and apply for top-tier opportunities.",
      icon: "💼",
      iconBg: "bg-primary/20",
      iconColor: "text-primaryHover",
      hoverColor: "group-hover:text-primaryHover",
      hoverBg: "group-hover:bg-primary/30",
    },
    {
      path: "/chat",
      title: "Start Chatting",
      desc: "Connect and message your network instantly.",
      icon: "💬",
      iconBg: "bg-accent/20",
      iconColor: "text-accent",
      hoverColor: "group-hover:text-accent",
      hoverBg: "group-hover:bg-accent/30",
    },
    {
      path: "/notifications",
      title: "Stay Updated",
      desc: "Never miss an important activity or alert.",
      icon: "🔔",
      iconBg: "bg-red-500/20",
      iconColor: "text-red-400",
      hoverColor: "group-hover:text-red-400",
      hoverBg: "group-hover:bg-red-500/30",
    },
    {
      path: "/profile",
      title: "Your Profile",
      desc: "View and manage your professional profile.",
      icon: "👤",
      iconBg: "bg-green-500/20",
      iconColor: "text-green-400",
      hoverColor: "group-hover:text-green-400",
      hoverBg: "group-hover:bg-green-500/30",
    },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-in font-sans">

      {/* HERO / WELCOME */}
      <div className="card text-center bg-gradient-to-br from-surface to-bg border-white/10 relative overflow-hidden group py-10 md:py-14">
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-primary/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/30 transition-colors duration-700"></div>
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-accent/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-accent/20 transition-colors duration-700"></div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold gradient-text mb-3 tracking-tight relative z-10">
          {getGreeting()}, {firstName}! 👋
        </h1>
        <p className="text-textSoft text-base md:text-lg max-w-2xl mx-auto relative z-10">
          Connect with elite professionals, explore tailored opportunities, and engage in real-time conversations.
        </p>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-3 gap-4">
        {statItems.map((stat) => (
          <div key={stat.label} className="card text-center py-5 hover:border-white/10 transition-all group">
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="skeleton w-10 h-8 rounded-lg"></div>
                <div className="skeleton w-16 h-3 rounded"></div>
              </div>
            ) : (
              <>
                <span className="text-2xl mb-1 block">{stat.icon}</span>
                <span className={`text-2xl md:text-3xl font-black ${stat.color} block`}>
                  {stat.value ?? "—"}
                </span>
                <span className="text-xs text-textSoft font-medium uppercase tracking-wider mt-1 block">
                  {stat.label}
                </span>
              </>
            )}
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div>
        <h2 className="text-lg font-semibold text-textMain mb-4 px-1">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {quickActions.map((action) => (
            <Link key={action.path} to={action.path} className="group">
              <div className="card card-hover h-full flex flex-col justify-center items-center text-center gap-4 py-8">
                <div className={`w-14 h-14 rounded-2xl ${action.iconBg} ${action.iconColor} flex items-center justify-center text-2xl group-hover:scale-110 ${action.hoverBg} transition-all duration-300 shadow-sm`}>
                  {action.icon}
                </div>
                <div>
                  <h2 className={`text-lg font-bold text-textMain mb-1.5 ${action.hoverColor} transition-colors`}>{action.title}</h2>
                  <p className="text-textSoft text-sm leading-relaxed">{action.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;