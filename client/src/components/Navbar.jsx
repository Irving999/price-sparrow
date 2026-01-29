import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Navbar() {
    const navigate = useNavigate()
    const { logout } = useAuth()

    return (
        <div className="flex items-center mx-16 mt-4 gap-24 text-white bg-sky-500 rounded-full h-16 shadow-lg shadow-black/20">
            <p className="font-semibold text-xl ml-16">PriceTrackerCracker</p>
            <ul className="flex w-124 justify-evenly">
                <li>
                    <button type="button" onClick={() => navigate("/dashboard")}
                        className="font-semibold w-24 text-black-500 hover:underline hover:underline-offset cursor-pointer">
                            Dashboard
                    </button>
                </li>
                <li>
                    <button type="button" onClick={() => navigate("/my-watches")}
                        className="font-semibold w-24 text-black-500 hover:underline hover:underline-offset cursor-pointer">
                            Watches
                    </button>
                </li>
                
            </ul>
            <button
                onClick={logout}
                className="font-semibold mr-16 w-24 text-black-500 hover:underline hover:underline-offset cursor-pointer">
                    Logout
            </button>
        </div>
    )
}