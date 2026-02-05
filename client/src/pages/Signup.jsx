import { useState } from "react"
import { useAuth } from "../context/AuthContext"

export default function SignUp() {
    const [formInput, setFormInput] = useState({ email: "", password: "" })
    const [error, setError] = useState("")
    const { login } = useAuth()

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormInput(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        try {
            const res = await fetch("http://localhost:3000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formInput)
            })

            const data = await res.json()
            if (res.ok) {
                login(data.token, data.user)
            } else {
                setError(data.error)
            }
        } catch (error) {
            setError({ error: "Network error", success: "" })
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-200">
            <div className="flex flex-col items-center bg-white rounded-xl p-10">
                <h1 className="font-semibold mb-5 text-2xl text-slate-900">Sign Up</h1>
                {error && <p className="text-red-500">{error}</p>}
                <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
                    <label htmlFor="email" className="flex flex-col gap-2">
                        Email
                        <input
                            type="text"
                            name="email"
                            id="email"
                            onChange={handleChange}
                            className="px-3 py-1 rounded-xl border-transparent focus:ring focus:ring-sky-500 focus:ring-opacity-50 focus:ring-2 shadow-lg outline outline-black/5"
                        />
                    </label>
                    <label htmlFor="password" className="flex flex-col gap-2">
                        Password
                        <input
                            type="password"
                            name="password"
                            id="password"
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