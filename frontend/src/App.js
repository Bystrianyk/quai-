import React, { useState, useEffect, useRef } from "react";
import { quais } from "quais";
import "./App.css";
import ScrollList from "./components/ScrollList";
import getRandomItems from "./helpers/getRandomItems";
import sendMoney from "./helpers/sendMoney";
import logo from "./images/logo.png";

const contractAddress = "0x004965c0500bd966E744dd5F4c2d38C7EbbFFC1f"; // Адреса розгорнутого контракту
import contractABI from "./contractAbi.json";

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
          const accounts = await window.pelagus.request({
            method: "quai_requestAccounts",
          });
          const accountBalance = await getBalance(accounts[0]); // Оновлюємо баланс
          setWallet(accounts[0]); // Зберігаємо адресу гаманця
          setBalance(accountBalance); // Оновлюємо баланс

          // Підключення до контракту
          const provider = new quais.BrowserProvider(window.pelagus);
          const signer = provider.getSigner();
          const contractInstance = new quais.Contract(
            contractAddress,
            contractABI,
            signer
          );
          setContract(contractInstance);
        } catch (error) {
          console.error("Помилка підключення до контракту:", error);
        }
      } else {
        alert("Pelagus Wallet не знайдено");
      }
    };

    initContract();
  }, []); // Запуск ініціалізації при першому рендері

  const requestAccounts = async () => {
    if (window.pelagus && window.pelagus.request) {
      try {
        const accounts = await window.pelagus.request({
          method: "quai_requestAccounts", // Використовуємо правильний метод
        });
        const accountBalance = await getBalance(accounts[0]); // Оновлюємо баланс
        setWallet(accounts[0]); // Зберігаємо адресу гаманця
        setBalance(accountBalance); // Оновлюємо баланс
        console.log(accounts);
      } catch (error) {
        console.error("Error connecting to Pelagus Wallet:", error);
      }
    } else {
      alert("Pelagus Wallet не знайдено");
    }
  };

  const placeBet = async () => {
    if (!contract) {
      alert("Контракт не підключено");
      return;
    }

    try {
      // Створення провайдера
      const provider = new quais.BrowserProvider(window.pelagus); // Використовуємо гаманець Pelagus
      const signer = await provider.getSigner(); // Отримуємо підписувача

      // Підключаємо контракт з підписувачем
      const contractInstance = new quais.Contract(
        contractAddress,
        contractABI,
        signer
      );

      // Переводимо ставку в одиниці (Quai має 18 десяткових розрядів)
      const betAmountInUnits = quais.parseUnits(betAmount.toString(), 18);

      // Відправляємо транзакцію
      const tx = await contractInstance.placeBet({ value: betAmountInUnits });
      console.log("Транзакція ініційована, хеш:", tx.hash);

      // Очікуємо підтвердження транзакції
      await tx.wait();
      console.log("Ставка успішно розміщена");

      // Оновлення ставок
      setBets([
        ...bets,
        {
          wallet: wallet, // Короткий формат адреси гаманця
          amount: betAmount, // Сума ставки
          time: Date.now(), // Поточний час
        },
      ]);
    } catch (error) {
      console.error("Помилка під час розміщення ставки:", error);
      alert("Помилка під час розміщення ставки. Спробуйте ще раз.");
    }
  };

  const startOrResetTimer = () => {
    clearInterval(timerRef.current); // Stop any existing timer
    setTimeLeft(time / 1000); // Set initial time

    // Start a new timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 0) {
          return prev - 1;
        } else {
          clearInterval(timerRef.current); // Stop the timer when it reaches 0
          return 0;
        }
      });
    }, 1000);
  };

  // Функція для отримання балансу
  const getBalance = async (address) => {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "quai_getBalance",
        params: [address, "latest"],
        id: 1,
      }),
    };

    try {
      const response = await fetch(
        "https://rpc.quai.network/cyprus1/",
        options
      );
      const result = await response.json();

      if (result && result.result) {
        return parseInt(result.result) / 1e18;
      } else {
        console.error("Не вдалося отримати баланс");
        return 0;
      }
    } catch (err) {
      console.error("Помилка при отриманні балансу:", err);
      return 0;
    }
  };

  const shortenAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Слухаємо подію зміни акаунта
  useEffect(() => {
    if (window.pelagus) {
      window.pelagus.on("accountsChanged", (accounts) => {
        if (accounts && accounts[0] !== wallet) {
          setWallet(accounts[0]); // Оновлюємо адресу гаманця при зміні акаунта
          getBalance(accounts[0]).then((balance) => setBalance(balance)); // Оновлюємо баланс
        }
      });
    }
  }, [wallet]); // Залежність на wallet

  // Форматування часу для відображення
  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
    return `${minutes}:${(seconds < 10 ? "0" : "") + seconds}`;
  };

  const calculateTotalBets = () => {
    return bets.reduce((total, bet) => total + parseFloat(bet.amount), 0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-blue-600 overflow-x-clip">
      <div className="App">
        <header className="w-full z-20 backdrop-blur-3xl header-container">
          <img src={logo} alt="logo" className="logo-img" />
          <div className="wallet-info">
            {balance !== null ? (
              <div className="balance-display">
                <span
                  className="
      text-sm
      
      
      
      
      text-white
      
      
      
       font-silkscreen "
                >
                  {balance !== null
                    ? `${Number(balance).toFixed(2)} Quai`
                    : "N/A Quai"}{" "}
                </span>
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
            <button
              className="pushable w-full h-16 bg-primary text-black text-[36px] font-silkscreen leading-[36px]"
              onClick={placeBet}
            >
              Cowboy
            </button>
            <ScrollList list={bets} />
          </div>
        </main>

        <footer className="p-12 w-full">
          <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
            <li>
              <a
                href="https://faucet.quai.network/"
                target="_blank"
                className="font-silkscreen mr-4 hover:underline md:mr-6"
              >
                Faucet
              </a>
            </li>
            <li>
              <a
                href="https://discord.com/invite/vk2EFMfB5n"
                target="_blank"
                className="font-silkscreen mr-4 hover:underline md:mr-6"
              >
                Discord
              </a>
            </li>
            <li>
              <a
                href="https://x.com/QuaiNetwork"
                target="_blank"
                className="font-silkscreen mr-4 hover:underline md:mr-6"
              >
                Twitter
              </a>
            </li>
            <li>
              <a
                href="https://marginex.app/"
                target="_blank"
                className="font-silkscreen mr-4 hover:underline md:mr-6"
              >
                Marginex
              </a>
            </li>
          </ul>
        </footer>
      </div>
    </div>
  );
}

export default App;
