import { useState, useEffect } from "react"

export default function AnimatedBackground({ fromStart = true, animated = true, children }) {
    const [mounted, setMounted] = useState({
        s1: !fromStart,
        s2: !fromStart,
        s3: !fromStart
    })

    useEffect(() => {
        if (!animated) return

        let t1, t2
        requestAnimationFrame(() => {
            if (fromStart) {
                setMounted({ s1: true, s2: false, s3: false })
                t1 = setTimeout(() => setMounted(s => ({ ...s, s3: true })), 300)
                t2 = setTimeout(() => setMounted(s => ({ ...s, s2: true })), 700)
            } else {
                setMounted({ s1: true, s2: false, s3: true })
                t1 = setTimeout(() => setMounted(s => ({ ...s, s1: false })), 300)
                t2 = setTimeout(() => setMounted(s => ({ ...s, s3: false })), 700)
            }
        })

        return () => {
            clearTimeout(t1)
            clearTimeout(t2)
        }
    }, [fromStart, animated])

    return (
        <div className="background">
            {animated && (
                <>
                    <div className={`square square1 ${mounted.s1 && "mounted"}`}></div>
                    <div className={`square square2 ${mounted.s2 && "mounted"}`}></div>
                    <div className={`square square3 ${mounted.s3 && "mounted"}`}></div>
                </>
            )}
            {children}
        </div>
    )
}