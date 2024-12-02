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
    address public constant FIXED_ADDRESS = 0x000c3877DE5ae7B74b2dd8afD54B306D9c43fD80;
    uint256 public constant GAME_DURATION = 1 hours;
    
    uint256 public lastBetTime;
    address public lastWinner;
    uint256 public currentBetAmount = 1 * 10**18;  // 1 Quai в одиницях wei

    event BetPlaced(address indexed player, uint256 amount, uint256 timestamp);
    event GameEnded(address winner, uint256 prize);

    modifier onlyAfterGame() {
        require(block.timestamp > lastBetTime + GAME_DURATION, "Game is still active");
        _;
    }

    constructor() {}

    // Функція для внесення ставки
    function placeBet() external payable {
        require(msg.value == currentBetAmount, "Incorrect bet amount");

        // Оновлення часу останньої ставки
        lastBetTime = block.timestamp;

        // Збереження інформації про ставку
        bets.push(Bet({
            player: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp
        }));

        // Збільшення наступної ставки на 1 Quai
        currentBetAmount += 1 * 10**18;  // Збільшуємо на 1 Quai (1 * 10^18 wei)

        emit BetPlaced(msg.sender, msg.value, block.timestamp);
    }

    // Завершення гри та розподіл виграшу
    function endGame() external onlyAfterGame {
        require(bets.length > 0, "No bets placed");

        uint256 totalPool = address(this).balance;

        // Розподіл виграшу
        uint256 fixedReward = (totalPool * 10) / 100;
        uint256 randomReward = (totalPool * 30) / 100;
        uint256 winnerReward = (totalPool * 60) / 100;

        // Виплата фіксованій адресі
        payable(FIXED_ADDRESS).transfer(fixedReward);

        // Виплата випадковим 10 учасникам
        uint256 numWinners = bets.length < 10 ? bets.length : 10;
        for (uint256 i = 0; i < numWinners; i++) {
            uint256 randomIndex = uint256(
                keccak256(abi.encodePacked(block.timestamp, msg.sender, i))
            ) % bets.length;

            address randomPlayer = bets[randomIndex].player;
            payable(randomPlayer).transfer(randomReward / numWinners);
        }

        // Виплата переможцю
        lastWinner = bets[bets.length - 1].player;
        payable(lastWinner).transfer(winnerReward);

        emit GameEnded(lastWinner, winnerReward);

        // Скидання гри
        delete bets;
        currentBetAmount = 1 * 10**18;  // Скидаємо на 1 Quai
    }

    // Отримання кількості ставок
    function getBetCount() external view returns (uint256) {
        return bets.length;
    }
}
