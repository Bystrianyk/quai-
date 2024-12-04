import { quais } from "quais";

const getBets = async (contractInstance) => {
  const betCount = await contractInstance.getBetCount();
  const bets = [];
  for (let i = 0; i < betCount; i++) {
    const bet = await contractInstance.bets(i);
    const player = bet.player;
    const amount = quais.formatUnits(bet.amount, 18);

    bets.unshift({
      wallet: player,
      amount: amount,
      time: new Date(Number(bet.timestamp) * 1000),
    });
  }

  return bets;
};

export default getBets;
