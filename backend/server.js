const express = require("express");
require("dotenv").config();
const { JsonRpcProvider, Contract } = require("quais");
const contractAbi = require("./contractAbi.json");

const provider = new JsonRpcProvider("https://rpc.quai.network");
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS; // Store in your .env file

// const provider = new quais.JsonRpcProvider("https://rpc.quai.network"); // Your provider URL
// const signer = provider.getSigner();
// console.log(signer);
// const wallet = new quais.Wallet(
//   "0x811d7bd45e5c7fcde02352ed956732d760a263f0ec0ab139f12703cb8ba7e004",
//   provider
// ); // Private key for the wallet

const app = express();
const port = process.env.PORT;

const checkAndEndGame = async () => {
  try {
    const signer = provider.getSigner(); // Get signer for sending transactions
    const contract = new Contract(contractAddress, contractAbi, signer);
    console.log(contract);
    const lastBetTime = await contract.lastBetTime();

    const lastBetDate = new Date(Number(lastBetTime) * 1000); // Convert from seconds to milliseconds

    lastBetDate.setHours(lastBetDate.getHours() + 1);

    const now = new Date();
    console.log(now >= lastBetDate, now, lastBetDate, contractAddress);
    if (now >= lastBetDate) {
      console.log("Calling endGame function...");

      const tx = await contract.endGame({ gasLimit: 300000 });

      const receipt = await tx.wait();
      console.log("Transaction mined:", receipt.transactionHash);

      allowedEndTime.setDate(allowedEndTime.getDate() + 1);
    } else {
      console.log(
        "Not yet time to end the game. Current time:",
        now,
        "Allowed end time:",
        allowedEndTime
      );
    }
  } catch (error) {
    console.error("Error during the check or calling endGame:", error);
  }
};

setInterval(async () => {
  await checkAndEndGame();
}, 2000);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
