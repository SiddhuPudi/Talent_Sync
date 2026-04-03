import Navbar from "../components/Navbar";

function MainLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-bg text-textMain font-sans selection:bg-primary/30">
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 lg:py-10 animate-fade-in">
                {children}
            </main>
            <footer className="w-full border-t border-white/5 py-6 mt-auto">
                <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-textSoft/50">
                    <p>© {new Date().getFullYear()} Talent Sync. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <span className="hover:text-textSoft transition-colors cursor-pointer">Privacy</span>
                        <span className="hover:text-textSoft transition-colors cursor-pointer">Terms</span>
                        <span className="hover:text-textSoft transition-colors cursor-pointer">Help</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default MainLayout;