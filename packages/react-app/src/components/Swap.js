import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import { Body, Button, Header, Image, IconImage, Link, InternalLink, Input } from "../components";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { getTokenBalance, geQuote } from "../utils"
import { ethers } from "ethers";
import { getChannelsForChains, initNode, swap } from '../connext'

export const SwapLinkContainer = styled.span`
  margin-right: 1em;
`;

function Swap({
  chainInfos, combined, currentChain, account
}) {
  const { from, to, symbol } = useParams();
  const fromExchange = chainInfos.filter(c => c.exchangeName === from )[0]
  const toExchange = chainInfos.filter(c => c.exchangeName === to )[0]
  const [ fromTokenBalance, setFromTokenBalance ] = useState(false);
  const [ fromTokenAllowance, setFromTokenAllowance ] = useState(false);
  const [toTokenBalance, setToTokenBalance] = useState(false);

  let fromTokenData, toTokenData, fromToken, toToken, number
  const fromSymbol = 'USDC'
  if(combined.length > 0){
    fromTokenData = combined.filter(c => c.symbol === fromSymbol)[0]
    toTokenData = combined.filter(c => c.symbol === symbol)[0]
    console.log({fromTokenData  })
    fromToken = fromTokenData.data?.filter(d => d?.exchangeName === from )[0]
    toToken =  toTokenData.data?.filter(d => d?.exchangeName === to )[0]
  }

  if(fromExchange && fromToken && account){
    getTokenBalance(fromExchange.rpcUrl, fromToken, account).then(b => {
      setFromTokenBalance(b)
    })
    console.log('***Swap1', {
      fromExchange, fromToken, account
    })
    // getTokenAllowance(fromExchange, fromToken, account).then(b => {
    //   console.log('***Swap2', {
    //     b
    //   })  
    //   setFromTokenAllowance(b)
    // })
  }
  if(toExchange && toToken && account){
    getTokenBalance(toExchange.rpcUrl, toToken, account).then(b => {
      setToTokenBalance(b)
    })
  }
  console.log('***Swap0', {
    toToken, fromToken, account, combined
  })

  return (
    <Body>
      <h3>
        $USDC x ${symbol}
        <IconImage src={fromExchange.exchangeIcon} />
        ->
        <IconImage src={toExchange.exchangeIcon} />
        ${symbol} x $USDC
      </h3>
      {fromToken && toToken && (
        <>
          Your token balance
          <ul>
            <li>
              {fromTokenBalance} ${fromSymbol} on {fromExchange.name}
            </li>
            <li>
              {toTokenBalance} ${symbol} on {toExchange.name}
            </li>
          </ul>
          Type the amount you want to swap
          <Input placeholder="0.0"
            onChange={(e) => {
              number = parseFloat(e.target.value)
              console.log(e.target.value, fromExchange, fromToken, toToken, number)
              if(number > 0){
                geQuote(fromExchange, fromToken, toToken, number)
              }
            }}
          >
          </Input>
        </>
      )}

      <ul>
        <li>
          1.Set Network to {fromExchange.name}
          {
            currentChain?.name === fromExchange.name ? (`✔️`) : (`(You are connected to ${ currentChain?.name })`)
          }
        </li>
        <li>
          2: Approve USDC
          {/* (current allowance = {fromTokenAllowance}) */}
          {/* <Button
            onClick={() => {
              approveToken(fromExchange, fromToken)
            }}
          >Approve</Button>
          <Button
            onClick={() => {
              revokeToken(fromExchange, fromToken)
            }}
          >
            Revoke
          </Button> */}
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