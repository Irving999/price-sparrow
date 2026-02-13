import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import Navbar from "../components/Navbar"
import ImageCarousel from "../components/ImageCarousel"
import PriceChart from "../components/PriceChart"
import { useAuth } from "../context/AuthContext"

export default function Watch() {
    const [watches, setWatches] = useState(null)
    const [watch, setWatch] = useState(null)
    const [error, setError] = useState("")
    const [editing, setEditing] = useState(false)
    const [editPrice, setEditPrice] = useState("")

    const { watchId } = useParams()
    const navigate = useNavigate()
    const { token } = useAuth()

    useEffect(() => {
        const fetchWatches = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/me/watches`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                })
                const data = await response.json()

                if (!response.ok) {
                    setError(data.message)
                    return
                }

                setWatches(data)
                setError("")
            } catch (error) {
                setError("Unable to connect to server. Please try again later")
                console.error("Server error: ", error)
            }
        }
        fetchWatches()
    }, [])

    useEffect(() => {
        const fetchWatch = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/me/watches/${watchId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                })
                const data = await response.json()

                if (!response.ok) {
                    setError(data.message)
                    return
                }

                setWatch(data)
                setError("")
            } catch (error) {
                console.error("Server error: ", error)
                setError("Server error")
            }
        }
        fetchWatch()
    }, [watchId])

    const handleNext = () => {
        let currentIndex = watches.findIndex(w => String(w.watchId) === watchId)
        if (currentIndex === -1 || currentIndex === watches.length - 1) {
            return
        }

        const nextWatch = watches[currentIndex + 1]
        navigate(`/my-watches/${nextWatch.watchId}`)
    }

    const handlePrev = () => {
        let currentIndex = watches.findIndex(w => String(w.watchId) === watchId)
        if (currentIndex === -1 || currentIndex === 0) {
            return
        }
        
        const prevWatch = watches[currentIndex - 1]
        navigate(`/my-watches/${prevWatch.watchId}`)
    }

    const handleEdit = async () => {
        const num = Number(editPrice)
        if (!Number.isFinite(num) || num < 0) {
            setError("Target price must be a non-negative number")
            return
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/me/watches/${watchId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ targetPrice: num })
            })
            const data = await response.json()

            if (!response.ok) {
                setError(data.error)
                return
            }

            setWatch(prev => ({ ...prev, targetPrice: data.targetPrice }))
            setEditing(false)
            setError("")
        } catch (error) {
            console.error("Server error", error)
            setError("Server error")
        }
    }

    const handleDelete = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/me/watches/${watchId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            })
            const data = await response.json()

            if (!response.ok) {
                setError(data.message)
                return
            }

            setError("")
            navigate("/my-watches")
        } catch (error) {
            console.error("Server error", error)
            setError("Server error")
        }
    }

    const lastCheckedAt = watch ? new Date(watch.product.lastCheckedAt) : null

    if (error && !watch) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 bg-[length:200%_200%] animate-subtle-shift">
                <Navbar />
                <div className="relative flex justify-center items-center min-h-screen">
                    <p className="text-red-500 text-lg">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen animate-subtle-shift">
            <div className="relative z-10 flex min-h-screen flex-col">
                <Navbar />
                <motion.div
                    className="flex justify-between mx-12 mt-18"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <button
                        onClick={handlePrev}
                        disabled={watches && watches.findIndex(w => String(w.watchId) === watchId) <= 0}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors hover:bg-gray-300 duration-200
                            ${watches && watches.findIndex(w => String(w.watchId) === watchId) <= 0
                                ? "cursor-not-allowed"
                                : "cursor-pointer"}`
                            }
                    >
                        ← Previous
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={watches && watches.findIndex(w => String(w.watchId) === watchId) === watches.length - 1}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 hover:bg-gray-300
                            ${watches && watches.findIndex(w => String(w.watchId) === watchId) === watches.length - 1
                                ? "cursor-not-allowed"
                                : "cursor-pointer"}`
                            }
                    >
                        Next →
                    </button>
                </motion.div>
                {watch ? (
                    <motion.div
                        className="mx-24 my-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <ImageCarousel key={watch.watchId} title={watch.product.title} images={watch.productImages}/>
                        </motion.div>
                        <motion.div
                            className="flex gap-4 w-fit ml-auto"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <a href={watch.product.url} target="_blank" rel="noopener noreferrer" className="hover:underline hover:underline-offset transition-all">
                                View product
                            </a>
                            <button
                                className="rounded-full text-red-500 cursor-pointer hover:text-red-700 transition-colors"
                                onClick={handleDelete}
                                >
                                Stop Watching
                            </button>
                        </motion.div>
                        <motion.h1
                            className="font-semibold mt-4 text-2xl text-slate-900"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            {watch.product.title}
                        </motion.h1>
                        <motion.div
                            className="pl-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                        >
                            <div className="flex flex-col ">
                                <div className="flex-1">
                                    {watch.product.currentPrice ? (
                                        <span>
                                            This product is currently valued at
                                            <strong> ${watch.product.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                                        </span>
                                        ) : (
                                        <span>
                                            This product is currently
                                            <strong className="text-red-600"> out of stock</strong>
                                        </span>
                                        
                                    )}
                                    {editing ? (
                                        <div className="flex items-center gap-2 my-1">
                                            <span>Target price: $</span>
                                            <input
                                                type="number"
                                                value={editPrice}
                                                onChange={(e) => setEditPrice(e.target.value)}
                                                className="w-28 px-2 py-1 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-500/50 outline-none"
                                                autoFocus
                                            />
                                            <button
                                                onClick={handleEdit}
                                                className="text-sm text-white bg-sky-500 hover:bg-sky-700 px-3 py-1 rounded-lg cursor-pointer transition-colors"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => { 
                                                    setEditing(false)
                                                    setError("")
                                                }}
                                                className="text-sm text-slate-500 hover:text-slate-700 cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <p>
                                            You're waiting for the product to drop to
                                            <strong> ${watch.targetPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })} </strong>
                                            or less
                                            <button
                                                onClick={() => { setEditing(true); setEditPrice(watch.targetPrice) }}
                                                className="ml-2 text-sm text-sky-500 hover:text-sky-700 cursor-pointer hover:underline hover:underline-offset"
                                            >
                                                Edit
                                            </button>
                                        </p>
                                    )}
                                    <p>
                                        This product was last checked on{" "}
                                        <strong>
                                            {lastCheckedAt.toLocaleString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: true
                                            })}
                                        </strong>
                                    </p>
                                </div>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.7 }}
                            >
                                <PriceChart priceData={watch.productHistory} />
                            </motion.div>
                        </motion.div>
                    </motion.div>
                ) : (
                    <div className="flex flex-1 items-center justify-center">
                        <div className="loading"></div>
                    </div>
                )}
            </div>
        </div>
    )
}