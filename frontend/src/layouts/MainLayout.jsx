import Navbar from "../components/Navbar";

function MainLayout({ children }) {
    return (
        <div className = "min-h-screen bg-bg text-textMain">
            <Navbar />
            <main className = "p-6">
                {children}
            </main>
        </div>
    );
}

export default MainLayout;