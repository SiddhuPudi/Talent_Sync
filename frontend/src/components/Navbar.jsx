import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav className = "w-full bg-surface px-6 py-4 flex justify-between items-center shadow-md">
            <h1 className = "text-x1 font-semibold text-accent">
                Talent Sync
            </h1>

            <div className = "flex gap-6 text-textSoft">
                <Link to="/" className = "hover:text-primaryHover cursor-pointer">Home</Link>
                <Link to="/jobs" className = "hover:text-primaryHover cursor-pointer">Jobs</Link>
                <Link to="/chat" className = "hover:text-primaryHover cursor-pointer">Chat</Link>
                <Link to="/notifications" className = "hover:text-primaryHover cursor-pointer">Notifications</Link>
            </div>
        </nav>
    );
}

export default Navbar;