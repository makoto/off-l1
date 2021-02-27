import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/react-hooks";
import { Body, Button, Header, Image, IconImage, Link, InternalLink } from ".";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { getChannelForChain, withdraw } from '../connext'

import { getProvider, displayNumber } from "../utils"
import { BSC_TOKEN_TRANSFERS } from "../graphql/subgraph";
import { ethers } from "ethers"
export const SwapLinkContainer = styled.span`
  margin-right: 1em;
`;

function User({chainInfos, connextNode, pancakeData, quickData, honeyData}) {
  let { account } = useParams()
  const [channels, setChannels] = useState({});
  const tokenData = [pancakeData, quickData, honeyData]

  const [ userAddress, setUserAddress ] = useState(false);
  let { loading, error, data } = useQuery(BSC_TOKEN_TRANSFERS, {
    client:chainInfos[0].bitQueryClient,
    variables:{
      address:userAddress
    },
    skip:!userAddress
  });
  console.log('***data', {data})
  console.log('***channels', {channels})
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

  let counter = 0
  return (
    <Body>
      <h2>{account}</h2>
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
