import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/react-hooks";
import {
  Body,
  Button,
  Note,
  Image,
  IconImage,
  Link,
  InternalLink,
  Input,
  ActionContainer,
  WarningContainer,
} from ".";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import {
  getTokenBalance,
  getQuote,
  displayNumber,
  getProvider,
} from "../utils";
import { ethers } from "ethers";
import {
  swap,
  getRouterBalances,
  getChannelsForChains,
  verifyRouterCapacityForTransfer,
} from "../connext";
import BlinkingValue from "./BlinkingValue";
import moment from "moment";
import _ from "lodash";

export const SwapLinkContainer = styled.span`
  margin-right: 1em;
`;

function Swap({
  chainId,
  chainInfos,
  combined,
  currentChain,
  account,
  connextNode,
  provider,
}) {
  const [fromTokenBalance, setFromTokenBalance] = useState(false);
  const [fromTokenPairBalance, setFromTokenPairBalance] = useState(false);
  const [toTokenBalance, setToTokenBalance] = useState(false);
  const [toTokenPairBalance, setToTokenPairBalance] = useState(false);
  const [amount, setAmount] = useState(false);
  const [quote, setQuote] = useState(false);
  const [log, setLog] = useState([]);
  const { from, to, symbol } = useParams();
  const [preTransferFromBalance, setPreTransferFromBalance] = useState(false);
  const [postTransferFromBalance, setPostTransferFromBalance] = useState(false);
  const [preTransferToBalance, setPreTransferToBalance] = useState(false);
  const [postTransferToBalance, setPostTransferToBalance] = useState(false);
  const [preTransferBalance, setPreTransferBalance] = useState(false);
  const [postTransferBalance, postPreTransferBalance] = useState(false);
  const [transferComplete, setTransferComplete] = useState(false);
  const [startTime, setStartTime] = useState(false);
  const [endTime, setEndTime] = useState(false);
  const [fromChannel, setFromChannel] = useState(false);
  const [toChannel, setToChannel] = useState(false);
  const [routerOnchainBalance, setRouterOnchainBalance] = useState(false);

  function setLogHandler(msg, option = {}) {
    let obj = { ...option, msg };
    setLog((_log) => [..._log, [msg, option.tx, option.chainId]]);
  }

  useEffect(() => {
    if (log.length > 0) {
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

      getRouterBalances({
        fromChain: fromExchange.chainId,
        toChain: toExchange.chainId,
        fromToken: fromToken.id,
        toToken: toToken.id,
        node: connextNode,
      }).then((b) => {
        console.log("***getRouterBalances0", b);
      });
      if (_.last(log)[0]?.match("7/7")) {
        getTokenBalance(fromExchange.rpcUrl, fromToken, account).then((b) => {
          setPostTransferFromBalance(b);
        });
        getTokenBalance(toExchange.rpcUrl, toTokenPair, account).then((b) => {
          setPostTransferToBalance(b);
        });
        setTransferComplete(true);
        setEndTime(moment());
      }
    }
  }, [log]);

  if (chainInfos && chainInfos.length > 0) {
  } else {
    return "";
  }
  const fromExchange = chainInfos.filter((c) => c.exchangeName === from)[0];
  const toExchange = chainInfos.filter((c) => c.exchangeName === to)[0];

  let fromTokenData,
    toTokenData,
    fromToken,
    fromTokenPair,
    toToken,
    toTokenPair,
    number;
  const fromSymbol = "USDC";
  if (combined.length > 0) {
    fromTokenData = combined.filter((c) => c.symbol === fromSymbol)[0];
    toTokenData = combined.filter((c) => c.symbol === symbol)[0];
    fromToken = fromTokenData.data?.filter((d) => d?.exchangeName === from)[0];
    fromTokenPair = toTokenData.data?.filter(
      (d) => d?.exchangeName === from
    )[0];
    toToken = toTokenData.data?.filter((d) => d?.exchangeName === to)[0];
    toTokenPair = fromTokenData.data?.filter((d) => d?.exchangeName === to)[0];
  }

  if (connextNode && fromExchange && toExchange && !fromChannel && !toChannel) {
    getChannelsForChains(
      fromExchange.chainId,
      toExchange.chainId,
      connextNode
    ).then((b) => {
      console.log("***getChannelsForChains", { b });
      setFromChannel(b.fromChannel);
      setToChannel(b.toChannel);
    });
  }

  if (
    fromExchange &&
    toExchange &&
    fromToken &&
    toToken &&
    account &&
    !fromTokenBalance
  ) {
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
  let transferFromDiff, transferToDiff, totalDiff, percentage;
  if (postTransferFromBalance) {
    transferFromDiff = postTransferFromBalance - preTransferFromBalance;
    transferToDiff = postTransferToBalance - preTransferToBalance;
    totalDiff = transferFromDiff + transferToDiff;
    percentage = (totalDiff / amount) * 100;
  }
  const firstQuote = quote[1];
  const isReadyToSwap =
    currentChain?.name === fromExchange?.name &&
    parseFloat(fromTokenBalance) - amount > 0 &&
    routerOnchainBalance - firstQuote?.formatted > 1;

  console.log("****", { chainId, fromToken, toToken, isReadyToSwap });
  return (
    <Body>
      <h3>
        <IconImage src={fromExchange.exchangeIcon} /> $USDC x ${symbol}
        <IconImage src={fromExchange.chainIcon} />-{">"}
        <IconImage src={toExchange.chainIcon} />${symbol} x $USDC
        <IconImage src={toExchange.exchangeIcon} />
      </h3>
      <Note style={{ fontSize: "small" }}>
        (
        <InternalLink to={`/exchanges/${to}-${from}/token/${symbol}`}>
          Switch Direction
        </InternalLink>
        |
        <InternalLink to={`/exchanges/${to}-${from}/tokeninfo/${symbol}`}>
          Info
        </InternalLink>
        )

      </Note>
      {chainId && fromToken && toToken && (
        <>
          Your token balance
          <ul>
            <li>
              <BlinkingValue value={displayNumber(fromTokenBalance)} /> $
              {fromSymbol} on {fromExchange.name}
            </li>
            <li>
              <BlinkingValue value={displayNumber(fromTokenPairBalance)} /> $
              {symbol} on {fromExchange.name}
            </li>
            {preTransferBalance && (
              <li>
                In transit: {preTransferBalance} and {postPreTransferBalance}
              </li>
            )}
            <li>
              <BlinkingValue value={displayNumber(toTokenBalance)} /> ${symbol}{" "}
              on {toExchange.name}
            </li>
            <li>
              <BlinkingValue value={displayNumber(toTokenPairBalance)} /> $
              {fromSymbol} on {toExchange.name}
            </li>
          </ul>
        </>
      )}
      <>
        {fromToken && toToken && (
          <>
            {toToken && toChannel ? (
              <>
                Type the amount you want to swap
                <Input
                  placeholder="0.0"
                  onChange={(e) => {
                    number = parseFloat(e.target.value);
                    console.log("***BEFORE", e.target.value, {
                      fromExchange,
                      fromToken,
                      toToken,
                      number,
                    });
                    setAmount(number);
                    if (toChannel && number > 0) {
                      getQuote(
                        fromExchange,
                        toExchange,
                        fromToken,
                        fromTokenPair,
                        toToken,
                        toTokenPair,
                        number
                      ).then((c) => {
                        console.log("***getQuote3", { c });
                        setQuote(c);
                        verifyRouterCapacityForTransfer(
                          getProvider(toExchange.rpcUrl),
                          toToken, // toAssetId,
                          toChannel, // withdrawChannel,//
                          number, // amount
                          { hardcodedRate: 1 } //swap
                        ).then((b) => {
                          console.log(displayNumber(b.routerOnchainBalance));
                          setRouterOnchainBalance(b.routerOnchainBalance);
                        });
                      });
                    }
                  }}
                ></Input>
                {quote && (
                  <>
                    {displayNumber(quote[0].formatted)} ${fromSymbol} is{" "}
                    {displayNumber(quote[1].formatted)} ${symbol} on{" "}
                    {fromExchange.name} <br />
                    {displayNumber(quote[2].formatted)} ${symbol} is{" "}
                    {displayNumber(quote[3].formatted)} ${fromSymbol} on{" "}
                    {toExchange.name} <br />
                    <Note>
                      Profit Estimate:
                      <BlinkingValue
                        value={`${displayNumber(
                          quote[3].formatted - quote[0].formatted,
                          5
                        )} ${fromSymbol} (${displayNumber(
                          ((quote[3].formatted - quote[0].formatted) / amount) *
                            100
                        )}%)`}
                      />
                    </Note>
                    Swap limit: {displayNumber(routerOnchainBalance)} ${symbol}{" "}
                    on {fromExchange.name}(
                    {displayNumber(routerOnchainBalance - quote[1].formatted)})
                    {isReadyToSwap && (
                      <Note style={{ color: "orange", fontSize: "large" }}>
                        This is a demo dapp. Read{" "}
                        <InternalLink to="/about">
                          Risk and limitation
                        </InternalLink>{" "}
                        before you interact
                      </Note>
                    )}
                    <ActionContainer>
                      {currentChain?.name === fromExchange?.name ? (
                        parseFloat(fromTokenBalance) - amount > 0 ? (
                          routerOnchainBalance - quote[1].formatted > 1 ? (
                            <>
                              <WarningContainer>
                                {/* <h3>Warning</h3>
                                <p style={{width:'80%', margin:'1em auto'}}>
                                This project is submitted for hackathon prototype and not ready for the primte time.
                                Do not spend more than $1 to try out. It will stop working when it runs out of liquidity on the router.
                                Learn more at <Link href="https://docs.connext.network/router-basics">Connext website</Link>
                                </p> */}
                                <Button
                                  onClick={(e) => {
                                    // const rawAmount = ethers.utils.parseUnits(amount.toString(), fromToken.decimals)
                                    console.log({
                                      fromExchange,
                                      toExchange,
                                      fromToken,
                                      fromTokenPair,
                                      toToken,
                                      toTokenPair,
                                    });
                                    // debugger
                                    const normalizedAmount = ethers.utils.parseUnits(
                                      amount.toString(),
                                      Number(fromToken.decimals)
                                    );
                                    console.log(
                                      `amount: ${amount}, normalizedAmount: ${normalizedAmount}`
                                    );
                                    // setPreTransferFromBalance
                                    // postTransferFromBalance, setPostTransferFromBalance] = useState(false);
                                    // const [preTransferToBalance, setPreTransferToBalance] = useState(false);
                                    // const [postTransferToBalance, setPostTransferToBalance] = useState(false);
                                    getTokenBalance(
                                      fromExchange.rpcUrl,
                                      fromToken,
                                      account
                                    ).then((b) => {
                                      setPreTransferFromBalance(b);
                                    });
                                    getTokenBalance(
                                      toExchange.rpcUrl,
                                      toTokenPair,
                                      account
                                    ).then((b) => {
                                      setPreTransferToBalance(b);
                                    });

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
                                      setLogHandler
                                    );
                                    setTransferComplete(false);
                                    setStartTime(moment());
                                  }}
                                >
                                  Swap
                                </Button>
                              </WarningContainer>
                            </>
                          ) : (
                            <Note>
                              Not enough capacity on Router. Please lower the
                              amount{" "}
                            </Note>
                          )
                        ) : (
                          <Note>
                            Not enough ${fromSymbol} on {fromExchange.name} to
                            Continue{" "}
                          </Note>
                        )
                      ) : (
                        <>
                          <Note>
                            Please connect to {fromExchange?.name} network and
                            refresh the page{" "}
                          </Note>
                          <Note
                            style={{ fontSize: "large", textAlign: "center" }}
                          >
                            (
                            <Link href={fromExchange.instructionGuide}>
                              Guide:How to add the network to Metamask
                            </Link>
                            )
                          </Note>
                        </>
                      )}
                    </ActionContainer>
                    {log.length > 0 && (
                      <div>
                        <Note style={{ color: "orange" }}>
                          Do not refresh this page!!!
                        </Note>
                        <ul>
                          {log.map(([msg, tx, chainId]) => {
                            let c = chainInfos.filter(
                              (c) => c.chainId === chainId
                            )[0];
                            console.log("****setLog", {
                              c,
                              chainId,
                              chainInfos,
                            });
                            return (
                              <li>
                                <BlinkingValue value={msg} />
                                {tx && (
                                  <Link href={`${c?.explorerUrl}/tx/${tx}`}>
                                    {tx.slice(0, 5)}...
                                  </Link>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                        {transferComplete && (
                          <ul>
                            <li>
                              Time spent: {endTime.diff(startTime, "second")}{" "}
                              seconds
                            </li>
                            <li>
                              Total difference: {displayNumber(totalDiff)} $
                              {fromSymbol} ({displayNumber(percentage, 3)} %)
                              {totalDiff > 0 ? "😸" : "😿"}
                            </li>
                            <li>
                              {fromExchange.name}:{" "}
                              {displayNumber(preTransferFromBalance)} -{" "}
                              {displayNumber(postTransferFromBalance)} ={" "}
                              {displayNumber(transferFromDiff)}
                            </li>
                            <li>
                              {toExchange.name}:{" "}
                              {displayNumber(preTransferToBalance)} -{" "}
                              {displayNumber(postTransferToBalance)} ={" "}
                              {displayNumber(transferToDiff)}
                            </li>
                          </ul>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              "Loading..."
            )}
          </>
        )}
      </>
    </Body>
  );
}
export default Swap;
