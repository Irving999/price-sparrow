import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useState } from "react"

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const { logout } = useAuth()

    return (
        <>
            <nav className="mx-auto mt-4 w-md sm:w-xl transition-all duration-300 ease-out relative z-100">
                <div className="flex justify-between px-6 items-center text-white bg-sky-500 rounded-full h-16 shadow-lg shadow-black/20">
                    <p className="font-semibold text-xl">PriceTrackerCracker</p>
                    <ul className="hidden sm:flex gap-4">
                        <li>
                            <Link to="/dashboard" className="nav-bullet rounded-full cursor-pointer">
                            Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link to="/my-watches" className="nav-bullet rounded-full cursor-pointer">
                            Watches
                            </Link>
                        </li>
                        <li>
                            <button type="button" onClick={logout}
                                className="nav-bullet rounded-full cursor-pointer">
                                    Logout
                            </button>
                        </li>
                    </ul>
                    <button onClick={() => setIsOpen(!isOpen)}>
                        <svg
                            className="w-11 h-11 ml-8 sm:hidden hover:bg-sky-400 rounded-full p-2 cursor-pointer transition-colors duration-200"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {isOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                                ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>
                </div>
            </nav>

            <div className={`absolute bg-sky-500 sm:hidden w-full h-full z-10 overflow-hidden transition-all duration-300 ease
                    ${isOpen ? "max-h-screen" : "max-h-0"}`}>
                <ul className="flex flex-col px-3 w-full text-white font-semibold text-lg absolute top-24">
                    <li className="pl-3 border-b border-white">
                        <Link to="/dashboard" className="glow">
                            Dashboard
                        </Link>
                    </li>
                    <li className="pl-3 border-b border-white">
                        <Link to="/my-watches" className="glow">
                            Watches
                        </Link>
                    </li>
                    <li>
                        <button type="button" onClick={logout} className="glow lock mx-auto">
                            Logout
                        </button>
                    </li>
                </ul>
            </div>
        </>
    )
}