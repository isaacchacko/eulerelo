import { useEffect } from "react";
import { useTimer } from "@/hooks/useTimer";

interface TimerProps {
    onTimerFinish?: () => void 
}

export const Timer : React.FC<TimerProps> = ({onTimerFinish}) => {
    const {formattedTime, isFinished} = useTimer(3)

    useEffect(() => {
        if (isFinished && onTimerFinish){
            onTimerFinish()
        }
    }, [isFinished, onTimerFinish])

    return(
        <div>
            <h1> {formattedTime} </h1>
        </div>
    )
}