import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"

export default function Watches() {
    const [watches, setWatches] = useState([])
    const { token, logout } = useAuth()

    useEffect(() => {
        async function getWatches() {
            try {
                const response = await fetch("http://localhost:3000/api/me/watches", {
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
        <div className="relative z-10 mb-6 min-h-screen flex flex-col">
            <Navbar />
            <div className="mx-24 mt-18">
                <h1 className="font-semibold mt-4 text-2xl text-slate-900">Your Watches</h1>
                <ul className="flex flex-col ml-8 mt-4">
                    {watches && watches.map((watch) => {
                        return (
                            <li key={watch.watchId} className="mb-2">
                                <Link
                                    to={`/my-watches/${watch.watchId}`}
                                    className="block py-4 px-4 font-semibold bg-[#f4f4f4] shadow-sm hover:underline hover:underline-offset cursor-pointer rounded-lg">
                                        {watch.product.title || "product"}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    )
}