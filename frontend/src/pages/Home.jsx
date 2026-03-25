import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="flex flex-col gap-8 animate-fade-in font-sans">

      {/* HERO SECTION */}
      <div className="card text-center bg-gradient-to-br from-surface to-bg border-white/10 relative overflow-hidden group">
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-primary/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/30 transition-colors duration-700"></div>
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-accent/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-accent/20 transition-colors duration-700"></div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primaryHover to-accent mb-4 tracking-tight">
          Welcome to Talent Sync
        </h1>
        <p className="text-textSoft text-lg max-w-2xl mx-auto">
          Connect with elite professionals, explore tailored opportunities, and engage in real-time conversations.
        </p>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* Jobs */}
        <Link to="/jobs" className="group">
          <div className="card card-hover h-full flex flex-col justify-center items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 text-primaryHover flex items-center justify-center text-3xl group-hover:scale-110 group-hover:bg-primary/30 transition-all duration-300">
              💼
            </div>
            <div>
              <h2 className="text-xl font-bold text-textMain mb-2 group-hover:text-primaryHover transition-colors">Find Jobs</h2>
              <p className="text-textSoft text-sm">
                Explore and apply for top-tier opportunities.
              </p>
            </div>
          </div>
        </Link>

        {/* Chat */}
        <Link to="/chat" className="group">
          <div className="card card-hover h-full flex flex-col justify-center items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-accent/20 text-accent flex items-center justify-center text-3xl group-hover:scale-110 group-hover:bg-accent/30 transition-all duration-300">
              💬
            </div>
            <div>
              <h2 className="text-xl font-bold text-textMain mb-2 group-hover:text-accent transition-colors">Start Chatting</h2>
              <p className="text-textSoft text-sm">
                Connect and message your network instantly.
              </p>
            </div>
          </div>
        </Link>

        {/* Notifications */}
        <Link to="/notifications" className="group">
          <div className="card card-hover h-full flex flex-col justify-center items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:bg-red-500/30 transition-all duration-300">
              🔔
            </div>
            <div>
              <h2 className="text-xl font-bold text-textMain mb-2 group-hover:text-red-400 transition-colors">Stay Updated</h2>
              <p className="text-textSoft text-sm">
                Never miss an important activity or alert.
              </p>
            </div>
          </div>
        </Link>

      </div>

    </div>
  );
}

export default Home;