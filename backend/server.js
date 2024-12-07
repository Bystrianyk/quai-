require('dotenv').config() // Переконайтеся, що шлях до .env правильний

const express = require('express')
const { JsonRpcProvider, Contract, Wallet } = require('quais')
const contractAbi = require('./contractAbi.json')

const app = express()
const port = process.env.PORT || 3001

// Провайдер та гаманець
const provider = new JsonRpcProvider('https://rpc.quai.network')
const privateKey = process.env.CYPRUS1_PK // Приватний ключ
const wallet = new Wallet(privateKey, provider)

// Адреса контракту
const contractAddress = process.env.CONTRACT_ADDRESS
if (!contractAddress) {
  throw new Error('Contract address is not defined in .env file')
}

console.log('Contract Address from .env:', contractAddress)

// Логіка перевірки та завершення гри
let gameEnded = false // Змінна для відстеження статусу гри

const checkAndEndGame = async () => {
  try {
    console.log('Connecting to contract...')
    const contract = new Contract(contractAddress, contractAbi, wallet)

    console.log('Checking if there are any bets...')
    const betCount = await contract.getBetCount()
    console.log('Bet count:', betCount.toString())

    // Якщо немає ставок або гра вже завершена, нічого не робимо
    if (betCount.toString() === '0') {
      console.log('No bets placed, skipping...')
      return
    }

    console.log('Getting last bet time...')
    const lastBetTime = await contract.lastBetTime()
    console.log('Last Bet Time:', lastBetTime.toString())

    const lastBetDate = new Date(Number(lastBetTime) * 1000)
    lastBetDate.setHours(lastBetDate.getHours() + 1)

    const now = new Date()
    console.log('Current time:', now)
    console.log('Allowed end time:', lastBetDate)

    // Якщо час завершити гру
    if (now >= lastBetDate) {
      if (!gameEnded) {
        console.log('Calling endGame function...')
        const tx = await contract.endGame() // Викликаємо функцію завершення гри
        console.log('Transaction sent. Waiting for confirmation...')

        const receipt = await tx.wait() // Чекаємо на підтвердження
        console.log('Transaction mined:', receipt.transactionHash)

        gameEnded = true // Оновлюємо статус, що гра завершена
      } else {
        console.log('Game already ended.')
      }
    } else {
      console.log('Not yet time to end the game.')
    }

    // Якщо з'явилась нова ставка, то скидаємо статус гри
    if (betCount.toString() > 0 && gameEnded) {
      console.log('New bet detected, resetting game status...')
      gameEnded = false // Скидаємо статус гри для нового раунду
    }
  } catch (error) {
    console.error('Error during the check or calling endGame:', error)
  }
}

// Запуск перевірки кожні 5 хвилин (час можна налаштувати)
setInterval(checkAndEndGame, 1000)

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
