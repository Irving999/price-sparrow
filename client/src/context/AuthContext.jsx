import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem("token"))
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    const login = (newToken, user) => {
        localStorage.setItem("token", newToken)
        setToken(newToken)
        setUser(user)
        navigate("/dashboard")
    }

    const logout = () => {
        localStorage.removeItem("token")
        setToken(null)
        setUser(null)
        navigate("/")
    }

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setLoading(false)
                return
            }
            try {
                const response = await fetch("http://localhost:3000/api/me", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                })
                // User token is invalid or expired
                if (!response.ok) {
                    logout()
                    return
                }
                const data = await response.json()
                setUser(data.user)
            } catch (error) {
                logout()
            } finally {
                setLoading(false)
            }
        }
        verifyToken()
    }, [token])

    useEffect(() => {
        if (!token) return

        try {
            const decoded = jwtDecode(token)
            const expiryTime = decoded.exp * 1000
            const now = Date.now()

            if (expiryTime <= now) {
                logout()
                return
            }

            // Logout when token expires
            const timeUntilExpiry = expiryTime - now
            const timeoutId = setTimeout(() => {
                logout()
            }, timeUntilExpiry)

            return () => clearTimeout(timeoutId)
        } catch (error) {
            console.error("Invalid token", error)
            logout()
        }
    }, [token])

    const isAuthenticated = !!token && !!user

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used with AuthProvider")
    }
    return context
}