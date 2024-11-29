import React, { useState } from "react";

function WalletConnector() {
    const [address, setAddress] = useState("");
    const [currentBet, setCurrentBet] = useState(1);

    const connectWallet = async () => {
        const walletAddress = "0x123..."; // Інтеграція через Pelagus Wallet
        setAddress(walletAddress);
    };

    const placeBet = async () => {
        await fetch("/api/placeBet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ playerId: address, betAmount: currentBet }),
        });
        setCurrentBet(currentBet + 1);
    };

    return (
        <div>
            <button onClick={connectWallet}>Підключити гаманець</button>
            {address && (
                <>
                    <button onClick={placeBet}>Ставка (Ковбой)</button>
                    <p>Ставка: {currentBet} Quai</p>
                    <p>Гаманець: {address}</p>
                </>
            )}
        </div>
    );
}

export default WalletConnector;
