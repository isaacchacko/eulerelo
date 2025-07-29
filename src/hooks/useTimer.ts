import { useState, useEffect, useCallback } from 'react'

export interface useTimerReturn {
    timeLeft : number
    formattedTime : string
    running : boolean
    isFinished : boolean
    start : () => void
    pause : () => void
    reset : () => void
}

export function useTimer(initialSeconds = 3):
useTimerReturn {
    const initialCentiseconds = initialSeconds * 100
    const [centisecondsLeft, setCentisecondsLeft] = useState(initialCentiseconds)
    const [running, setRunning] = useState(false)
    
    //run when component appears
    useEffect (() => {
        setRunning(true)
    }, [])

    useEffect(() => {
        if (!running || centisecondsLeft === 0) return // if timer is paused or finished, just return
        
        
        const timerID = setInterval (() => {
            setCentisecondsLeft(prev => {
                if (prev <= 1){
                    setRunning(false) //turn off timer
                    return 0
                } else {
                    return (prev - 1) //increment timer
                }
            })
        }, 10)

        return () => clearInterval(timerID) // delete timer

        

        


    }, [running, centisecondsLeft])

    const start = useCallback(() =>setRunning(true), [])
    const pause = useCallback(() =>setRunning(false), [])
    const reset = useCallback(() =>{
        setRunning(false)
        setCentisecondsLeft(initialCentiseconds)
    }, [initialCentiseconds]) //autoresets if smt changes the initial starting amount

    const timeLeft = centisecondsLeft/100
    const formattedTime = timeLeft.toFixed(2)
    
    return {
        timeLeft,
        formattedTime,
        running,
        isFinished: centisecondsLeft === 0,
        start,
        pause,
        reset
    }


} 
