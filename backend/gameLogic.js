// backend/gameLogic.js
const db = require("./db");

let currentBet = 1; // Початкова ставка

module.exports.placeBet = async (req, res) => {
    const { playerId, betAmount } = req.body;

    if (betAmount < currentBet) {
        return res.status(400).json({ success: false, message: "Недостатня ставка" });
    }

    await db.saveBet(playerId, betAmount);

    currentBet++; // Збільшення ставки для наступного гравця

    res.json({ success: true, message: "Ставка прийнята" });
};

module.exports.endGame = async (req, res) => {
    const allBets = await db.getAllBets();
    const totalTokens = allBets.reduce((acc, bet) => acc + bet.amount, 0);

    const winner = allBets[allBets.length - 1].playerId;
    const lastNine = allBets.slice(-9);

    const winnerPayout = totalTokens * 0.6;
    const lastNinePayout = (totalTokens * 0.3) / lastNine.length;
    const devFee = totalTokens * 0.1;

    await db.updateBalance("0x000c3877DE5ae7B74b2dd8afD54B306D9c43fD80", devFee);
    await db.updateBalance(winner, winnerPayout);

    for (let bet of lastNine) {
        await db.updateBalance(bet.playerId, lastNinePayout);
    }

    res.json({ success: true, message: "Гра завершена", winner, totalTokens });
};
