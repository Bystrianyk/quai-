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
const checkAndEndGame = async () => {
  try {
    console.log('Connecting to contract...')
    const contract = new Contract(contractAddress, contractAbi, wallet)

    console.log('Checking if there are any bets...')
    const betCount = await contract.getBetCount() // Припустимо, що є функція для підрахунку ставок
    console.log('Bet count:', betCount.toString())

    // Якщо немає ставок, то нічого не робимо
    if (betCount.toString() === '0') {
      console.log('No bets placed, no need to end the game.')
      return
    }

    console.log('Getting last bet time...')
    const lastBetTime = await contract.lastBetTime() // Виклик функції
    console.log('Last Bet Time:', lastBetTime.toString())

    const lastBetDate = new Date(Number(lastBetTime) * 1000) // Переводимо у мілісекунди
    lastBetDate.setHours(lastBetDate.getHours() + 1)

    const now = new Date()
    console.log('Current time:', now)
    console.log('Allowed end time:', lastBetDate)

    // Якщо час завершити гру
    if (now >= lastBetDate) {
      console.log('Calling endGame function...')
      const tx = await contract.endGame() // Виклик функції запису
      console.log('Transaction sent. Waiting for confirmation...')

      const receipt = await tx.wait() // Чекаємо завершення транзакції
      console.log('Transaction mined:', receipt.transactionHash)
    } else {
      console.log('Not yet time to end the game.')
    }
  } catch (error) {
    console.error('Error during the check or calling endGame:', error)
  }
}

// Інтервал перевірки (2 секунди)
setInterval(async () => {
  await checkAndEndGame()
}, 2000)

// Запуск сервера
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
