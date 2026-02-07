import { useEffect } from "react"
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import SignUp from "./pages/Signup"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
import Watches from "./pages/Watches"
import Watch from "./pages/Watch"
import Landing from "./pages/Landing"
import LoginModal from "./components/LoginModal"

function LoginRoute() {
  const { openLoginModal, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true })
    } else {
      openLoginModal()
    }
  }, [])

  return <Landing />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LoginModal />
        <Routes>
          <Route path="/dashboard" element={<Landing />} />
          <Route
            path="/my-watches"
            element={
              <ProtectedRoute>
                <Watches />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-watches/:watchId"
            element={
              <ProtectedRoute>
                <Watch />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<LoginRoute />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
