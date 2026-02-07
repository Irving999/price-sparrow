import { useState } from "react"
import Navbar from "../components/Navbar"
import { useAuth } from "../context/AuthContext"
import AnimatedBackground from "../components/AnimatedBackground"
import StoreMarquee from "../components/StoreMarquee"

export default function Landing() {
    const [url, setUrl] = useState("")
    const [price, setPrice] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [submitLoading, setSubmitLoading] = useState(false)

    const { token, isAuthenticated, openLoginModal, openSignupModal } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!isAuthenticated) {
            openLoginModal()
            return
        }

        if (!url || !price) {
            setError("Fields cannot be empty")
            setSuccess("")
            return
        }

        setSubmitLoading(true)
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/me/watches`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    url,
                    targetPrice: Number(price)
                })
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || "Something went wrong")
                setSuccess("")
                setSubmitLoading(false)
                return
            }

            setSuccess("Item successfully tracked!")
            setError("")
            setUrl("")
            setPrice("")
            setSubmitLoading(false)
        } catch (error) {
            setError("Server error")
            setSubmitLoading(false)
            console.error(error)
        }
    }

    return (
        <AnimatedBackground>
            <div className="relative flex z-10 flex-1 flex-col justify-between items-center min-h-screen px-4 sm:px-6">
                {isAuthenticated && <Navbar />}
            
                <div className={`${isAuthenticated ? 'my-24 sm:mt-40' : 'my-auto'} w-full max-w-3xl`}>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl text-center mb-4 tracking-tight">
                        Get Notified When Prices Drop
                    </h1>
            
                    <h2 className="text-lg sm:text-xl text-slate-600 font-light text-center mb-12 max-w-2xl mx-auto leading-relaxed">
                        Track prices across 50+ major retailers including <span className="font-medium text-slate-800">BestBuy</span>, <span className="font-medium text-slate-800">Walmart</span>, and <span className="font-medium text-slate-800">Target</span>.
                    </h2>
                    <div className="mt-8 sm:mt-12">
                        <form
                            className="flex flex-col sm:flex-row gap-3 w-full items-stretch"
                            onSubmit={handleSubmit}
                        >
                            <input
                                type="text"
                                placeholder="Paste product URL"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="glass font-light w-full sm:flex-1 px-4 py-3 rounded-xl focus:ring-2 focus:ring-sky-500/50 shadow-sm outline outline-black/5 transition-all"
                            />
                            <div className="relative flex w-full sm:w-40">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                <input
                                    type="number"
                                    placeholder="Price"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="glass font-light w-full pl-7 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-sky-500/50 shadow-sm outline outline-black/5 transition-all"
                                />
                            </div>
                            <button
                                className="w-full font-thin sm:w-auto text-white bg-[#252529] border-1 border-transparent hover:bg-transparent hover:border-1 hover:text-black hover:border-black py-2 sm:py-1 px-4 sm:px-3 rounded-xl cursor-pointer transition-colors duration-200 font-medium"
                                type="submit"
                                disabled={submitLoading}
                            >
                                {submitLoading ? "Adding..." : "Add Product"}
                            </button>
                        </form>
                    </div>
                    <div className="mt-6 min-h-[24px]">
                        {success && <p className="text-green-600 text-sm font-medium text-center animate-in fade-in duration-300">{success}</p>}
                        {error && <p className="text-red-500 text-sm font-medium text-center animate-in fade-in duration-300">{error}</p>}
                    </div>
                    {!isAuthenticated && (
                        <div className="mt-8 text-center">
                            <p className="text-slate-600 text-sm mb-2">
                                Don't have an account?
                            </p>
                            <div className="flex gap-2 items-center justify-center">
                                <button
                                    onClick={openSignupModal}
                                    className="text-sky-600 hover:text-sky-700 font-medium underline underline-offset-4 transition-colors"
                                >
                                    Sign up for free
                                </button>
                                <span className="text-slate-400">or</span>
                                <button
                                    onClick={openLoginModal}
                                    className="text-sky-600 hover:text-sky-700 font-medium underline underline-offset-4 transition-colors"
                                >
                                    Log in
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <StoreMarquee/>
            </div>
        </AnimatedBackground>
    )
}