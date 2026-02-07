import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"

export default function LoginModal() {
    const [formInput, setFormInput] = useState({ email: "", password: "" })
    const [message, setMessage] = useState({ success: "", error: "" })
    const { login, showLoginModal, closeLoginModal } = useAuth()

    useEffect(() => {
        if (!showLoginModal) {
            setFormInput({ email: "", password: "" })
            setMessage({ success: "", error: "" })
        }
    }, [showLoginModal])

    useEffect(() => {
        if (showLoginModal) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }
        return () => { document.body.style.overflow = "unset" }
    }, [showLoginModal])

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") closeLoginModal()
        }
        if (showLoginModal) {
            document.addEventListener("keydown", handleKeyDown)
        }
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [showLoginModal])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormInput(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMessage({ error: "", success: "" })

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formInput)
            })

            const data = await res.json()
            if (res.ok) {
                setMessage({ success: data.message, error: "" })
                closeLoginModal()
                login(data.token, data.user)
            } else {
                setMessage({ error: data.error || "Login failed", success: "" })
            }
        } catch (error) {
            setMessage({ error: "Network error", success: "" })
        }
    }

    if (!showLoginModal) return null

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
            onClick={closeLoginModal}
        >
            <div
                className="relative flex flex-col items-center bg-white rounded-xl p-10 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={closeLoginModal}
                    className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h1 className="font-semibold mb-5 text-2xl text-slate-900">Log in</h1>
                {message.error && <p className="text-red-500">{message.error}</p>}
                {message.success && <p className="text-green-500">{message.success}</p>}
                <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
                    <label htmlFor="modal-email" className="flex flex-col gap-2">
                        Email
                        <input
                            type="text"
                            name="email"
                            id="modal-email"
                            value={formInput.email}
                            onChange={handleChange}
                            className="px-3 py-1 rounded-xl border-transparent focus:ring focus:ring-sky-500 focus:ring-opacity-50 focus:ring-2 shadow-lg outline outline-black/5"
                        />
                    </label>
                    <label htmlFor="modal-password" className="flex flex-col gap-2">
                        Password
                        <input
                            type="password"
                            name="password"
                            id="modal-password"
                            value={formInput.password}
                            onChange={handleChange}
                            className="px-3 py-1 rounded-xl border-transparent focus:ring focus:ring-sky-500 focus:ring-opacity-50 focus:ring-2 shadow-lg outline outline-black/5"
                        />
                    </label>
                    <button className="text-white bg-sky-500 hover:bg-sky-700 py-1 px-3 rounded-xl cursor-pointer">
                        Submit
                    </button>
                </form>
            </div>
        </div>
    )
}
