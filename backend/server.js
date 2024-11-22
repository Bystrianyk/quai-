// backend/server.js
require("dotenv").config();
const express = require("express");
const walletAuth = require("./walletAuth");
const gameLogic = require("./gameLogic");
const db = require("./db");

const app = express();
app.use(express.json());

// Маршрут для аутентифікації гравця через гаманець
app.post("/api/auth", walletAuth.authenticate);

// Маршрут для ставки та початку гри
app.post("/api/placeBet", gameLogic.placeBet);

// Маршрут для завершення гри та розподілу виграшу
app.post("/api/endGame", gameLogic.endGame);

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Сервер запущено на порту ${PORT}`));
