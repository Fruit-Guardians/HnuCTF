import { Loader2 } from "lucide-react";

export default function LoadingModule() {

    // const [count, setCount] = useState(0)

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         setCount((count + 1) % 4)
    //     }, 500)
    //     return () => clearInterval(interval)
    // }, [count])

    return (
        <div className="flex items-center justify-center h-full gap-2 select-none">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="font-bold text-lg">Loading</span>
        </div>
    )
}