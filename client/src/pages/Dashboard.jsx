import { useState, useEffect } from "react"
import Navbar from "../components/Navbar"
import { useAuth } from "../context/AuthContext"

export default function Dashboard() {
    const [url, setUrl] = useState("")
    const [price, setPrice] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(false)

    const { token } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!url || !price) {
            setError("Fields cannot be empty")
            setSuccess("")
            return
        }

        setLoading(true)
        try {
            const response = await fetch("http://localhost:3000/api/me/watches", {
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
                setError(data.error)
                setSuccess("")
                setLoading(false)
                return
            }

            setSuccess("Item successfully tracked")
            setError("")
            setUrl("")
            setPrice("")
            setLoading(false)
        } catch (error) {
            setError("Server error")
            setLoading(false)
            console.error(error)
        }
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <div className="flex flex-1 flex-col justify-center items-center">
                <h1 className="font-semibold mb-5 text-2xl text-slate-900">Enter a new product</h1>
                <div>
                    <form action="" className="flex gap-3" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="url"
                            id="url"
                            placeholder="Enter url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="px-3 py-1 rounded-xl border-transparent focus:ring focus:ring-sky-500 focus:ring-opacity-50 focus:ring-2 shadow-lg outline outline-black/5"
                        />
                        <input
                            type="number"
                            name="price"
                            id="price"
                            placeholder="Enter price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="px-3 py-1 rounded-xl border-transparent focus:ring focus:ring-sky-500 focus:ring-opacity-50 focus:ring-2 shadow-lg outline outline-black/5"
                        />
                        <button
                            className="text-white bg-sky-500 hover:bg-sky-700 py-1 px-3 rounded-xl cursor-pointer"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Adding..." : "Add Product"}
                        </button>
                    </form>
                    <div className="w-fit mx-auto">
                        {success && <p className="text-green-500">{success}</p>}
                        {error && <p className="text-red-500">{error}</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}