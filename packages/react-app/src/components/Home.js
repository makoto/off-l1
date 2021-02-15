import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";

import { Body, Button, Header, Image, IconImage, Link, InternalLink } from "../components";

function Home({chainInfos, combined}) {
    return (
      <Body>
      <h1>🐰Off L1</h1>
      <div>Swap between Uniswap clones</div>
      {(combined?.length > 0) ? (
          <table>
          <tr>
            <th>Coin</th>
            <th><IconImage src={'https://pancakeswap.info/favicon.png'} alt="react-logo" /> on {chainInfos[0].name}</th>
            <th><IconImage src={'https://quickswap.exchange/logo_circle.png'} alt="react-logo" /> on {chainInfos[1].name}</th>
            <th><IconImage src={'https://honeyswap.org/images/favicon.svg'} alt="react-logo" /> on {chainInfos[2].name}</th>
          </tr>
          {combined.map(c => (
              <tr>
              <td>
                <InternalLink
                  href={`/token/${c.symbol}`}
                >{c.symbol}</InternalLink>                
              </td>
              <td>
                ${(c.data[0].derivedETH * chainInfos[0].unitPrice).toFixed(2)}
              </td>
              <td>
                ${(c.data[1].derivedETH * chainInfos[1].unitPrice).toFixed(2)}
              </td>
              <td>
                ${(c.data[2].derivedETH * chainInfos[2].unitPrice).toFixed(2)}
              </td>
              </tr>
          ))}
          </table>
      ) : ('Loading...')}
      </Body>
    )
  }
  export default Home;