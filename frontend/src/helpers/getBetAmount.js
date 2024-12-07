const getBetAmount = async (contractInstance) => {
  const betAmount = await contractInstance.currentBetAmount()
  return betAmount
}

export default getBetAmount
