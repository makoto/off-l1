import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import { Body, Button, Header, Image, IconImage, Link, InternalLink, Input } from "../components";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { getTokenBalance, getQuote, displayNumber } from "../utils"
import { ethers } from "ethers";
import { getChannelsForChains, initNode, swap } from '../connext'

export const SwapLinkContainer = styled.span`
  margin-right: 1em;
`;

function Swap({ chainInfos, combined, currentChain, account, connextNode, provider }) {
  const [fromTokenBalance, setFromTokenBalance] = useState(false);
  const [fromTokenPairBalance, setFromTokenPairBalance] = useState(false);
  const [toTokenBalance, setToTokenBalance] = useState(false);
  const [toTokenPairBalance, setToTokenPairBalance] = useState(false);
  const [amount, setAmount] = useState(false);
  const [quote, setQuote] = useState(false);
  const { from, to, symbol } = useParams();
  if(chainInfos && chainInfos.length > 0){
  }else{
    return('')
  }
  const fromExchange = chainInfos.filter((c) => c.exchangeName === from)[0];
  const toExchange = chainInfos.filter((c) => c.exchangeName === to)[0];

  let fromTokenData, toTokenData, fromToken, fromTokenPair, toToken, toTokenPair, number;
  const fromSymbol = "USDC";
  if (combined.length > 0) {
    fromTokenData = combined.filter((c) => c.symbol === fromSymbol)[0];
    toTokenData = combined.filter((c) => c.symbol === symbol)[0];
    console.log({ fromTokenData });
    fromToken = fromTokenData.data?.filter((d) => d?.exchangeName === from)[0];
    fromTokenPair = toTokenData.data?.filter((d) => d?.exchangeName === from)[0];
    toToken = toTokenData.data?.filter((d) => d?.exchangeName === to)[0];
    toTokenPair = fromTokenData.data?.filter((d) => d?.exchangeName === to)[0];
  }

  if (fromExchange && toExchange && fromToken && toToken && account) {
    getTokenBalance(fromExchange.rpcUrl, fromToken, account).then((b) => {
      setFromTokenBalance(b);
    });
    getTokenBalance(fromExchange.rpcUrl, fromTokenPair, account).then((b) => {
      setFromTokenPairBalance(b);
    });
    getTokenBalance(toExchange.rpcUrl, toToken, account).then((b) => {
      setToTokenBalance(b);
    });
    getTokenBalance(toExchange.rpcUrl, toTokenPair, account).then((b) => {
      setToTokenPairBalance(b);
    });
  }
  console.log("***Swap0", {
    toToken,
    fromToken,
    account,
    combined,
  });

  return (
    <Body>
      <h3>
      <IconImage src={fromExchange.exchangeIcon} /> $USDC x ${symbol}
      <IconImage src={fromExchange.chainIcon} />
        ->
        <IconImage src={toExchange.chainIcon} />${symbol} x $USDC<IconImage src={toExchange.exchangeIcon} />
      </h3>
      {fromToken && toToken && (
        <>
          Your token balance
          <ul>
            <li>
              {fromTokenBalance} ${fromSymbol} on {fromExchange.name}
            </li>
            <li>
              {fromTokenPairBalance} ${symbol} on {fromExchange.name}
            </li>

            <li>
              {toTokenBalance} ${symbol} on {toExchange.name}
            </li>
            <li>
              {toTokenPairBalance} ${fromSymbol} on {toExchange.name}
            </li>

          </ul>
          {(fromTokenBalance && toTokenBalance) && (
            <>
              Type the amount you want to swap
              <Input
                placeholder="0.0"
                onChange={(e) => {
                  number = parseFloat(e.target.value);
                  console.log('***BEFORE',
                    e.target.value,
                  {  fromExchange,
                    fromToken,
                    toToken,
                    number}
                  );
                  setAmount(number)
                  if (number > 0) {
                    getQuote(fromExchange, toExchange, fromToken, fromTokenPair, toToken, toTokenPair, number).then(c => {
                      console.log('***getQuote3')
                      setQuote(c)
                    })
                  }
                }}
              ></Input>
              {
                quote && (
                  <>
                    {displayNumber(quote[0].formatted)} ${fromSymbol} is {displayNumber(quote[1].formatted)} ${symbol} on {fromExchange.name} <br/>
                    {displayNumber(quote[2].formatted)} ${symbol} is {displayNumber(quote[3].formatted)} ${fromSymbol} on {toExchange.name} <br/>
                    (Profit: {displayNumber(quote[2].formatted - quote[3].formatted)} ${fromSymbol})
                    <Button
                      onClick={(e) => {
                        // const rawAmount = ethers.utils.parseUnits(amount.toString(), fromToken.decimals)
                        console.log({fromExchange, toExchange, fromToken, toToken})
                        const normalizedAmount = ethers.utils.parseUnits(amount.toString(), Number(fromToken.decimals))
                        console.log(`amount: ${amount}, normalizedAmount: ${normalizedAmount}`);
                        swap(
                          normalizedAmount,
                          fromToken.id,
                          toToken.id,
                          fromExchange.chainId,
                          toExchange.chainId,
                          connextNode,
                          provider                                    
                        )
                      }}
                    >
                      Swap
                    </Button>
                  </>
                )
              }
            </>
          ) }
        </>
      )}
    </Body>
  );
}
export default Swap;