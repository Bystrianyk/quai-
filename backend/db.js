// backend/db.js
let bets = [];

module.exports.saveBet = async (playerId, amount) => {
    bets.push({ playerId, amount, timestamp: new Date() });
};

module.exports.getAllBets = async () => bets;

module.exports.updateBalance = async (playerId, amount) => {
    // Оновлення балансу гравця
};
