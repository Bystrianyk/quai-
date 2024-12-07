import { formatUnits } from 'quais' // Імпортуємо лише formatUnits

// Функція для отримання ставок з контракту
const getBets = async (contractInstance) => {
  try {
    // Отримуємо кількість ставок
    const betCount = await contractInstance.getBetCount()
    const bets = []

    // Ітерація по ставках
    for (let i = 0; i < betCount; i++) {
      // Отримуємо кожну ставку за її індексом
      const bet = await contractInstance.bets(i)

      // Форматуємо інформацію про ставку
      const player = bet.player
      const amount = formatUnits(bet.amount, 18) // Використовуємо formatUnits для форматування суми ставки

      // Додаємо ставку в масив
      bets.push({
        wallet: player, // Адреса гравця
        amount: amount, // Сума ставки
        time: new Date(Number(bet.timestamp) * 1000), // Час ставки
      })
    }

    // Повертаємо ставки в порядку від нових до старих
    return bets.reverse() // Перевертаємо масив, якщо хочемо останні ставки на початку
  } catch (error) {
    console.error('Error fetching bets:', error)
    return []
  }
}

export default getBets
