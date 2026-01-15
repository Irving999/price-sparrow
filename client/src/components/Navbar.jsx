import { useNavigate } from "react-router-dom"

export default function Navbar() {
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem("token")
        navigate("/login")
    }

    return (
        <div className="flex items-center mx-16 mt-4 gap-48 text-white bg-sky-500 rounded-full h-16 shadow-lg shadow-black/20">
            <p className="font-semibold text-xl ml-16">PriceTrackerCracker</p>
            <ul className="flex w-96 justify-evenly">
                <li
                    className="font-semibold w-24 text-black-500 hover:underline hover:underline-offset cursor-pointer">
                        Watches
                </li>
                <li
                    className="font-semibold w-24 text-black-500 hover:underline hover:underline-offset cursor-pointer">
                        Profile
                </li>
            </ul>
            <button
                onClick={handleLogout}
                className="font-semibold mr-16 w-24 text-black-500 hover:underline hover:underline-offset cursor-pointer">
                    Logout
            </button>
        </div>
    )
}