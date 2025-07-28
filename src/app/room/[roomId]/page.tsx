'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { evaluate, parse } from "mathjs";
import BlurText from './BlurText';
import Link from "next/link";
import { motion, AnimatePresence } from 'framer-motion'
import { User, Competitor } from '@/socket-server/types';

// latex
import { BlockMath } from 'react-katex';

const BUZZ_COOLDOWN = 3000;

const upper = 5;
const lower = 1;
const answerFormula = "log(x)-log(y)";

const SYMBOLS = {
  won: { symbol: '✓', className: 'text-green-500' },
  lost: { symbol: '✗', className: 'text-red-500' },
  undecided: { symbol: '–', className: 'text-gray-400' },
};

const RoundResults = ({ results }) => (
  <div className="flex gap-2 justify-center">
    {results.slice(0, 5).map((result, idx) => {
      const { symbol, className } = SYMBOLS[result] || SYMBOLS.undecided;
      return (
        <span
          key={idx}
          className={`text-2xl font-bold ${className}`}
          aria-label={result}
        >
          {symbol}
        </span>
      );
    })}
  </div>
);
// const results = ['won', 'lost', 'undecided', 'won', 'lost'];
// <RoundResults results={results} />

const defaultUser: Competitor = {
  id: "",
  name: "Unknown",
  active: false,
  score: 0,
  email: "unknown@unknown.com",
  elo: 0
};

type MessageType = 'chat' | 'buzz' | 'buzzCorrect' | 'system';

interface ChatMessage {
  role: string;
  username: string;
  text: string;
  type: MessageType;
}


function checkAnswer(
  answer: string,
  answerFormula: string,
  x: number,
  y: number,
  tolerance: 0.001
): boolean {
  try {
    const scope = { x, y };
    const parsedFormula = parse(answerFormula);
    const correct = parsedFormula.evaluate({ x, y }) as number;

    // check for ln and log
    if (answer.includes("log")) {
      // such a budget fix but its fine
      answer = answer.replaceAll(")", ",10)");
    }

    answer = answer.replaceAll("ln", "log");

    try {
      answer = parse(answer).evaluate(scope);
    } catch (error) { // to catch errors when evaluating non-math
      console.log('Caught undefined symbol error:', error);
      return false; // since answer was non-math
    }

    console.log(`user answered: ${answer}`);

    // convert to number to match the remaining usage of answer variable
    const numeric_answer = Number(answer);

    // means it is neither an accepted number or formula
    // apparently js isNaN tries to typecast anything to number while
    // tsx expects only numbers
    if (isNaN(numeric_answer)) return false;

    // return whether the numeric_answer is within tolerance
    console.log(Math.abs(numeric_answer - correct) <= tolerance)
    return Math.abs(numeric_answer - correct) <= tolerance;
  } catch (error) {
    console.error("validation error: ", error);
    return false;
  }
}

const words = ["velvet", "mango", "sunrise", "crimson", "forest", "echo", "silver", "breeze", "shadow", "amber", "river", "whisper", "cosmic", "pearl", "ember", "lunar", "sage", "harbor"];

const getRandomThreeWordString = () =>
  Array.from({ length: 3 }, () => words[Math.floor(Math.random() * words.length)]).join('-');

export default function RoomPage() {

  const { data: session, status } = useSession();
  const params = useParams();
  const roomId = params.roomId as string;
  const displayName = (session && session.user) ? session.user.name as string : getRandomThreeWordString();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [answerInput, setAnswerInput] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const [check, setCheck] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isBuzzCooldown, setIsBuzzCooldown] = useState(false);
  const [redPlayer, setRedPlayer] = useState<Competitor>(defaultUser);
  const [bluePlayer, setBluePlayer] = useState<Competitor>(defaultUser);
  const [role, setRole] = useState("Unknown");
  const [buzzInputText, setBuzzInputText] = useState('Enter your answer...');
  const [roundNumber, setRoundNumber] = useState<Number | null>(null);
  const [playscreen, setPlayScreen] = useState(true);
  const [stage, setStage] = useState("center"); // can be center, top or done

  useEffect(() => {
    if (status === "loading" || typeof window === "undefined") return;

    const displayName = session?.user?.name || getRandomThreeWordString();

    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL);
    socketRef.current.emit("joinRoom", roomId, session?.user || undefined);

    socketRef.current.on('message', (type: string, text: string, username: string, role: string) => {
      setMessages(prev => [...prev, { type: type, text: text, username: username, role: role } as ChatMessage]);
    });

    socketRef.current.on('updateRoomInfo', (data) => {
      if (!socketRef.current) return;
      const competitors = data.competitors;
      const role = data.role;
      const roundNumber = data.roundNumber;

      if (role) {
        setRole(role);
        console.log("updateRoomInfo detected, i am now a " + role);
      }

      if (competitors) {
        const competitorList: Competitor[] = Object.values(competitors); // TODO: convert Competitors to two competitors
        setBluePlayer(competitorList[0]);
        setRedPlayer(competitorList[1]);
        console.log("updateRoomInfo: competitors changed: ", competitors);
      }

      if (roundNumber) {
        setRoundNumber(roundNumber)
        console.log("updateRoomInfo: roundNumber changed: ", roundNumber);
      }
    });

    const disconnect = () => {
      if (!socketRef.current || !socketRef.current.connected) return;
      socketRef.current.emit('leaveRoom', roomId);
      socketRef.current.disconnect();
    }

    window.addEventListener('beforeunload', disconnect);

    return () => {
      window.removeEventListener('beforeunload', disconnect);
      socketRef.current?.emit('leaveRoom', roomId, displayName);
      socketRef.current?.disconnect();
    };
  }, [status, session]);

  useEffect(() => {
    if (messages.length < 3) return;  // fixes bug where screen scrolls at page load lmfaooo
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (buzzInputText !== "Enter your answer..." && !isBuzzCooldown) {
      setBuzzInputText("Enter your answer...")
    }
  }, [isBuzzCooldown, buzzInputText]);

  const sendChat = () => {
    if (chatInput.trim() && socketRef.current) {
      socketRef.current.emit('message', {
        roomId: roomId,
        type: 'chat',
        text: chatInput,
        username: displayName,
        role: role
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
        socketRef.current.emit('message', {
          roomId: roomId,
          type: 'buzzCorrect',
          text: answerInput,
          username: displayName,
          role: role
        });

      }
    } else {
      // otherwise we want it to just be a buzz
      setBuzzInputText("Incorrect. Try again!");
      if (answerInput.trim() && socketRef.current) {
        socketRef.current.emit('message', {
          roomId: roomId,
          type: 'buzz',
          text: answerInput,
          username: displayName,
          role: role
        });
      }

    }

    setAnswerInput('');
    setIsBuzzCooldown(true);
    //the buzz timer so we can only send buzzes every 3 seconds max
    setTimeout(() => {
      setIsBuzzCooldown(false);
    }, BUZZ_COOLDOWN);

  };

  // we want to know if we are blue player
  const isBlue = displayName === bluePlayer.name


  const handleAnimationComplete = () => {
    console.log('Animation completed!');
    setTimeout(() => setStage("top"), 500);
  };

  const handleMoveToTopComplete = () => {
    setTimeout(() => setStage("done"), 300)
  }

  // this is the screen before any questions; introduces opponent and elo, along with times
  if (!playscreen) {
    return (
      <>
        <div >
          <motion.div
            layout
            initial={{
              top: '30%',
              left: '10%',
              x: '10%',
              y: '-50%',
              position: 'absolute',
              width: '70%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              scale: 2.7,
            }}
            animate={
              stage != 'center'
                ? {
                  top: '9%',
                  left: '10%',
                  x: '10%',
                  y: 0,
                  scale: 1,
                  position: 'absolute',
                  width: '70%',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                }
                : {}
            }
            transition={{
              type: 'spring',
              stiffness: 80,
              damping: 18,
              scale: { duration: 0.6 }
            }}
            onAnimationComplete={() => {
              if (stage === 'top') handleMoveToTopComplete();
            }}
            style={{
              zIndex: 2,
            }}
          >

            <BlurText
              text="TIME TO DUEL!"
              delay={1000}
              animateBy="words"
              direction="top"
              onAnimationComplete={handleAnimationComplete}
              className="text-4xl justify-center mt-4"
            />
          </motion.div>


          <AnimatePresence>
            {stage === 'done' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  marginTop: '120px',

                }}
              >
                <h1 className="text-2xl"> your opponent is {isBlue ? redPlayer.name : bluePlayer.name}</h1>

              </motion.div>

            )}

          </AnimatePresence>
        </div>
      </>
    );
  }

  // actual question
  else {
    return (
      <div className='flex justify-center'>
        <div className=" mx-auto sm:p-4 w-[80%]">
          <div className='flex flex-row justify-center mb-2 text-xl'>
            <div className='py-3'>
              <div className='flex flex-col gap-3 justify-center'>
                <span className='text-2xl font-black text-center block sm:hidden'>Round 1/5</span>
                <div className='grid grid-cols-4 gap-3'>

                  <div className="col-span-3 overflow-hidden bg-gray-300 dark:bg-black py-3 px-3 border-rounded rounded-lg flex flex-row gap-2 sm:scale-90 sm:hover:scale-100 transition-transform duration-300 items-center">
                    <img className="w-5" src="/globe.svg" alt="Dummy icon for user 2" />
                    <Link
                      href={"/profile/" + bluePlayer.name}
                      className='hover:text-blue-500 hover:underline'
                      title={bluePlayer.name}
                    >
                      {bluePlayer.name}
                    </Link>
                    <div className={`w-3 h-3 rounded-full  ${bluePlayer.active ? "bg-green-500 animate-pulse" : "bg-gray-500"}`} title={`"${bluePlayer.name}" is ${bluePlayer.active ? 'online' : 'offline'}`} />
                  </div>
                  <span className='self-center text-2xl font-black text-center block sm:hidden'>0</span>

                  <div className="col-span-3 overflow-hidden bg-gray-300 dark:bg-black py-3 px-3 border-rounded rounded-lg flex flex-row gap-2 sm:scale-90 sm:hover:scale-100 transition-transform duration-300 items-center">
                    <img className="w-5" src="/globe.svg" alt="Dummy icon for user 1" />
                    <Link
                      href={"/profile/" + redPlayer.name}
                      className='hover:text-blue-500 hover:underline'
                      title={redPlayer.name}
                    >
                      {redPlayer.name}
                    </Link>
                    <div className={`w-3 h-3 rounded-full  ${redPlayer.active ? "bg-green-500 animate-pulse" : "bg-gray-500"}`} title={`"${redPlayer.name}" is ${redPlayer.active ? 'online' : 'offline'}`} />
                  </div>
                  <span className='self-center text-2xl font-black text-center block sm:hidden'>0</span>
                </div>
              </div>
              <h3 className="hidden sm:block text-center">vs</h3>

            </div>

          </div>
          {/* put everything in a big div */}
          <div className="flex flex-col sm:flex-row">
            <div className="w-full flex flex-col justify-center text-4xl">
              <BlockMath math={"E=mc^2"} />
            </div>


            <div className="flex gap-2 my-2">
              <input
                className="flex-1 border rounded p-2 dark:bg-slate-700 min-w-0"
                value={answerInput}
                onChange={e => setAnswerInput(e.target.value)}
                onKeyDown={!isBuzzCooldown ? e => e.key === 'Enter' && sendBuzz() : () => { }}
                placeholder={buzzInputText}
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
                {isBuzzCooldown ? "Wait..." : 'Buzz'}
              </button>
            </div>

            <div className='w-full bg-black dark:bg-white h-1 my-10 block sm:hidden' />
            <div className="flex flex-col w-full" >
              <div className="border flex-grow rounded p-2 h-32 sm:h-64 overflow-y-auto mb-2 dark:bg-slate-700">
                {messages.map((msg, idx) => (
                  msg.type === 'buzz' ?
                    <div key={idx} className="mb-1 text-red-500">({msg.role}) {msg.username} : {msg.text}</div>
                    :
                    msg.type === "buzzCorrect" ?
                      <div key={idx} className="mb-1 text-green-600">({msg.role}) {msg.username} : {msg.text}</div>
                      :
                      msg.type === "system" ?
                        <div key={idx} className="mb-1 italic text-gray-500">{msg.text}</div>
                        :
                        <div key={idx} className="mb-1">({msg.role}) {msg.username} : {msg.text}</div>


                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex gap-2 mb-10">
                <input
                  className="flex-1 border rounded p-2 dark:bg-slate-700 min-w-0"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                  placeholder="Send a chat..."
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
          </div>
        </div>
      </div>
    );
  }
}
