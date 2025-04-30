'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import mathPhoto from '../../assets/mathProb.png';
import { evaluate, parse } from "mathjs";

const upper = 5;
const lower = 1;
const answerFormula = "log(x)-log(y)";

type MessageType = 'chat' | 'buzz';


interface ChatMessage {
  text: string;
  type: MessageType;
}

function checkAnswer(
  userAnswer: string,
  answerFormula: string, 
  x: number,
  y: number, 
  tolerance: 0.001
): boolean {
  try{
    const parsedFormula = parse(answerFormula);
    const correct = parsedFormula.evaluate({x,y}) as number;
    const userAns = parseFloat(userAnswer);
    if (isNaN(userAns)) return false;
    return Math.abs(userAns - correct) <= tolerance;
  } catch (error) {
    console.error ("validation error: ", error);
    return false;
  }
}

export default function practicePage(){

  const { data: session } = useSession();

  const params = useParams();
  const roomId = params.roomId as string;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [answerInput, setAnswerInput] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const [check, setCheck] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isBuzzCooldown, setIsBuzzCooldown] = useState(false);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
     socketRef.current = io('http://localhost:3001');

     return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [roomId]);


  //handles sending the buzzes
  const sendBuzz = () => {
    if (answerInput.trim() && socketRef.current) {
      socketRef.current.emit('buzz', {
        roomId,
        answer: answerInput,
        username: session.user?.name
      });
      const newMessage: ChatMessage ={text: `you answered: ${answerInput}`, type: 'buzz'};
      setMessages(prev => [...prev, newMessage]); 
      
      //validate answer
      const validity = checkAnswer(answerInput, answerFormula, upper, lower, 0.001)
      setCheck(validity);
     
      if (validity) {
        console.log ("YEEEEESSSSS")
      } else {
        console.log("NOOOOOO")
      }


      setAnswerInput('');
      setIsBuzzCooldown(true);
      //the buzz timer so we can only send buzzes every second max
      setTimeout(() => {
        setIsBuzzCooldown(false);
      }, 1000);
    }
  };
  return (
    <div className="max-w-full mx-auto p-4"> 
      <h2 className="text-xl text-center mb-2">Room: {"Practice Room"}</h2>
      {/* put everything in a big div */}
      <div className="flex"> 
        <div className=" m-2 w-full">
          {/* THIS IS WHERE THE IMAGE FOR THE PROBLEM IS */}
          <img className = "w-3/4 mx-auto" src={mathPhoto.src} alt = "MATHs" />
        </div>
        
        <div className="border rounded p-2 overflow-y-auto m-2 w-1/2 bg-gray-100">
          {messages.map((msg, idx) => (
            msg.type == 'buzz' ? 
              <div key={idx} className="mb-1 text-green-500">{msg.text}</div>
              :
              <div key={idx} className="mb-1">{msg.text}</div>

          ))}
          <div ref={messagesEndRef} />
          
          
          
        </div>
      </div>
      <div>
        <div className="flex gap-2 mt-2">
          <input
            className="flex-1 border rounded p-2"
            value={answerInput}
            onChange={e => setAnswerInput(e.target.value)}
            onKeyDown={!isBuzzCooldown ? e => e.key === 'Enter' && sendBuzz() : () => {}}
            placeholder="Type an answer..."
          />
          <button
            //the button should gray out when disabled
            className={`px-4 py-2 rounded ${isBuzzCooldown
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white'
                }`}
            onClick={sendBuzz}
            disabled={isBuzzCooldown}
          >
            {isBuzzCooldown ? 'Wait...' : 'Buzz'}
          </button>
        </div>
      </div>
    </div>
  );
}