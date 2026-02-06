import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import SignUp from "./pages/Signup"
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
import Watches from "./pages/Watches"
import Watch from "./pages/Watch"
import Landing from "./pages/Landing"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
