import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/react-hooks";
import { Body, Button, Header, Image, IconImage, Link, InternalLink } from ".";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { getChannelForChain, withdraw } from '../connext'
import moment from 'moment'

import { getProvider, getMaticTokenBalances, getMaticTokenTransfers, displayNumber } from "../utils"
import { BSC_TOKEN_BALANCES, BSC_TOKEN_TRANSFERS } from "../graphql/subgraph";
import { ethers } from "ethers"
export const SwapLinkContainer = styled.span`
  margin-right: 1em;
`;
const MATIC_TOKEN_SYMBOLS = ['USDC', 'USDT', 'DAI', 'MATIC']

function User({chainInfos, connextNode, pancakeData, quickData, honeyData}) {
  let { account } = useParams()
  const [channels, setChannels] = useState({});
  const tokenData = [pancakeData, quickData, honeyData]
  // debugger
  const maticTokens = quickData.data.tokens.filter(t => MATIC_TOKEN_SYMBOLS.includes(t.symbol))
  const [ userAddress, setUserAddress ] = useState(false);
  const [ maticBalances, setMaticBalances ] = useState([]);
  const [ matictransfers, setMatictransfers ] = useState([]);
  let { loading:bscTokenTransfersLoading , data:bscTokenTransfers = {} } = useQuery(BSC_TOKEN_TRANSFERS, {
    client:chainInfos[0].bitQueryClient,
    variables:{
      address:userAddress
    },
    skip:!userAddress
  });
  let { loading:bscTokenBalancesLoading, data:bscTokenBalances = {} } = useQuery(BSC_TOKEN_BALANCES, {
    client:chainInfos[0].bitQueryClient,
    variables:{
      address:userAddress
    },
    skip:!userAddress
  });

  console.log('***data', {bscTokenTransfers, matictransfers})
  console.log('***channels', {channels})
  console.log('***bscTokenBalances', {bscTokenBalances})
  useEffect(() => {
    if(userAddress){
      getMaticTokenBalances(userAddress).then((m) => {
        let tokens = m.data.items.filter(i => MATIC_TOKEN_SYMBOLS.includes(i.contract_ticker_symbol))
        setMaticBalances(tokens)
      })
      
      getMaticTokenTransfers(userAddress, maticTokens).then((t) => {
        setMatictransfers(t)
      })
    }
  }, [userAddress])
  useEffect(() => {
    if(account.match(/^0x/) && account.length === 42){
      setUserAddress(account)
    }else{
      const mainnetProvider = getProvider()
      mainnetProvider.resolveName(account).then((a)=>{
        setUserAddress(a)
      })
    }
  }, [account, userAddress]);
  useEffect(() => {
    if(connextNode && chainInfos && channels){
      for (let i = 0; i < chainInfos.length; i++) {
        const c = chainInfos[i];
        const channelKey = c.exchangeName
        if(!channels[channelKey]){
          getChannelForChain(
            c.chainId,
            connextNode
          ).then(b => {
            setChannels( prevState => {
              return { ...prevState, [channelKey]: {
                channel:b?.value,
                channelMeta:c,
                channelIndex:i
              }}
            })
          })
        }
      }
    }
  }, [chainInfos, connextNode]);

  if(bscTokenTransfers?.ethereum){
    // debugger
  }
  let counter = 0
  return (
    <Body>
      <h2>{account}</h2>
      <h3>Token Balances</h3>
      <h4>Matic</h4>
        <ul>
          {maticBalances.map(b => {
            let formatted = ethers.utils.formatUnits(b.balance, b.contract_decimals)
            return(<li>{displayNumber(formatted)} {b.contract_ticker_symbol}</li>)
          })}
        </ul>
      <h4>Binance Smart chain</h4>
        {bscTokenBalancesLoading ? (<p>Loading...</p>) : (
          <ul>
            {bscTokenBalances?.ethereum && bscTokenBalances?.ethereum.address[0].balances.map(b => {
              if(['USDC', 'USDT', 'DAI', 'BNB'].includes(b.currency.symbol)){
                return(<li>{displayNumber(b.value, 5)} {b.currency.symbol}</li>)
              }
            })}
          </ul>
        )}
      <h4>xDAI</h4>
      Data is not available
      <h3>Rcent Token transfers</h3>
      <h4>Matic</h4>
        {matictransfers && matictransfers
          .sort(a => moment(a.block_signed_at).unix() ).slice(0,5)
          .map(t => {
          // if(parseInt(t.value) > 0){
          if(true){
            let formatted = ethers.utils.formatUnits(t.value, t.decimals)
            window.displayNumber = displayNumber
            window.moment = moment
            let dateFormatted = moment(t.block_signed_at).format("yyyy-MM-DD HH:MM:SS")
            let direction = t.from_address.toLowerCase() === userAddress.toLowerCase() ? "IN" : "OUT"
            let sentense = `${dateFormatted}: ${displayNumber(formatted, 3)} ${t.symbol} ${direction} (${t.tx_hash.slice(0,5)}...)`
            let o = {
              timestamp: moment(t.block_signed_at),
              amount: formatted,
              symbol:t.symbol,
              direction,
              hash:t.tx_hash,
              explorerUrl:`https://explorer-mainnet.maticvigil.com/tx/${t.tx_hash}`
            }
            return(<li>{o.timestamp.format("yyyy-MM-DD HH:MM:SS")}: {displayNumber(o.amount, 3)} {o.symbol} {o.direction} (
              <Link href={o.explorerUrl}>{o.hash.slice(0,5)}...</Link>
            )</li>)
          }
        })}
      <h4>Binance Smart chain</h4>
        {bscTokenTransfersLoading ? (<p>Loading...</p>) : (
          <ul>
            {
              bscTokenTransfers?.ethereum && bscTokenTransfers?.ethereum.transfers
                .filter(s => ['USDC', 'USDT', 'DAI', 'BNB'].includes(s.currency.symbol))
                .map(t => {
                  let direction = t.receiver.address.toLowerCase() === userAddress.toLowerCase() ? "IN" : "OUT"
                  let o = {
                    timestamp: moment(t.block.timestamp.time),
                    amount: t.amount,
                    symbol:t.currency.symbol,
                    direction,
                    hash:t.transaction.hash,
                    explorerUrl:`https://bscscan.com/tx/${t.transaction.hash}`
                  }
                  return(<li>{o.timestamp.format("yyyy-MM-DD HH:MM:SS")}: {displayNumber(o.amount, 3)} {o.symbol} {o.direction} (
                    <Link href={o.explorerUrl}>{o.hash.slice(0,5)}...</Link>
                  )</li>)
                }).slice(0,5)
            }
          </ul>
        )}
      <h4>xDAI</h4>
      Data is not available
      <h3>Balances in your channel</h3>
      { Object.entries(channels).map(([key, c]) => {
        let counter = 0
        return (
          <>
            { c.channel.balances.some(b => b.amount.some(c => c > 0) ) && (
              <>
                <h4>{key}</h4>
                <ul>
                {c.channel.assetIds.map((assetId, i) => {
                  let token = tokenData[c?.channelIndex]?.data?.tokens?.filter(t => t.id === assetId.toLowerCase())[0]
                  let balance = c.channel.balances[i]
                  return balance.amount.map((a, j) => {
                    if(parseInt(a) > 0){
                      let formatted = ethers.utils.formatUnits(a, token.decimals)
                      counter+=1
                      return(
                        <li>
                          {displayNumber(formatted)} {token.symbol}
                          <Button
                            onClick={
                              () => {
                                withdraw(
                                  connextNode,
                                  assetId,
                                  a,
                                  c.channel.channelAddress,
                                  userAddress
                                ).then(r => {
                                  console.log('****response', r)
                                })
                              }
                            }
                          >
                            Withdraw
                          </Button>
                        </li>
                      )
                    }
                  })
                })}
                </ul>
              </>
            )}
          </>
        )
      })}
      {Object.keys(channels).length === 0 ? (<p>Looking up balances...</p>) : counter === 0 ? (<p>There is no balance in your channel</p>) : '' }
    </Body>
  )
}
export default User;
