import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useState } from "react"

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const { logout } = useAuth()

    return (
        <>
            {/* Mobile header with hamburger */}
            <div className="sm:hidden fixed top-0 left-0 right-0 z-50 bg-sky-500 shadow-lg">
                <div className="flex justify-end px-6 py-4">
                    <button onClick={() => setIsOpen(!isOpen)}>
                        <svg
                            className="w-8 h-8 text-white hover:bg-sky-400 rounded-full p-1 cursor-pointer transition-colors duration-200"
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
                <div className="h-px bg-white/30"></div>
            </div>

            {/* Desktop centered nav */}
            <nav className="hidden sm:block mx-auto mt-4 w-sm transition-all duration-300 ease-out relative z-100">
                <div className="flex justify-center px-6 items-center text-white bg-sky-500 rounded-full h-16 shadow-lg shadow-black/20">
                    <ul className="flex gap-4">
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
                            <button type="button" onClick={logout} className="nav-bullet rounded-full cursor-pointer">
                                Logout
                            </button>
                        </li>
                    </ul>
                </div>
            </nav>

            {/* Mobile menu dropdown */}
            <div className={`h-full fixed top-[57px] left-0 right-0 bg-sky-500 sm:hidden z-40 overflow-hidden transition-all duration-300 ease ${isOpen ? "max-h-screen" : "max-h-0"}`}>
                <ul className="flex flex-col text-white font-semibold text-lg">
                    <li className="text-center px-6 py-3 border-b border-white/30">
                        <Link to="/dashboard" className="glow block" onClick={() => setIsOpen(false)}>
                            Dashboard
                        </Link>
                    </li>
                    <li className="text-center px-6 py-3 border-b border-white/30">
                        <Link to="/my-watches" className="glow block" onClick={() => setIsOpen(false)}>
                            Watches
                        </Link>
                    </li>
                    <li className=" self-center px-6 py-3">
                        <button type="button" onClick={logout} className="glow block w-full text-left">
                            Logout
                        </button>
                    </li>
                </ul>
            </div>
        </>
    )
}