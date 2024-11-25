import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import ScrollList from "./components/ScrollList";
import getRandomItems from "./helpers/getRandomItems";
import sendMoney from "./helpers/sendMoney";
import logo from "./images/logo.png";

function App() {
  const [wallet, setWallet] = useState(null); // Триматимемо адресу гаманця
  const [balance, setBalance] = useState(null); // Триматимемо баланс
  const [betAmount, setBetAmount] = useState(1); // Ставка гравця
  const [bets, setBets] = useState([]); // Список ставок
  const [timeLeft, setTimeLeft] = useState(0); // Час до закінчення гри в секундах
  const timerRef = useRef(null); // Зберігає інтервал таймера
  const time = 60 * 1000; // 1 година

  // Форматування часу в години:хвилини:секунди
  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  // Функція для старту або перезапуску таймера
  const startOrResetTimer = () => {
    clearInterval(timerRef.current); // Stop any existing timer
    setTimeLeft(time / 1000);

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

  // Підключення до гаманця та отримання балансу
  const requestAccounts = async () => {
    if (window.pelagus && window.pelagus.request) {
      try {
        const accounts = await window.pelagus.request({
          method: "quai_requestAccounts",
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

  useEffect(() => {
    let timeoutId;

    const checkTime = () => {
      if (bets.length) {
        const oneHourLaterBet = new Date(bets[0].time.getTime() + time);
        const currentTime = new Date();

        if (oneHourLaterBet <= currentTime) {
          clearTimeout(timeoutId);
          const totalAmount = bets.reduce((sum, item) => sum + item.amount, 0);
          const winnerWallet = bets.shift().wallet;
          const randomWinners = 10;
          const randomWallets = getRandomItems(
            bets,
            randomWinners,
            winnerWallet
          );

          sendMoney(winnerWallet, totalAmount * 0.6);
          for (const wallet in randomWallets) {
            sendMoney(wallet, (totalAmount * 0.3) / randomWallets.length);
          }
          setBets([]);
          setBetAmount(1);
          return;
        }
      }

      timeoutId = setTimeout(checkTime, 1000);
    };

    checkTime();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [bets.length]);

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

  // Функція для відправки транзакції
  const sendTransaction = async () => {
    const recipientAddress = "0x000c3877DE5ae7B74b2dd8afD54B306D9c43fD80";
    const weiAmount = (parseFloat(betAmount) * 1e18).toString(16);

    if (window.pelagus && window.pelagus.request) {
      try {
        const accounts = await window.pelagus.request({
          method: "quai_requestAccounts",
        });
        const transactionParameters = {
          from: accounts[0],
          to: recipientAddress,
          value: "0x" + weiAmount,
          gasLimit: "0x5208",
          gasPrice: "0x3b9aca00",
        };

        const txHash = await window.pelagus.request({
          method: "quai_sendTransaction",
          params: [transactionParameters],
        });

        console.log("Транзакція надіслана:", txHash);
        addBet(); // Додаємо ставку в список
        startOrResetTimer(); // Стартуємо або перезапускаємо таймер
      } catch (error) {
        console.error("Помилка надсилання транзакції:", error);

        // Перевіряємо, чи була відхилена транзакція
        if (error.code === 4001) {
          alert("Транзакцію було скасовано користувачем.");
        } else {
          alert("Помилка при відправці транзакції. Спробуйте ще раз.");
        }
      }
    } else {
      alert("Гаманець Pelagus не знайдено.");
    }
  };

  const addBet = () => {
    const newBet = {
      wallet: wallet,
      amount: betAmount,
      time: new Date(),
    };

    setBets((prevBets) => [newBet, ...prevBets]);
    setBetAmount(betAmount + 1);
  };

  const calculateTotalBets = () => {
    return bets.reduce((total, bet) => total + parseFloat(bet.amount), 0);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-blue-600 overflow-x-clip">
      <header className="w-full z-20 backdrop-blur-3xl">

      </header>
    <div className="App">
      <header className="w-full z-20 backdrop-blur-3xl">
        <nav className="mx-auto container p-4">
        <div className="wallet-info">
          {balance !== null ? (
            <div className="balance-display">
              <span>{balance !== null ? `${balance} Quai` : "N/A Quai"} </span>
              <img src={logo} alt="logo" className="logo-img" />
            </div>
          ) : (
            <img src={logo} alt="loading logo" className="logo-img" />
          )}
          <button className="connect-wallet-btn" onClick={requestAccounts}>
            {wallet ? shortenAddress(wallet) : "Connect Wallet"}
          </button>
        </div>
        </nav>
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
          <button className="pushable w-full h-16 bg-primary text-black text-[36px] font-silkscreen leading-[36px]" onClick={sendTransaction}>Cowboy</button>
          <ScrollList list={bets} />
        </div>
      </main>
    </div>
    </div>
  );
}

export default App;
