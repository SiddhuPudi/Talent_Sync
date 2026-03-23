import { Navigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

function ProtectedRoute({ children }) {
    const { token } = useAuth();
    if (!token) {
        return <Navigate to="/auth" replace />;
    }
    return children;
}

export default ProtectedRoute;