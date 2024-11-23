const getRandomItems = (arr, num, winnerWallet) => {
  const uniqueWallets = Array.from(new Set(arr.map(item => item.wallet)));
  const filteredArr = uniqueWallets.filter(item => console.log('tpuch', item.wallet, winnerWallet));
  const shuffled = [...filteredArr].sort(() => 0.5 - Math.random());
  
  return shuffled.slice(0, num);
};

export default getRandomItems;
