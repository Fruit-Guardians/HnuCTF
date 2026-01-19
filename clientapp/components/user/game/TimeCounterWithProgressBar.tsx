import dayjs from "dayjs";
import { ClockFading } from "lucide-react";
import { useEffect, useState } from "react";

export default function TimeCounterWithProgressBar(
    { 
        target_time,
        start_time,
        onFinishCallback,
        prefix 
    } : { 
        start_time: dayjs.Dayjs | number | string, 
        target_time: dayjs.Dayjs | number | string | null,
        onFinishCallback?: () => void,
        prefix?: string
    }
) {

    const [timeLeft, setTimeLeft] = useState("0s");
    const [leftPrecent, setLeftPrecent] = useState(0)

    const formatDuration = (duration: number) => {
        duration = Math.floor(duration)
    
        const days = Math.floor(duration / (24 * 3600));
        const hours = Math.floor((duration % (24 * 3600)) / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = duration % 60;
    
        if (days > 0) {
            return `${String(days).padStart(2, '0')}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
        } else if (hours > 0) {
            return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
        } else if (minutes > 0) {
            return `${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
        } else {
            return `${String(seconds).padStart(2, '0')}s`;
        }
    }

    useEffect(() => {
        const updateFunction = () => {
            const totalTime = Math.floor(dayjs(target_time).diff(start_time) / 1000)

            const leftTime = Math.floor(dayjs(target_time).diff(dayjs()) / 1000)
            if (leftTime < 0) {
                if (onFinishCallback) onFinishCallback()
                clearInterval(interval)
            }
            setTimeLeft(formatDuration(leftTime))
            setLeftPrecent(Math.floor(leftTime / totalTime * 100))
        }
        const interval = setInterval(updateFunction, 500)
        
        updateFunction()

        return () => {
            if (interval) clearInterval(interval);
        }
    }, [target_time])


    return (
        <div className="bg-background rounded-full border-foreground border-1 overflow-hidden">
            <div className="bg-black/10 px-2 pt-1 pb-1 rounded-2xl select-none dark:bg-[#2A2A2A] hidden lg:flex relative transition-colors duration-300">
                <div className="absolute top-0 left-0 bg-black dark:bg-white transition-colors duration-300"
                    style={{ width: `${leftPrecent}%`, height: '100%' }}
                />
                <div className="flex gap-2 items-center">
                    <ClockFading className="text-white mix-blend-difference w-[22px] h-[22px]" />
                    <span className="text-white text-md mix-blend-difference transition-all duration-500">{ prefix ? prefix + timeLeft : timeLeft }</span>
                </div>
            </div>
        </div>
    )
}