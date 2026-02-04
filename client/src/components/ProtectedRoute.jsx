import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth()
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-lg text-gray-600">Loading...</p>
            </div>
        )
    }
    if (!isAuthenticated) {
        return <Navigate to="/" />
    }

    return children
}