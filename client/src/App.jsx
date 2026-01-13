import { useState } from "react"

function App() {
  const [count, setCount] = useState(0)
  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-3xl font-bold underline">Hello</h1>
      <h2 className="">Count {count}</h2>
      <button className="rounded-xl p-2 bg-sky-500  text-white hover:bg-sky-700 shadow-lg outline outline-black/5 cursor-pointer" 
        onClick={() => setCount(prev => prev + 1)}>
          Click me
      </button>
    </div>
  )
}

export default App
