const quais = require('quais')
const CowboyGame = require("../artifacts/contracts/Game.sol/CowboyGame.json");
require('dotenv').config()

async function deployGame() {
  // Config provider, wallet, and contract factory
  const provider = new quais.JsonRpcProvider(hre.network.config.url, undefined, { usePathing: true })
  const wallet = new quais.Wallet(hre.network.config.accounts[0], provider)
  const Game = new quais.ContractFactory(CowboyGame.abi, CowboyGame.bytecode, wallet)

  // Broadcast deploy transaction
  const game = await Game.deploy()
  console.log('Transaction broadcasted: ', game.deploymentTransaction().hash)

  // Wait for contract to be deployed
  await game.waitForDeployment()
  console.log('Contract deployed to: ', await game.getAddress())
}

deployGame()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
