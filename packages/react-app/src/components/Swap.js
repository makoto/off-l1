import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/react-hooks";
import { Body, Button, Note, Image, IconImage, Link, InternalLink, Input, ActionContainer, WarningContainer } from "../components";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { getTokenBalance, getQuote, displayNumber } from "../utils"
import { ethers } from "ethers";
import { getChannelsForChains, initNode, swap } from '../connext'
import BlinkingValue from './BlinkingValue'

export const SwapLinkContainer = styled.span`
  margin-right: 1em;
`;

function Swap({ chainId, chainInfos, combined, currentChain, account, connextNode, provider }) {
  const [fromTokenBalance, setFromTokenBalance] = useState(false);
  const [fromTokenPairBalance, setFromTokenPairBalance] = useState(false);
  const [toTokenBalance, setToTokenBalance] = useState(false);
  const [toTokenPairBalance, setToTokenPairBalance] = useState(false);
  const [amount, setAmount] = useState(false);
  const [quote, setQuote] = useState(false);
  const [log, setLog] = useState(false);
  const { from, to, symbol } = useParams();

  useEffect(() => {
    if(log){
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
  }, [log]);
  console.log('***log', {
    from, to
  })
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
  // if(fromTokenBalance){
  //   debugger
  // }
  return (
    <Body>
      <h3>

      <IconImage src={fromExchange.exchangeIcon} /> $USDC x ${symbol}
      <IconImage src={fromExchange.chainIcon} />
        ->
        <IconImage src={toExchange.chainIcon} />${symbol} x $USDC<IconImage src={toExchange.exchangeIcon} />
      </h3>
      <Note style={{fontSize:'small'}}>
        <InternalLink to={`/exchanges/${to}-${from}/token/${symbol}`} >(Switch Direction)</InternalLink>
      </Note>
      {chainId && fromToken && toToken && (
        <>
          Your token balance
          <ul>
            <li>
              <BlinkingValue value={displayNumber(fromTokenBalance)}/> ${fromSymbol} on {fromExchange.name}
            </li>
            <li>
              <BlinkingValue value={displayNumber(fromTokenPairBalance)}/> ${symbol} on {fromExchange.name}
            </li>

            <li>
              <BlinkingValue value={displayNumber(toTokenBalance)}/> ${symbol} on {toExchange.name}
            </li>
            <li>
              <BlinkingValue value={displayNumber(toTokenPairBalance)}/> ${fromSymbol} on {toExchange.name}
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
                    <Note>
                      (Profit:
                        <BlinkingValue
                          value={displayNumber((quote[2].formatted - quote[3].formatted), 5)}
                        />${fromSymbol}
                      )
                    </Note>
                    <ActionContainer>
                      {
                        currentChain?.name === fromExchange?.name ? (
                          (parseFloat(fromTokenBalance) - amount > 0) ? (
                            <>
                              <WarningContainer>
                                <h3>Warning</h3>
                                <p style={{width:'80%', margin:'1em auto'}}>
                                This project is submitted for hackathon prototype and not ready for the primte time.
                                Do not spend more than $1 to try out. It will stop working when it runs out of liquidity on the router.
                                Learn more at <Link href="https://docs.connext.network/router-basics">Connext website</Link>
                                </p>
                                <Button
                                    onClick={(e) => {
                                      // const rawAmount = ethers.utils.parseUnits(amount.toString(), fromToken.decimals)
                                      console.log({fromExchange, toExchange, fromToken, fromTokenPair, toToken, toTokenPair})
                                      // debugger
                                      const normalizedAmount = ethers.utils.parseUnits(amount.toString(), Number(fromToken.decimals))
                                      console.log(`amount: ${amount}, normalizedAmount: ${normalizedAmount}`);
                                      swap(
                                        normalizedAmount,
                                        fromToken.id,
                                        fromTokenPair.id,
                                        toToken.id,
                                        toTokenPair.id,
                                        fromExchange.chainId,
                                        toExchange.chainId,
                                        connextNode,
                                        provider,
                                        setLog
                                      )
                                    }}
                                  >
                                    Swap
                                </Button>
                              </WarningContainer>
                            </>

                          ) : (
                            <Note>Not enough ${fromSymbol} on {fromExchange.name} to Continue </Note>  
                          )
                        ) : (
                          <Note>Please connect to {fromExchange?.name} network to Continue </Note>
                        )
                      }
                    </ActionContainer>
                    {log && (
                      <div>
                        Current status: {log}
                      </div>
                    )}
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