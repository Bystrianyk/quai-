const quais = require("quais");
const express = require("express");
require("dotenv").config();
const { JsonRpcProvider, Contract, Wallet } = require("quais");
const contractAbi = require("./contractAbi.json");

const app = express();
const port = process.env.PORT || 3000;

// Провайдер та підписувач
const provider = new JsonRpcProvider("https://rpc.dev.quai.network");
const privateKey = process.env.CYPRUS1_PK; // Ваш приватний ключ у .env файлі
const wallet = new Wallet(privateKey, provider);

// Адреса контракту з .env
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

// Логіка перевірки та завершення гри
const checkAndEndGame = async () => {
  try {
    // Підключення до контракту
    const contract = new Contract(contractAddress, contractAbi, wallet);

    // Отримання часу останньої ставки
    const lastBetTime = await contract.lastBetTime();
    console.log("Last Bet Time:", lastBetTime.toString());

    const lastBetDate = new Date(Number(lastBetTime) * 1000); // Переводимо у мілісекунди
    lastBetDate.setHours(lastBetDate.getHours() + 1);

    const now = new Date();
    console.log("Current time:", now);
    console.log("Allowed end time:", lastBetDate);

    // Перевірка, чи час завершити гру
    if (now >= lastBetDate) {
      console.log("Calling endGame function...");

      // Викликаємо `endGame` і чекаємо на транзакцію
      const tx = await contract.endGame();
      console.log("Transaction sent. Waiting for confirmation...");

      const receipt = await tx.wait();
      console.log("Transaction mined:", receipt.transactionHash);
    } else {
      console.log("Not yet time to end the game.");
    }
  } catch (error) {
    console.error("Error during the check or calling endGame:", error);
  }
};

// Інтервал перевірки (2 секунди)
setInterval(async () => {
  await checkAndEndGame();
}, 2000);

// Запуск сервера
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
