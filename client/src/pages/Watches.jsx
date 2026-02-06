import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"
import AnimatedBackground from "../components/AnimatedBackground";

export default function Watches() {
    const [watches, setWatches] = useState([])
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
        <AnimatedBackground fromStart={false} animated={true}>
            <div className="relative z-10 min-h-screen flex flex-col">
                <Navbar />
                {watches.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center">
                        <p className="text-slate-600 text-xl font-medium">
                            It's Oh so quite...
                        </p>
                    </div>
                ) : (
                    <div className="mx-24 mt-18">
                        <h1 className="font-semibold mt-4 text-2xl text-slate-900">
                            Your Watches
                        </h1>

                        <ul className="flex flex-col ml-8 mt-4">
                            {watches.map((watch) => (
                            <li key={watch.watchId} className="mb-2">
                                <Link
                                to={`/my-watches/${watch.watchId}`}
                                className="block py-4 px-4 font-semibold bg-[#f4f4f4] shadow-sm hover:underline hover:underline-offset cursor-pointer rounded-lg"
                                >
                                {watch.product.title || "product"}
                                </Link>
                            </li>
                            ))}
                        </ul>
                    </div>
                )}
                </div>
        </AnimatedBackground>
    )
}