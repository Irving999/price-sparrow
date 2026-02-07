import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"

export default function SignupModal() {
    const [formInput, setFormInput] = useState({ email: "", password: "" })
    const [error, setError] = useState("")
    const { login, showSignupModal, closeSignupModal } = useAuth()

    useEffect(() => {
        if (!showSignupModal) {
            setFormInput({ email: "", password: "" })
            setError("")
        }
    }, [showSignupModal])

    useEffect(() => {
        if (showSignupModal) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }
        return () => { document.body.style.overflow = "unset" }
    }, [showSignupModal])

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") closeSignupModal()
        }
        if (showSignupModal) {
            document.addEventListener("keydown", handleKeyDown)
        }
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [showSignupModal])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormInput(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formInput)
            })

            const data = await res.json()
            if (res.ok) {
                closeSignupModal()
                login(data.token, data.user)
            } else {
                setError(data.error)
            }
        } catch (error) {
            setError("Network error")
        }
    }

    if (!showSignupModal) return null

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
            onClick={closeSignupModal}
        >
            <div
                className="relative flex flex-col items-center bg-white rounded-xl p-10 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={closeSignupModal}
                    className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h1 className="font-semibold mb-5 text-2xl text-slate-900">Sign Up</h1>
                {error && <p className="text-red-500">{error}</p>}
                <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
                    <label htmlFor="signup-email" className="flex flex-col gap-2">
                        Email
                        <input
                            type="text"
                            name="email"
                            id="signup-email"
                            value={formInput.email}
                            onChange={handleChange}
                            className="px-3 py-1 rounded-xl border-transparent focus:ring focus:ring-sky-500 focus:ring-opacity-50 focus:ring-2 shadow-lg outline outline-black/5"
                        />
                    </label>
                    <label htmlFor="signup-password" className="flex flex-col gap-2">
                        Password
                        <input
                            type="password"
                            name="password"
                            id="signup-password"
                            value={formInput.password}
                            onChange={handleChange}
                            className="px-3 py-1 rounded-xl border-transparent focus:ring focus:ring-sky-500 focus:ring-opacity-50 focus:ring-2 shadow-lg outline outline-black/5"
                        />
                    </label>
                    <button className="text-white bg-black hover:bg-sky-700 py-1 px-3 rounded-xl cursor-pointer">
                        Submit
                    </button>
                </form>
            </div>
        </div>
    )
}
