import dayjs from "dayjs";
import { useEffect, useState } from "react";

const TimerDisplay = (
    { targetTime: target_time, className, onFinishCallback } : { targetTime: dayjs.Dayjs | number | string | null, className: string, onFinishCallback: () => void }
) => {
    const [timeLeft, setTimeLeft] = useState("0s");

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
            const leftTime = Math.floor(dayjs(target_time).diff(dayjs()) / 1000)
            if (leftTime < 0) {
                onFinishCallback()
                clearInterval(interval)
            }
            setTimeLeft(formatDuration(leftTime))
        }
        const interval = setInterval(updateFunction, 500)
        
        updateFunction()

        return () => {
            if (interval) clearInterval(interval);
        }
    }, [target_time])

    return (
        <>
            <span className={className}>{timeLeft}</span>
        </>
    )
}

export default TimerDisplay