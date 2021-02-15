import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import { Body, Button, Header, Image, IconImage, Link, InternalLink } from "../components";
import { useParams } from "react-router-dom";

function Token({
  chainInfos, combined, bnbPrice, ethPrice, daiPrice
}) {
  
  let { symbol } = useParams();
  let c, bnbValue, ethValue, daiValue
  console.log({
    chainInfos,
    bnbPrice,
    daiPrice,
  })
  if(combined.length > 0){
    c = combined.filter(c => c.symbol === symbol)[0]
    bnbValue = c.d.derivedETH * bnbPrice
    ethValue = c.d1.derivedETH * ethPrice
    daiValue = c.d2.derivedETH * daiPrice
  }
  return (
    <Body>
      <h1>{symbol}</h1>
      {combined.length === 0 ? (<>Loading...</>) : (
        <ul>
          <li>
            <h2>BNB-xDAI ${bnbValue.toFixed(2)} - ${daiValue.toFixed(2)} (${(daiValue - bnbValue).toFixed(2)})</h2>
            <ul>
              <li>
                Switch Network to BNB
              </li>
              <li>
                2: Approve USDC 
              </li>
              <li>
                3: Swap from USDC to ${symbol}
              </li>
              <li>
                4: Transfer ${symbol} to xDAI
              </li>
              <li>
                5: Switch Network to xDAI
              </li>
              <li>
                6: Swap ${symbol} to USDC
              </li>
            </ul>
          </li>
          <li>
            BNB-Matic: 
          </li>
          <li>
            xDai-Matic:
          </li>
        </ul>
      )}

    </Body>
  )
}
export default Token;