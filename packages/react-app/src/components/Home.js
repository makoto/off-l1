import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";

import { Body, Button, Header, Image, IconImage, Link, InternalLink } from "../components";
import { TOKEN_DATA } from "../graphql/subgraph";

// https://api.coingecko.com/api/v3/simple/price?ids=binancecoin%2C%20dai&vs_currencies=usd
export async function getBNB(){
  const result = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=binancecoin%2C%20dai&vs_currencies=usd`)
  return await result.json()
}

export async function getDai(){
  const result = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=dai&vs_currencies=usd`)
  return await result.json()
}

export async function getMatic(){
  const result = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=binancecoin%2C%20dai&vs_currencies=usd`)
  return await result.json()
}

function Home({chainInfos}) {
    const [ daiPrice, setDaiPrice ] = useState(false);
    const [ bnbPrice, setBnbPrice ] = useState(false);
    getDai().then(r => {
      setDaiPrice(r.dai.usd)
    })
    getBNB().then(r => {
      setBnbPrice(r.binancecoin.usd)
    })
  
    const { loading, error, data } = useQuery(TOKEN_DATA, {
      client:chainInfos[0].client
    });
  
    // const { loading:loading1, error:error1, data:data1 } = useQuery(TOKEN_DATA, {
    //   client:chainInfos[1].client
    // });
    const { loading:loading2, error:error2, data:data2 } = useQuery(TOKEN_DATA, {
      client:chainInfos[2].client
    });
  
    let combined = []
    if(data && data2){
      for (let i = 0; i < data?.tokens?.length; i++) {
        const d = data?.tokens[i];
        if(d.symbol.match(/DAI/)){
          console.log(0, d.symbol)
        }
        if(d.symbol.match(/BTC/)){
          console.log(0, d.symbol)
        }
        if(d.symbol.match(/ETH/)){
          console.log(0, d.symbol)
        }
  
        for (let j = 0; j < data2?.tokens?.length; j++) {
          const d2 = data2?.tokens[j];
          if(i == 0 && d2.symbol.match(/DAI/)){
            console.log(2, d2.symbol)
          }
          if(i == 0 && d2.symbol.match(/BTC/)){
            console.log(2, d2.symbol)
          }
          if(i == 0 && d2.symbol.match(/ETH/)){
            console.log(2, d2.symbol)
          }
    
  
          if(d.symbol === d2.symbol){
            combined.push({
              symbol:d.symbol,
              d,
              d2
            })
          }
        }
      }  
    }
    return (
      <Body>
      <h1>🐰Off L1</h1>
      <div>Swap between Uniswap clones</div>
      {(data && data2 && daiPrice && bnbPrice) ? (
          <table>
          <tr>
            <th>Coin</th>
            <th><IconImage src={'https://pancakeswap.info/favicon.png'} alt="react-logo" /> on {chainInfos[0].name}</th>
            <th><IconImage src={'https://honeyswap.org/images/favicon.svg'} alt="react-logo" /> on {chainInfos[2].name}</th>
            <th><IconImage src={'https://quickswap.exchange/logo_circle.png'} alt="react-logo" /> on {chainInfos[1].name}</th>
          </tr>
          {combined.map(c => (
              <tr>
              <td>
                <InternalLink href={`/token/${c.symbol}`}>{c.symbol}</InternalLink>                
              </td>
              <td>
                  ${(c.d.derivedETH * bnbPrice).toFixed(2)}
              </td>
              <td>
                  ${(c.d2.derivedETH * daiPrice).toFixed(2)}
              </td>
              <td>
                  ${(c.d2.derivedETH * daiPrice).toFixed(2)}
              </td>
              </tr>
          ))}
          </table>
      ) : ('Loading...')}
      </Body>
    )
  }
  export default Home;