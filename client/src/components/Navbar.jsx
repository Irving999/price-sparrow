import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useState, useEffect } from "react"

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const { logout, isAuthenticated, loading, openLoginModal } = useAuth()

    // Prevent scrolling when dropdown is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (loading) return null
    
    return (
        <>
            {/* Mobile header with hamburger */}
            <div className="sm:hidden fixed top-0 left-0 right-0 z-50 glass shadow-lg">
                <div className="flex justify-end px-6 py-4">
                    <button onClick={() => setIsOpen(!isOpen)}>
                        <svg
                            className="w-8 h-8 hover:bg-black/5 rounded-full p-1 cursor-pointer transition-colors duration-200"
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
            <nav className="hidden sm:flex fixed top-4 left-1/2 -translate-x-1/2 px-12 items-center text-black/70 font-thin rounded-full h-16 glass shadow-lg shadow-black/20 z-50">
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
                        {isAuthenticated ? (
                                <button type="button" onClick={logout} className="nav-bullet rounded-md cursor-pointer">
                                    Logout
                                </button>
                            ) : (
                                <button type="button" onClick={openLoginModal} className="nav-bullet rounded-md cursor-pointer">
                                    Login
                                </button>
                            )
                        }
                    </li>
                </ul>
            </nav>

            {/* Mobile menu dropdown */}
            <div className={`fixed top-[57px] left-0 right-0 bottom-0 glass sm:hidden z-40 overflow-hidden transition-all duration-300 ease ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                <ul className="flex flex-col font-semibold text-lg">
                    <li className="text-center px-6 py-3">
                        <Link to="/dashboard" className="glow block" onClick={() => setIsOpen(false)}>
                            Dashboard
                        </Link>
                    </li>
                    <li className="text-center px-6 py-3">
                        <Link to="/my-watches" className="glow block" onClick={() => setIsOpen(false)}>
                            Watches
                        </Link>
                    </li>
                    <li className="text-center px-6 py-3">
                        {isAuthenticated ? (
                                <button type="button" onClick={logout} className="glow block w-full">
                                    Logout
                                </button>
                            ) : (
                                <button type="button" onClick={() => { setIsOpen(false); openLoginModal(); }} className="glow block w-full">
                                    Login
                                </button>
                            )
                        }
                    </li>
                </ul>
            </div>
        </>
    )
}