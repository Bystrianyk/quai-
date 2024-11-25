import React, { useState, useEffect } from 'react';
import styled from 'styled-components';


const ScrollableContainer = styled.div`
  height: 300px;
  margin: 0 auto;

  overflow-y: auto;
  background-color: #1C1E2F;
`;

const TableHeader = styled.div`
  height: 78px;
  display: flex;
  position: sticky;
  top: 0;
  background-color: #222437;
  z-index: 1;
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
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
    
        if (hours > 0) {
          return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        }
        if (minutes > 0) {
          return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        }
        return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
      };
    
      const getUpdatedTime = (time) => {
        return timeAgo(time);
      };
    
      // Set up a state for current time
      const [currentTime, setCurrentTime] = useState(Date.now());
    
      // Use useEffect to update the time every second
      useEffect(() => {
        const intervalId = setInterval(() => {
          setCurrentTime(Date.now()); // Update the current time every second
        }, 1000);
    
        // Clean up the interval when the component unmounts
        return () => clearInterval(intervalId);
      }, []);

      return (
        <div>
        <ScrollableContainer>
        <TableHeader>
        <div><h2>Cowboy</h2></div>
      </TableHeader>
          {list.map((bet, index) => (
            <BetItem key={index}>
              <PlayerAddress>
                {shortenAddress(bet.wallet)} 
                {index === 0 && <span> 👑 CURRENT LEADER</span>}
              </PlayerAddress>
              <span>{bet.amount}</span>
              <span>{getUpdatedTime(bet.time)}</span>
            </BetItem>
          ))}
        </ScrollableContainer>
        </div>
      );
}
  
  export default ScrollList;
  