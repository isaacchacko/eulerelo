'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import mathPhoto from '@/assets/mathProb.png';
import { evaluate, parse } from "mathjs";

const upper = 5;
const lower = 1;
const answerFormula = "log(x)-log(y)";


type MessageType = 'chat' | 'buzz' | 'buzzCorrect';

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
    const scope = {x,y};
    const parsedFormula = parse(answerFormula);
    const correct = parsedFormula.evaluate({x,y}) as number;
    let fixedForLog = "";
    //check for ln and log
    if (userAnswer.includes("log")){
      fixedForLog = userAnswer.replaceAll(")", ",10)")
    } else{
      fixedForLog = userAnswer
    }
    
    const fixedAns = fixedForLog.replaceAll("ln", "log");
    //try to evaluate it as a number
    let userAns = parse(fixedAns).evaluate(scope);
    console.log( `user answered: ${userAns}`); 
    

    //means it is neither an accepted number or formula
    if (isNaN(userAns)) return false;
    
    //return whether the answer is within tolerance
    console.log(Math.abs(userAns - correct) <= tolerance)
    return Math.abs(userAns - correct) <= tolerance;
  } catch (error) {
    console.error ("validation error: ", error);
    return false;
  }
}

export default function RoomPage() {

  const { data: session } = useSession();

  const params = useParams();
  const roomId = params.roomId as string;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
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

      socketRef.current.emit('joinRoom', roomId);

      socketRef.current.on('chat', (chat_message: string, username: string) => {
        const new_message: ChatMessage = {text: `${username}: ${chat_message}`, type: 'chat'};
        setMessages(prev => [...prev, new_message]);
      });

      socketRef.current.on('buzz', (buzz_message: string, username: string) => {
        const new_message: ChatMessage = {text: `${username} answered: ${buzz_message}`, type: 'buzz'};
        setMessages(prev => [...prev, new_message]);
      });

      socketRef.current.on('buzzCorrect', (buzz_message: string, username: string) => {
        const new_message: ChatMessage = {text: `${username} answered: ${buzz_message}`, type: 'buzzCorrect'};
        setMessages(prev => [...prev, new_message]);
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [roomId]);

  const sendChat = () => {
    if (chatInput.trim() && socketRef.current) {
      socketRef.current.emit('chat', {
        roomId,
        text: chatInput,
        username: session.user?.name,
      });
    }

    setChatInput('');
  };

  //handles sending the buzzes
  const sendBuzz = () => {
    //validate answer
    const validity = checkAnswer(answerInput, answerFormula, upper, lower, 0.001)
    setCheck(validity);

    if (validity) {
      //if its correct we want the type to be buzzCorrect
      if (answerInput.trim() && socketRef.current) {
        socketRef.current.emit('buzzCorrect', {
          roomId,
          answer: answerInput,
          username: session.user?.name
        });
        
      }
    } else {
      // otherwise we want it to just be a buzz
      if (answerInput.trim() && socketRef.current) {
        socketRef.current.emit('buzz', {
          roomId,
          answer: answerInput,
          username: session.user?.name
        });
      }
         
    }

    setAnswerInput('');
    setIsBuzzCooldown(true);
    //the buzz timer so we can only send buzzes every 3 seconds max
    setTimeout(() => {
      setIsBuzzCooldown(false);
    }, 3000);
    
  };

  return (
    <div className=" mx-auto p-4"> 
      <h2 className="text-xl text-center mb-2">Room: {roomId}</h2>
      {/* put everything in a big div */}
      <div className="flex"> 
        <div className="m-3 w-full">
          <img src={mathPhoto.src} alt = "MATHs" className = "w-full"/>
        </div>
        
        <div className = "flex flex-col w-full m-3">
          <div className="border flex-grow rounded p-2 h-64 overflow-y-auto mb-2   bg-gray-100">
            {messages.map((msg, idx) => (
              msg.type == 'buzz' ? 
                <div key={idx} className="mb-1 text-red-500">{msg.text}</div>
                :
                msg.type == "buzzCorrect" ?
                  <div key={idx} className="mb-1 text-green-600"   >{msg.text}</div>
                  :
                  <div key={idx} className="mb-1">{msg.text}</div>

            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 border rounded p-2"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChat()}
              placeholder="Type a message..."
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={sendChat}
            >
              Send
            </button>
          </div>
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
