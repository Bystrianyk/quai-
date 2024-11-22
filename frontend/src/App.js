import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import ScrollList from './components/ScrollList';

function App() {
  const [wallet, setWallet] = useState(null); // Триматимемо адресу гаманця
  const [balance, setBalance] = useState(null); // Триматимемо баланс
  const [betAmount, setBetAmount] = useState(1); // Ставка гравця
  const [bets, setBets] = useState([]); // Список ставок
  const [timeLeft, setTimeLeft] = useState(0); // Час до закінчення гри в секундах
  const timerRef = useRef(null); // Зберігає інтервал таймера

  // Форматування часу в години:хвилини:секунди
  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  const mockbets = Array.from({ length: 10 }, () => ({
    wallet: 'fake',
    amount: '2 Quai',
    time: new Date()
  }));

  // Форматування часу як "N хвилин тому", "1 секунда тому" тощо
  const timeAgo = (time) => {
    const secondsAgo = Math.floor((new Date() - new Date(time)) / 1000);

    if (secondsAgo < 60) return `${secondsAgo} секунд${secondsAgo === 1 ? 'а' : ''} тому`;
    const minutesAgo = Math.floor(secondsAgo / 60);
    if (minutesAgo < 60) return `${minutesAgo} хвилин${minutesAgo === 1 ? 'а' : ''} тому`;
    const hoursAgo = Math.floor(minutesAgo / 60);
    return `${hoursAgo} годин${hoursAgo === 1 ? 'а' : ''} тому`;
  };

  // Функція для старту або перезапуску таймера
  const startOrResetTimer = () => {
    clearInterval(timerRef.current); // Зупиняємо поточний таймер, якщо він є
    setTimeLeft(3600); // Встановлюємо таймер на 1 годину (3600 секунд)

    // Запускаємо новий таймер
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 0) {
          return prev - 1;
        } else {
          clearInterval(timerRef.current); // Зупиняємо таймер, коли час вийшов
          return 0;
        }
      });
    }, 1000);
  };

  // Підключення до гаманця та отримання балансу
  const requestAccounts = async () => {
    if (window.pelagus && window.pelagus.request) {
      try {
        const accounts = await window.pelagus.request({ method: 'quai_requestAccounts' });
        const balance = await getBalance(accounts[0]); // Оновлюємо баланс
        setWallet(accounts[0]); // Зберігаємо адресу гаманця
        setBalance(balance); // Оновлюємо баланс
      } catch (error) {
        console.error('Error connecting to Pelagus Wallet:', error);
      }
    } else {
      alert('Pelagus Wallet не знайдено');
    }
  };

  // Слухаємо подію зміни акаунта
  useEffect(() => {
    if (window.pelagus) {
      window.pelagus.on('accountsChanged', (accounts) => {
        if (accounts && accounts[0] !== wallet) {
          setWallet(accounts[0]); // Оновлюємо адресу гаманця при зміні акаунта
          getBalance(accounts[0]).then(balance => setBalance(balance)); // Оновлюємо баланс
        }
      });
    }
  }, [wallet]); // Залежність на wallet

  // Функція для отримання балансу
  const getBalance = async (address) => {
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "quai_getBalance",
        params: [address, "latest"],
        id: 1
      })
    };

    try {
      const response = await fetch('https://rpc.quai.network/cyprus1/', options);
      const result = await response.json();

      if (result && result.result) {
        return parseFloat(result.result) / 1e18;
      } else {
        console.error("Не вдалося отримати баланс");
        return 0;
      }
    } catch (err) {
      console.error("Помилка при отриманні балансу:", err);
      return 0;
    }
  };

  // Допоміжна функція для скорочення адреси
  const shortenAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Функція для відправки транзакції
  const sendTransaction = async () => {
    setBets(prevBets => [...prevBets, ...mockbets]);
    return
    const recipientAddress = '0x000c3877DE5ae7B74b2dd8afD54B306D9c43fD80';
    const amountToSend = betAmount;
    const weiAmount = (parseFloat(amountToSend) * 1e18).toString(16);

    if (window.pelagus && window.pelagus.request) {
      try {
        const accounts = await window.pelagus.request({ method: 'quai_requestAccounts' });
        const transactionParameters = {
          from: accounts[0],
          to: recipientAddress,
          value: '0x' + weiAmount,
          gasLimit: '0x5208',
          gasPrice: '0x3b9aca00',
        };

        const txHash = await window.pelagus.request({
          method: 'quai_sendTransaction',
          params: [transactionParameters],
        });

        console.log('Транзакція надіслана:', txHash);
        addBet(); // Додаємо ставку в список
        startOrResetTimer(); // Стартуємо або перезапускаємо таймер
      } catch (error) {
        console.error('Помилка надсилання транзакції:', error);

        // Перевіряємо, чи була відхилена транзакція
        if (error.code === 4001) {
          alert('Транзакцію було скасовано користувачем.');
        } else {
          alert('Помилка при відправці транзакції. Спробуйте ще раз.');
        }
      }
    } else {
      alert('Гаманець Pelagus не знайдено.');
    }
  };

  // Додавання ставки до таблиці
  const addBet = () => {
    const newBet = {
      wallet: wallet,
      amount: `${betAmount} Quai`,
      time: new Date(),
    };

    setBets(prevBets => {
      const updatedBets = [newBet, ...prevBets];
      return updatedBets.slice(0, 10);
    });

    setBetAmount(prevBetAmount => prevBetAmount + 1);
  };

  // Функція для обчислення суми всіх ставок
  const calculateTotalBets = () => {
    return bets.reduce((total, bet) => total + parseFloat(bet.amount), 0);
  };

  return (
    <div className="App">
      <h1>Game DApp</h1>
      <div className="wallet-info">
        <button className="wallet-balance-btn" disabled>
          {balance !== null ? `Баланс: ${balance} Quai` : 'Завантаження балансу...'}
        </button>
        <button className="connect-wallet-btn" onClick={requestAccounts}>
          {wallet ? shortenAddress(wallet) : 'Connect Wallet'}
        </button>
      </div>
      <div>
        <h3>Ставка: {betAmount} Quai</h3>
        <button onClick={sendTransaction}>Cowboy</button>
      </div>
      <h3>Залишок часу до закінчення гри: {formatTime(timeLeft)}</h3>
      <h3>Сума всіх ставок: {calculateTotalBets()} Quai</h3> {/* Виводимо суму всіх ставок */}
      <h3>Список ставок</h3>
      {/* <table>
        <thead>
          <tr>
            <th>Гравець</th>
            <th>Сума ставки</th>
            <th>Час</th>
          </tr>
        </thead>
        <tbody>
  {bets.map((bet, index) => (
    <tr key={index}>
      <td>
        {shortenAddress(bet.wallet)} 
        {index === 0 && <span>👑</span>}
      </td>
      <td>{bet.amount}</td>
      <td>{timeAgo(bet.time)}</td>
    </tr>
  ))}
</tbody>

      </table> */}
      <ScrollList list={bets} />
    </div>
  );
}

export default App;
