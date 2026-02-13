import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../context/AuthContext"

export default function SignupModal() {
    const [submitting, setSubmitting] = useState(false)
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
        setSubmitting(true)

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
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AnimatePresence>
            {showSignupModal && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
                    onClick={closeSignupModal}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.div
                        className="relative flex flex-col items-center bg-white rounded-xl p-10 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        <button
                            onClick={closeSignupModal}
                            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                            aria-label="Close"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <motion.h1
                            className="font-semibold mb-5 text-2xl text-slate-900"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                        >
                            Sign Up
                        </motion.h1>
                        {error && (
                            <motion.p
                                className="text-red-500"
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {error}
                            </motion.p>
                        )}
                        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
                            <motion.label
                                htmlFor="signup-email"
                                className="flex flex-col gap-2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15, duration: 0.3 }}
                            >
                                Email
                                <input
                                    type="text"
                                    name="email"
                                    id="signup-email"
                                    value={formInput.email}
                                    onChange={handleChange}
                                    className="px-3 py-1 rounded-xl border-transparent focus:ring focus:ring-sky-500 focus:ring-opacity-50 focus:ring-2 shadow-lg outline outline-black/5"
                                />
                            </motion.label>
                            <motion.label
                                htmlFor="signup-password"
                                className="flex flex-col gap-2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2, duration: 0.3 }}
                            >
                                Password
                                <input
                                    type="password"
                                    name="password"
                                    id="signup-password"
                                    value={formInput.password}
                                    onChange={handleChange}
                                    className="px-3 py-1 rounded-xl border-transparent focus:ring focus:ring-sky-500 focus:ring-opacity-50 focus:ring-2 shadow-lg outline outline-black/5"
                                />
                            </motion.label>
                            <motion.button
                                className="w-full font-thin sm:w-auto text-white bg-[#252529] border-1 border-transparent hover:bg-transparent hover:border-1 hover:text-black hover:border-black py-2 sm:py-1 px-4 sm:px-3 rounded-xl cursor-pointer transition-colors duration-200 font-medium"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25, duration: 0.3 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {submitting ? (
                                    <div>
                                        <span className="dot-bounce"></span>
                                        <span className="dot-bounce"></span>
                                        <span className="dot-bounce"></span>
                                    </div>
                                ) : "Submit"}
                            </motion.button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
