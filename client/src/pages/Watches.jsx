import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"

export default function Watches() {
    const [watches, setWatches] = useState(null)
    const { token, logout } = useAuth()

    useEffect(() => {
        async function getWatches() {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/me/watches`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                })

                if (!response.ok) {
                    logout()
                    return
                }

                const data = await response.json()
                setWatches(data)
            } catch (error) {
                console.error("Server error: ", error)
            }
        }
        getWatches()
    }, [token])

    return (
        <div className="min-h-screen animate-subtle-shift">
            <div className="relative z-10 min-h-screen flex flex-col">
                 <Navbar />
                {watches === null ? (
                    <div className="flex flex-1 items-center justify-center">
                        <div className="loading"></div>
                    </div>
                ) : (
                    <motion.div
                        className="mx-24 mt-18"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <motion.h1
                            className="font-semibold mt-4 text-2xl text-slate-900"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            Your Watches
                        </motion.h1>

                        {watches.length === 0 ? (
                            <motion.div
                                className="flex items-center justify-center mt-8"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <p className="text-slate-600 text-lg">
                                    No watches yet. Start tracking products from the dashboard!
                                </p>
                            </motion.div>
                        ) : (
                            <motion.ul
                                className="flex flex-col ml-8 mt-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                {watches.map((watch, index) => (
                                    <motion.li
                                        key={watch.watchId}
                                        className="mb-2"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                                    >
                                        <Link
                                            to={`/my-watches/${watch.watchId}`}
                                            className="block py-4 px-4 font-semibold bg-[#f4f4f4] shadow-sm hover:underline hover:underline-offset cursor-pointer rounded-lg transition-all hover:shadow-md"
                                        >
                                            {watch.product.title || "product"}
                                        </Link>
                                    </motion.li>
                                ))}
                            </motion.ul>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    )
}