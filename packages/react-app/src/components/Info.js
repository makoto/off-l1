import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/react-hooks";
import { Body, Button, Note, Title, Header, Image, IconImage, Link, InternalLink, Input, ActionContainer, WarningContainer } from "../components";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { getTokenBalance, getQuote, displayNumber, getProvider } from "../utils"
import { ethers } from "ethers";
import { swap, getRouterBalances, getChannelsForChains, verifyRouterCapacityForTransfer } from '../connext'
import BlinkingValue from './BlinkingValue'
import Chart from "./Chart"
import moment from 'moment'
import _ from 'lodash';
import {
  GET_HOUR_DATA,
} from "../graphql/subgraph";

export const SwapLinkContainer = styled.span`
  margin-right: 1em;
`;

function parseData(data, label){
  let dict = {}
  data && data.tokenDayDatas && data.tokenDayDatas.map(d => {
    let key = moment(parseInt(d.date) * 1000).format("MMM Do kk:mm:ss")
    let r = {
      // date: moment(parseInt(d.date) * 1000).format("MMM Do kk:mm:ss")
      date: d.date
    }
    r[`${label}Volume`] = parseInt(d.dailyVolumeUSD)
    r[`${label}Liquidity`] = parseInt(d.totalLiquidityUSD)
    r[`${label}Price`] = parseFloat(d.priceUSD)
    dict[key] = r
  })
  return dict
}

function Info({ chainId, chainInfos, combined, currentChain, account, connextNode, provider }) {
  const { from, to, symbol } = useParams();

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
  console.log('******', {
    fromToken, fromTokenPair, toToken, toTokenPair
  })
  const { data:fromData  } = useQuery(GET_HOUR_DATA, {
    client:fromExchange.client,
    variables:{ tokenId: fromTokenPair?.id },
    skip: !fromTokenPair?.id
  });

  const { data:toData  } = useQuery(GET_HOUR_DATA, {
    client:toExchange.client,
    variables:{ tokenId: toToken?.id },
    skip: !toToken?.id
  });
  if(chainInfos && chainInfos.length > 0){
  }else{
    return('')
  }

  let historyData = [], historyData1, historyData2, num
  historyData1 = parseData(fromData, fromTokenPair?.exchangeName)
  historyData2 = parseData(toData, toToken?.exchangeName)
  const dateUnion = _.union(Object.values(historyData1).map(d => d.date), Object.values(historyData2).map(d => d.date)).sort()
  window.historyData1 = historyData1
  window.historyData2 = historyData2
  window.dateUnion = dateUnion
  console.log('***history', {dateUnion, fromTokenPair, toToken, historyData, historyData1, historyData2})
  for (let index = 0; index < dateUnion.length; index++) {
    const element = dateUnion[index];
    const key = moment(element * 1000).format("MMM Do kk:mm:ss")
    const d2 = historyData2[key]
    const d1 = historyData1[key]
    let pctDiff, d1Price, d2Price
    if (d1 && d2){
      const diff = (d1[`${fromTokenPair?.exchangeName}Price`] - d2[`${toToken?.exchangeName}Price`])
      const mid = (d1[`${fromTokenPair?.exchangeName}Price`] + d2[`${toToken?.exchangeName}Price`]) / 2
      pctDiff =  diff / mid * 100
      if(pctDiff > 30) pctDiff = 30
      if(pctDiff < -30) pctDiff = -30
    }
    if(d1){
      d1Price = d1[`${fromTokenPair?.exchangeName}Price`]?.toFixed(3)
    }
    if(d2){
      d2Price = d2[`${toToken?.exchangeName}Price`]?.toFixed(3)
    }
    historyData[index] = {
      ...d2, ...d1, ...{
        [`${fromTokenPair?.exchangeName}Price`]:d1Price,
        [`${toToken?.exchangeName}Price`]:d2Price,
        pctDiff,
        date:key, d1date:d1?.date, d2date:d2?.date}
    }
  }
  console.log('***his', {historyData, num})
  return(
    <>
      <Body>
        <Title>
          <IconImage src={fromExchange.chainIcon} />${symbol}
          <IconImage src={fromExchange.exchangeIcon} />
            ->
            <IconImage src={toExchange.chainIcon} />${symbol}<IconImage src={toExchange.exchangeIcon} />
        </Title>
        {
          historyData1.length === 0 && historyData2.length === 0 ? ('Loading...') : (
            <>
              <Note style={{fontSize:'small', margin:'1em'}}>
                (<InternalLink to={`/exchanges/${to}-${from}/tokeninfo/${symbol}`} >Switch Direction</InternalLink> |
                <InternalLink to={`/exchanges/${to}-${from}/token/${symbol}`} >Swap</InternalLink>)
              </Note>
              {historyData2?.length === 0 && ('(Mainnet data not available)')}
                <Chart data={historyData } xKey={'date'} yKeys={[`${fromTokenPair?.exchangeName}Price`, `${toToken?.exchangeName}Price`]} />
                <Chart data={historyData } xKey={'date'} yKeys={['pctDiff']} />
                <Chart data={historyData } xKey={'date'} brush={true} yKeys={[`${fromTokenPair?.exchangeName}Volume`, `${toToken?.exchangeName}Volume`]} />
                <Chart data={historyData } xKey={'date'} yKeys={[`${fromTokenPair?.exchangeName}Liquidity`, `${toToken?.exchangeName}Liquidity`]} />
            </>
          )
        }
      </Body>
    </>
  )
}
export default Info;