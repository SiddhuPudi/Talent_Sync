import Navbar from "../components/Navbar";

function MainLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-bg text-textMain font-sans overflow-x-hidden">
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 animate-fade-in w-full">
                {children}
            </main>
        </div>
    );
}

export default MainLayout;