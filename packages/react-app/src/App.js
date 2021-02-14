import React, { useState } from "react";
import { Contract } from "@ethersproject/contracts";
import { getDefaultProvider } from "@ethersproject/providers";
import { useQuery } from "@apollo/react-hooks";

import { Body, Button, Header, Image, IconImage } from "./components";
import logo from "./ethereumLogo.png";
import useWeb3Modal from "./hooks/useWeb3Modal";

import { addresses, abis } from "@project/contracts";
import { TOKEN_DATA } from "./graphql/subgraph";
import { ConnextModal } from "@connext/vector-modal";

async function readOnChainData() {
  // Should replace with the end-user wallet, e.g. Metamask
  const defaultProvider = getDefaultProvider();
  // Create an instance of an ethers.js Contract
  // Read more about ethers.js on https://docs.ethers.io/v5/api/contract/contract/
  const ceaErc20 = new Contract(addresses.ceaErc20, abis.erc20, defaultProvider);
  // A pre-defined address that owns some CEAERC20 tokens
  const tokenBalance = await ceaErc20.balanceOf("0x3f8CB69d9c0ED01923F11c829BaE4D9a4CB6c82C");
  console.log({ tokenBalance: tokenBalance.toString() });
}

function WalletButton({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
  return (
    <Button
      onClick={() => {
        if (!provider) {
          loadWeb3Modal();
        } else {
          logoutOfWeb3Modal();
        }
      }}
    >
      {!provider ? "Connect Wallet" : "Disconnect Wallet"}
    </Button>
  );
}

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


function App({chainInfos}) {
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

  console.log('***data', {data,  data2})
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();
  const [showModal, setShowModal] = React.useState(false);
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
  console.log('***combined', {combined})
  React.useEffect(() => {
    if (!loading && !error && data && data.transfers) {
      console.log({ transfers: data.transfers });
    }
  }, [loading, error, data]);

  // return (
  //   <>
  //     <button onClick={() => setShowModal(true)}>Hello World</button>
  //     <ConnextModal
  //       showModal={showModal}
  //       onClose={() => setShowModal(false)}
  //       onReady={params => console.log('MODAL IS READY =======>', params)}
  //       depositAddress={''}
  //       withdrawalAddress={'0x5A384227B65FA093DEC03Ec34e111Db80A040615'}
  //       routerPublicIdentifier="vector7tbbTxQp8ppEQUgPsbGiTrVdapLdU5dH7zTbVuXRf1M4CEBU9Q"
  //       depositAssetId={'0xbd69fC70FA1c3AED524Bb4E82Adc5fcCFFcD79Fa'}
  //       depositChainId={5}
  //       depositChainProvider="https://goerli.infura.io/v3/10c3a0fa44b94deba2a896658844a49c"
  //       withdrawAssetId={'0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1'}
  //       withdrawChainId={80001}
  //       withdrawChainProvider="https://rpc-mumbai.matic.today"
  //     />
  //   </>
  // );

  return (
    <div>
      <Header>
        <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
      </Header>
      <Body>
        <h1>🐰Off L1</h1>
        <div>Swap between Uniswap clone exchanges</div>
        {/* Remove the "hidden" prop and open the JavaScript console in the browser to see what this function does */}
        <Button hidden onClick={() => readOnChainData()}>
          Read On-Chain Balance
        </Button>
        {(data && data2 && daiPrice && bnbPrice) ? (
          <table>
            <tr>
              <th>Coin</th>
              <th><IconImage src={'https://pancakeswap.info/favicon.png'} alt="react-logo" /> {chainInfos[0].name}</th>
              <th><IconImage src={'https://honeyswap.org/images/favicon.svg'} alt="react-logo" /> {chainInfos[2].name}</th>
              <th><IconImage src={'https://quickswap.exchange/logo_circle.png'} alt="react-logo" /> {chainInfos[1].name}</th>
            </tr>
            {combined.map(c => (
              <tr>
                <td>{c.symbol}</td>
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
    </div>
  );
}

export default App;
