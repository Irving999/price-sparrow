import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import Swiper from "../components/ImageCarousel"
import PriceChart from "../components/PriceChart"

export default function Product() {
    const [watch, setWatch] = useState(null)
    const [error, setError] = useState("")
    const { watchId } = useParams()
    const token = localStorage.getItem("token")

    useEffect(() => {
        (async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/me/watches/${watchId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                })
                const data = await response.json()
                console.log(data)
                if (!response.ok) {
                    setError(data.message)
                    return
                }
                setWatch(data)
            } catch (error) {
                console.error("Server error: ", error)
                setError("Server error")
            }
        })()
    }, [])

    const lastCheckedAt = watch ? new Date(watch.product.lastCheckedAt) : null

    return (
        <>
            <Navbar />
            {error && <p className="text-red-500">{error}</p>}
            {
                watch && (
                    <div className="mx-24 my-8">
                        <Swiper title={watch.product.title} images={watch.productImages}/>
                        <p className="block w-fit ml-auto hover:underline hover:underline-offset">
                            <a href={watch.product.url} target="_blank" rel="noopener noreferrer">
                                View product
                            </a>
                        </p>
                        <h1 className="font-semibold mt-4 text-2xl text-slate-900">{watch.product.title}</h1>
                        <div className="pl-4">
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
                                    <p>
                                        You're waiting for the product to drop to
                                        <strong> ${watch.targetPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })} </strong>
                                        or less
                                    </p>
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
                            <div>
                                <PriceChart priceData={watch.productHistory} />
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    )
}