import { Navigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

function ProtectedRoute({ children }) {
    const { token, isAuthLoading } = useAuth();

    // While auth is still initializing, show nothing (prevents flash redirect)
    if (isAuthLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primaryHover rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/auth" replace />;
    }

    return children;
}

export default ProtectedRoute;