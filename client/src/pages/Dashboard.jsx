import { useNavigate } from "react-router-dom"

export default function Dashboard() {
    const navigate = useNavigate()
    
    const handleLogout = () => {
        localStorage.removeItem("token")
        navigate('/login')
    }

    return (
        <>
            <h1>You are logged in</h1>
            <button
                onClick={handleLogout}
                className="text-white bg-red-500 hover:bg-red-700 py-1 px-3 rounded-xl cursor-pointer">
                    Logout
            </button>
        </>
    )
}