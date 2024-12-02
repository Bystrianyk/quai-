// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Address.sol";

contract CowboyGame {
    struct Bet {
        address player;
        uint256 amount;
        uint256 timestamp;
    }

    Bet[] public bets;
    address public fixedAddress;
    uint256 public constant GAME_DURATION = 1 hours;

    uint256 public lastBetTime;
    address public lastWinner;
    uint256 public currentBetAmount = 1 * 10**18; // 1 Quai в одиницях wei
    bool public isGameActive = true;

    event BetPlaced(address indexed player, uint256 amount, uint256 timestamp);
    event GameEnded(address winner, uint256 prize);

    modifier onlyAfterGame() {
        require(block.timestamp > lastBetTime + GAME_DURATION, "Game is still active");
        _;
    }

    modifier onlyIfActive() {
        require(isGameActive, "Game is not active");
        _;
    }

    constructor(address _fixedAddress) {
        fixedAddress = _fixedAddress;
    }

    function placeBet() external payable onlyIfActive {
        require(block.timestamp <= lastBetTime + GAME_DURATION, "Game has ended");
        require(msg.value == currentBetAmount, "Incorrect bet amount");

        lastBetTime = block.timestamp;

        bets.push(Bet({
            player: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp
        }));

        currentBetAmount += 1 * 10**18;

        emit BetPlaced(msg.sender, msg.value, block.timestamp);
    }

    function endGame() external onlyAfterGame onlyIfActive {
        require(bets.length > 0, "No bets placed");
        isGameActive = false;

        uint256 totalPool = address(this).balance;

        uint256 fixedReward = (totalPool * 10) / 100;
        uint256 randomReward = (totalPool * 30) / 100;
        uint256 winnerReward = (totalPool * 60) / 100;

        payable(fixedAddress).transfer(fixedReward);

        uint256 numWinners = bets.length < 10 ? bets.length : 10;
        for (uint256 i = 0; i < numWinners; i++) {
            uint256 randomIndex = uint256(
                keccak256(abi.encodePacked(block.timestamp, msg.sender, i))
            ) % bets.length;

            address randomPlayer = bets[randomIndex].player;
            payable(randomPlayer).transfer(randomReward / numWinners);
        }

        lastWinner = bets[bets.length - 1].player;
        payable(lastWinner).transfer(winnerReward);

        emit GameEnded(lastWinner, winnerReward);

        delete bets;
        currentBetAmount = 1 * 10**18;
        isGameActive = true; // Перезапуск гри
    }
}
