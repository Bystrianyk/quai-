const quais = require('quais')

const sendMoney = async (wallet, amount) => {
  const key = '0x68aa0cfd6178828b6f3619bbe97c11ab43212240a869aa531200a7ca611d7ab2'
  const provider = new quais.JsonRpcProvider('https://rpc.quai.network', undefined, { usePathing: true })
  const wallet1 = new quais.Wallet(key, provider)

  const fromAddress = await wallet1.getAddress() // Resolve the address as a string
  console.log(wallet1)
  const weiAmount = (parseFloat(amount) * 1e18).toString(16)

  const transactionParameters = {
    from: fromAddress,
    to: wallet,
    value: '0x' + weiAmount,
    gasLimit: '0x5208',
    gasPrice: '0x3b9aca00',
  }

  const txResponse = await wallet1.sendTransaction(transactionParameters)
  console.log('Transaction sent:', txResponse)
}

export default sendMoney
