import { useEffect, useState } from "react";
import { useTimer } from "@/hooks/useTimer";
import { time } from "console";

interface TimerProps {
    onTimerFinish?: () => void 
}

export const Timer : React.FC<TimerProps> = ({onTimerFinish}) => {
    const {formattedTime, isFinished, timeLeft} = useTimer(3)
    const [isRed, setIsRed] = useState(false)
    //setTimeout (() => setIsRed(true), 10)
    useEffect(() => {
        if (timeLeft <= 1.1){
            setTimeout(() => setIsRed(!isRed), 200 )
        }
    }, [isRed, setIsRed, timeLeft])
    useEffect(() => {
        if (isFinished && onTimerFinish){
            onTimerFinish()
        }
    }, [isFinished, onTimerFinish])

    return(
        <div className = "">
            <h1 className = {`${(isRed ) ? "text-red-600" : ""} transition-none text-4xl mt-8`} > {formattedTime} {isRed}</h1>
        </div>
    )
}