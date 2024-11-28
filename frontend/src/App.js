import React, { useState, useEffect, useRef } from "react";
import { parseUnits, formatUnits } from 'quais';
import "./App.css";
import ScrollList from "./components/ScrollList";
import getRandomItems from "./helpers/getRandomItems";
import sendMoney from "./helpers/sendMoney";
import logo from "./images/logo.png";

const contractAddress = "0x004965c0500bd966E744dd5F4c2d38C7EbbFFC1f"; // Адреса розгорнутого контракту
const contractABI = [ 
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "BetPlaced",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "winner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "prize",
        "type": "uint256"
      }
    ],
    "name": "GameEnded",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "FIXED_ADDRESS",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "GAME_DURATION",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "bets",
    "outputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentBetAmount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "endGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBetCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lastBetTime",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lastWinner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "placeBet",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

function App() {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [betAmount, setBetAmount] = useState(1);
  const [bets, setBets] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [contract, setContract] = useState(null);
  const timerRef = useRef(null);
  const time = 60 * 1000; // 60 секунд

  useEffect(() => {
    const initContract = async () => {
      if (window.pelagus && window.pelagus.request) {
        try {
          // Підключення до Pelagus Wallet через BrowserProvider
          const provider = new quais.BrowserProvider(window.pelagus);
          const signer = provider.getSigner();

          // Підключення до контракту
          const contractInstance = new quais.Contract(contractAddress, contractABI, signer);
          setContract(contractInstance);

          // Отримання балансу гаманця
          const balance = await signer.getBalance();
          setBalance(formatUnits(balance, 18)); // Відображення балансу в форматі Quai

        } catch (error) {
          console.error("Помилка підключення до контракту:", error);
        }
      } else {
        alert("Pelagus Wallet не знайдено");
      }
    };

    initContract();
  }, []);
  const requestAccounts = async () => {
    if (!window.pelagus) {
      alert("Pelagus Wallet не знайдено");
      return;
    }
  
    try {
      const accounts = await window.pelagus.request({ method: "eth_requestAccounts" });
      setWallet(accounts[0]);
    } catch (error) {
      console.error("Помилка при отриманні акаунтів:", error);
    }
  };
  
  // Функція для розміщення ставки
  const placeBet = async () => {
    if (!contract) {
      alert('Контракт не підключено');
      return;
    }

    try {
      // Переводимо ставку в одиниці (Quai має 18 десяткових розрядів)
      const betAmountInUnits = parseUnits(betAmount.toString(), 18);
      const tx = await contract.placeBet({ value: betAmountInUnits });
      await tx.wait();
      console.log('Ставка успішно розміщена');
      // Оновлення ставок (можливо вам потрібно буде витягнути ставки з контракту)
      setBets([...bets, { wallet: '0xYourWalletAddress', amount: betAmount, time: Date.now() }]);
    } catch (error) {
      console.error('Помилка під час розміщення ставки:', error);
    }
  };

  // Функція для оновлення таймера
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      const timeRemaining = time - (Date.now() % time);
      setTimeLeft(timeRemaining);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [time]);

  // Форматування часу для відображення
  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
    return `${minutes}:${(seconds < 10 ? '0' : '') + seconds}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-blue-600 overflow-x-clip">

    <div className="App">
    <header className="w-full z-20 backdrop-blur-3xl header-container">
  <img src={logo} alt="logo" className="logo-img" />
  <div className="wallet-info">
    {balance !== null ? (
      <div className="balance-display">
        <span className="
      text-sm
      
      
      
      
      text-white
      
      
      
       font-silkscreen ">{balance !== null ? `${Number(balance).toFixed(2)} Quai` : "N/A Quai"} </span>
      </div>
    ) : null}
    <button className="connect-wallet-btn" onClick={requestAccounts}>
      {wallet ? shortenAddress(wallet) : "Connect Wallet"}
    </button>
  </div>
</header>

  
      <main className="flex-grow lg:container lg:pt-28">
        <div className="yeeti-container">
          <div className="yeeti"></div>
      
          <div className="yeeti-4"></div>
        </div>
  
        <div className="backdrop-div">
          <div className="flex flex-col md:flex-row justify-center items-start md:space-y-0 space-y-4 md:h-48 xl:h-auto">
            <div className="w-full md:pr-2 h-full">
              <div className="bg-newBlue-400 p-6 w-full h-full">
                <div className="flex flex-row justify-start">
                  <div className="flex flex-row justify-between w-full">
                    <div className="flex flex-row items-center">
                      <div className="flex">
                        <div className="blob green w-[18px] h-[18px] mr-[9px] bg-secondary"></div>
                      </div>
                      <div>
                        <p className="text-sm text-secondary font-silkscreen">
                          LIVE PRIZE POOL
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-row items-center">
                      <div className="flex space-x-2">
                        <div className="w-12 h-1 bg-gray-500 relative overflow-hidden">
                          <div className="absolute top-0 left-0 h-full bg-white animate-progress-fade"></div>
                        </div>
                        <div className="w-12 h-1 bg-gray-500 relative overflow-hidden">
                          <div className="absolute top-0 left-0 h-full bg-white"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-row justify-start pt-2 pb-2">
                  <div>
                    <h3 className="text-lg text-primary font-silkscreen">
                      {calculateTotalBets()} Quai
                    </h3>
                  </div>
                </div>
                <div className="flex flex-row justify-start">
                  <div>
                    <p className="text-sm text-white font-silkscreen">
                      TO BE RECEIVED BY THE WINNER
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full md:pl-2 h-full">
              <div className="bg-newBlue-400 p-6 w-full h-full">
                <div className="flex flex-row justify-start">
                  <div>
                    <p className="text-sm text-white font-silkscreen">
                      TIME REMAINING
                    </p>
                  </div>
                </div>
                <div className="flex flex-row justify-start pt-2 pb-2">
                  <div>
                    <p className="text-lg text-primary font-silkscreen">
                      {formatTime(timeLeft)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-row justify-start">
                  <div>
                    <p className="text-sm text-white font-silkscreen">
                      UNTIL THE GAME ENDS AND THE LAST Cowboy WINS
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button className="pushable w-full h-16 bg-primary text-black text-[36px] font-silkscreen leading-[36px]" onClick={placeBet}>Cowboy</button>
          <ScrollList list={bets} />
        </div>
      </main>
    </div>
    </div>
  );
}

export default App;
