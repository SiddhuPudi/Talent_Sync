import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="flex flex-col gap-8">

      {/* HERO SECTION */}
      <div className="bg-surface p-8 rounded-xl shadow-md text-center">
        <h1 className="text-3xl font-bold text-accent mb-2">
          Welcome to Talent Sync 🚀
        </h1>
        <p className="text-textSoft">
          Connect with professionals, explore jobs, and chat in real-time.
        </p>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid md:grid-cols-3 gap-4">

        {/* Jobs */}
        <Link to="/jobs">
          <div className="bg-surface p-6 rounded-xl shadow-md hover:scale-105 transition cursor-pointer">
            <h2 className="text-xl text-accent mb-2">Jobs</h2>
            <p className="text-textSoft">
              Explore and apply for opportunities.
            </p>
          </div>
        </Link>

        {/* Chat */}
        <Link to="/chat">
          <div className="bg-surface p-6 rounded-xl shadow-md hover:scale-105 transition cursor-pointer">
            <h2 className="text-xl text-accent mb-2">Chat</h2>
            <p className="text-textSoft">
              Connect and message your network.
            </p>
          </div>
        </Link>

        {/* Notifications */}
        <Link to="/notifications">
          <div className="bg-surface p-6 rounded-xl shadow-md hover:scale-105 transition cursor-pointer">
            <h2 className="text-xl text-accent mb-2">Notifications</h2>
            <p className="text-textSoft">
              Stay updated with activity.
            </p>
          </div>
        </Link>

      </div>

    </div>
  );
}

export default Home;