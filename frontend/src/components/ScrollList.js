import React from 'react';
import styled from 'styled-components';

const ScrollableContainer = styled.div`
  width: 100%;
  height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
`;

const TableHeader = styled.div`
  display: flex;
  position: sticky;
  top: 0;
  background-color: #f2f2f2;
  z-index: 1;
  border-bottom: 2px solid #ddd;
  padding: 10px;
  font-weight: bold;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const BetItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px;
  border-bottom: 1px solid #ddd;
  
  &:hover {
    background-color: #f1f1f1;
  }
`;

const PlayerAddress = styled.span`
  font-weight: bold;
  color: #333;
`;

const ScrollList = (props) => {
    const { list } = props;

      const shortenAddress = (address) => {
        return address.slice(0, 6) + '...' + address.slice(-4);
      };
      
      const timeAgo = (time) => {
        const seconds = Math.floor((new Date() - new Date(time)) / 1000);
        return `${seconds} seconds ago`;
      };

      return (
        <div>
        <ScrollableContainer>
        <TableHeader>
        <div>Гравець</div>
        <div>Сума ставки</div>
        <div>Час</div>
      </TableHeader>
          {list.map((bet, index) => (
            <BetItem key={index}>
              <PlayerAddress>
                {shortenAddress(bet.wallet)} 
                {index === 0 && <span> 👑</span>}
              </PlayerAddress>
              <span>{bet.amount}</span>
              <span>{timeAgo(bet.time)}</span>
            </BetItem>
          ))}
        </ScrollableContainer>
        </div>
      );
}
  
  export default ScrollList;
  