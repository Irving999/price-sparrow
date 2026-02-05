import { useEffect, useState } from "react";

export default function StoreMarquee() {
    const [stores, setStores] = useState([])

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/stores`)
            .then((res) => res.json())
            .then((data) => setStores(data))
            .catch((err) => console.error(err))
    }, [])

    if (stores.length === 0) return null

    return (
        <div className="mb-12 w-screen overflow-hidden">
            <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-[0.2em] mb-8">
                Supported Retailers
            </p>

            <div className="relative w-full overflow-hidden before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-20 before:bg-gradient-to-r before:before:from-white/80 before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-20 after:bg-gradient-to-l after:after:from-white/80 after:to-transparent">
                <div className="animate-marquee-infinite">
                {[...stores, ...stores, ...stores, ...stores].map((store, index) => (
                    <div
                        key={index}
                        className="flex items-center px-10 hover:opacity-100 hover:grayscale-0 transition-all duration-300"
                    >
                        <img 
                            src={`/icons/${store.id}.svg`} 
                            alt={store.id}
                            className="w-10 h-10 rounded-md mr-3"
                        />
                    </div>
                ))}
                </div>
            </div>
        </div>
    )
}