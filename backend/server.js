const express = require("express");
const { ethers } = require("ethers");
require("dotenv").config();
const contract = require("./contractAbi.json");

const app = express();
const port = 3001;

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

app.post("/end-game", async (req, res) => {
  try {
    console.log("Calling endGame function...");

    const tx = await contract.endGame({ gasLimit: 300000 });
    const receipt = await tx.wait();

    res.status(200).json({
      message: "Game ended successfully!",
      transactionHash: receipt.transactionHash,
    });
  } catch (error) {
    console.error("Error calling endGame:", error);
    res.status(500).json({
      message: "Error calling endGame.",
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
