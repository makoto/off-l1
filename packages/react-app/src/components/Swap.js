import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import { Body, Button, Header, Image, IconImage, Link, InternalLink } from "../components";
import { useParams } from "react-router-dom";
import styled from "styled-components";

export const SwapLinkContainer = styled.span`
  margin-right: 1em;
`;

function Swap({
  chainInfos, combined
}) {
  let { from, to, symbol } = useParams();
  let fromExchange = chainInfos.filter(c => c.exchangeName === from )[0]
  let toExchange = chainInfos.filter(c => c.exchangeName === to )[0]
  let tokenData
  if(combined.length > 0){
    tokenData = combined.filter(c => c.symbol === symbol)[0]
  }
  return (
    <Body>
      <h3>
        $USDC x ${symbol}
        <IconImage src={fromExchange.exchangeIcon} />
        ->
        <IconImage src={toExchange.exchangeIcon} />
        ${symbol} x $USDC
      </h3>
      <ul>
        <li>
          1.Set Network to {fromExchange.name}
        </li>
        <li>
          2: Approve USDC 
        </li>
        <li>
          3: Swap from $USDC to ${symbol}
        </li>
        <li>
          4: Transfer ${symbol} from ${fromExchange.name} to ${toExchange.name}
        </li>
        <li>
          5: Set Network to {toExchange.name}
        </li>
        <li>
          6: Swap ${symbol} to $USDC
        </li>
      </ul>
    </Body>
  )
}
export default Swap;