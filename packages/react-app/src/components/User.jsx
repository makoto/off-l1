import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/react-hooks";
import { Body, Button, Label, IconImage, Link, Note } from ".";
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

function User({chainInfos, connextNode, pancakeData, quickData, honeyData, account}) {
  let { account:userName } = useParams()
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
    if(userName.match(/^0x/) && userName.length === 42){
      setUserAddress(userName)
    }else{
      const mainnetProvider = getProvider()
      mainnetProvider.resolveName(userName).then((a)=>{
        setUserAddress(a)
      })
    }
  }, [userName, userAddress]);
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
  let tokenTransfers = []
  if(matictransfers){
    let filtered = matictransfers.sort(a => moment(a.block_signed_at).unix() ).slice(0,5)
      .map(t => {
        let formatted = ethers.utils.formatUnits(t.transfers[0].delta, t.decimals)
        let direction = t.from_address.toLowerCase() === userAddress.toLowerCase() ? "IN" : "OUT"
        let timestamp = moment(t.block_signed_at)
        return({
          chainName:'Matic',
          chainIndex:1,
          unix:timestamp.unix(),
          timestamp,
          amount: formatted,
          symbol:t.symbol,
          direction,
          hash:t.tx_hash,
          explorerUrl:`https://explorer-mainnet.maticvigil.com/tx/${t.tx_hash}`
        })
      })
    tokenTransfers = [...tokenTransfers, ...filtered]
  }

  if(bscTokenTransfers?.ethereum){
    let filtered = bscTokenTransfers?.ethereum.transfers
    .filter(s => ['USDC', 'USDT', 'DAI', 'BNB'].includes(s.currency.symbol)).slice(0,5)
    .map(t => {
      let direction = t.receiver.address.toLowerCase() === userAddress.toLowerCase() ? "IN" : "OUT"
      let timestamp = moment(t.block.timestamp.time)
      return({
        chainName:'BSC',
        chainIndex:0,
        timestamp,
        unix:timestamp.unix(),
        amount: t.amount,
        symbol:t.currency.symbol,
        direction,
        hash:t.transaction.hash,
        explorerUrl:`https://bscscan.com/tx/${t.transaction.hash}`
      })
    })
    tokenTransfers = [...tokenTransfers, ...filtered].sort((a,b) => b.unix - a.unix)
  }
  console.log('***tokenTransfers', {tokenTransfers, userAddress, account})
  let counter = 0
  return (
    <Body>
      <h2>{userName}</h2>
      { userAddress && account && account.toLowerCase() === userAddress.toLowerCase() && (
        <>
          <h3>Outstanding balance in your channel</h3>
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
          {Object.keys(channels).length === 0 ? (<p>Looking up balances...</p>) : counter === 0 ? (<p>No outstanding balance in your channel</p>) : '' }
        </>
      )}

      {/* <h3>Token Balances</h3>
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
      <Label color='red' >Data is not available</Label> */}

      <h3>Recent Token transfers</h3>
      <ul>
        {
          !bscTokenTransfersLoading ? (
            tokenTransfers.map(o => {
              return(<li><IconImage src={chainInfos[o.chainIndex].chainIcon} /> {o.timestamp.format("yyyy-MM-DD HH:mm:SS")}: {displayNumber(o.amount, 3)} {o.symbol}
                <Label color={o.direction === 'IN' ? '#4CAF50' : '#ff9800'} >{o.direction}</Label> (
                <Link href={o.explorerUrl}>{o.hash.slice(0,5)}...</Link>
              )</li>)
            })
          ) : (<p>Loading...</p>)
        }
      </ul>
      <Note>xDAI Data is not available</Note>
      
    </Body>
  )
}
export default User;
