import React, { useState } from 'react'
import styled from 'styled-components'

const ScrollableContainer = styled.div`
  height: 600px;
  margin: 0 auto;
  overflow-y: auto;
  background-color: #222437;
`

const TableHeader = styled.div`
  height: 78px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background-color: #222437;
  z-index: 1;
  padding: 10px;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
`

const FilterButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => (props.active ? '#00ff00' : '#aaa')};
  font-family: 'Silkscreen', sans-serif;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    color: #fff;
  }
`

const BetItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px;
  margin-top: 10px;
  background-color: #1c1e2f;
  border-radius: 4px;

  &:hover {
    background-color: #333;
  }
`

const WinnersItem = ({ game }) => {
  return (
    <BetItem>
      <p>
        👑 WINNER: {game.winner.slice(0, 6)}...{game.winner.slice(-4)}
      </p>
      <p>🏆 Prize: {game.winnerPrize} Quai</p>
      <p>
        🎟️ LOTTERY WINNER: {game.lotteryWinner.slice(0, 6)}...{game.lotteryWinner.slice(-4)}
      </p>
      <p>🏅 Prize: {game.lotteryPrize} Quai</p>
      <p>{game.timeAgo} ago</p>
    </BetItem>
  )
}

const ScrollList = (props) => {
  const { list, winners } = props // Дані передаються через пропси
  const [filter, setFilter] = useState('latest') // Контроль активного фільтру

  // Фільтрація списку відповідно до обраного фільтру
  const filterBets = () => {
    if (filter === 'winners') {
      return Array.isArray(winners) ? winners : []
    }
    return Array.isArray(list) ? list : []
  }

  return (
    <div className='font-silkscreen text-white bg-newBlue-500 p-2 w-full'>
      <ScrollableContainer>
        <TableHeader>
          <p className='text-lg text-white font-silkscreen'>Cowboy</p>
          <ButtonGroup>
            <FilterButton active={filter === 'latest'} onClick={() => setFilter('latest')}>
              Latest
            </FilterButton>
            <FilterButton active={filter === 'winners'} onClick={() => setFilter('winners')}>
              Winners
            </FilterButton>
          </ButtonGroup>
        </TableHeader>
        {filterBets().map((item, index) =>
          filter === 'winners' ? (
            <WinnersItem key={index} game={item} />
          ) : (
            <BetItem key={index}>
              <p className='text-sm text-white font-silkscreen'>{item.wallet}</p>
              <p className='text-sm text-white font-silkscreen'>{item.amount} Quai</p>
              <p className='text-sm text-gray-500 font-silkscreen'>{item.timeAgo} ago</p>
            </BetItem>
          )
        )}
      </ScrollableContainer>
    </div>
  )
}

export default ScrollList
