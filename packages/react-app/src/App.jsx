import React, { useEffect, useState } from "react";
import { Contract } from "@ethersproject/contracts";
import { getDefaultProvider } from "@ethersproject/providers";
import { useQuery } from "@apollo/react-hooks";
import styled from "styled-components";

import { Body, Button, Header, NetworkContainer } from "./components";
import Home from "./components/Home";
import Token from "./components/Token";
import Swap from "./components/Swap";
import Info from "./components/Info";
import User from "./components/User";
import About from "./components/About";
import useWeb3Modal from "./hooks/useWeb3Modal";
import { getBalance, getProvider, getTokenBalance,  getBNB, getEth, getDai } from "./utils"
import pancakeData from './data/pancake.json'
import honeyData from './data/honey.json'
import quickData from './data/quick.json'

import { addresses, abis } from "@project/contracts";
import { TOKEN_DATA } from "./graphql/subgraph";
import {
  HashRouter as Router,
  Switch,
  Route,
  Link,
} from "react-router-dom";
import { ethers } from "ethers";
import { initNode } from "./connext";

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

function App({chainInfos}) {
  const [ bnbPrice, setBnbPrice ] = useState(false);
  const [ ethPrice, setEthPrice ] = useState(false);
  const [ daiPrice, setDaiPrice ] = useState(false);
  const [ account, setAccount ] = useState(false);
  const [ userName, setUserName ] = useState(false);
  const [ balance, setBalance ] = useState(false);
  const [node, setNode] = useState(false);
  const [ chainId, setChainId ] = useState(false);

  // console.log('***honeyData', {honeyData})
  useEffect(() => {
    const init = async () => {
      try{
        const _node = await initNode();
        setNode(_node);  
      }catch(e){
        console.log('Initiation error', {e})
      }
    };
    init();
  }, []);
  getBNB().then(r => {
    setBnbPrice(r.binancecoin.usd)
    chainInfos[0].unitPrice = r.binancecoin.usd
  })
  getEth().then(r => {
    setEthPrice(r.ethereum.usd)
    chainInfos[1].unitPrice = r.ethereum.usd
  })
  getDai().then(r => {
    setDaiPrice(r.dai.usd)
    chainInfos[2].unitPrice = r.dai.usd
  })
  window.pancakeData =pancakeData
  window.pancakeData.data.tokens.map(t => t.id)
  // debugger
  console.log(JSON.stringify(pancakeData.data.tokens.map(t => t.id)))

  let { loading, error, data } = useQuery(TOKEN_DATA, {
    client:chainInfos[0].client,
    variables:{
      tokenIds:pancakeData.data.tokens.map(t => t.id)
    },
  });

  const { loading:loading1, error:error1, data:data1 } = useQuery(TOKEN_DATA, {
    client:chainInfos[1].client,
    variables:{
      tokenIds:quickData.data.tokens.map(t => t.id)
    }
  });
  const { loading:loading2, error:error2, data:data2 } = useQuery(TOKEN_DATA, {
    client:chainInfos[2].client,
    variables:{
      tokenIds:honeyData.data.tokens.map(t => t.id)
    }
  });
  let combined = []
  if(data1 && data2){
    for (let i = 0; i < data?.tokens?.length; i++) {
      const d = data?.tokens[i];
      d.exchangeName = chainInfos[0].exchangeName
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
        d2.exchangeName = chainInfos[2].exchangeName
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
          for (let k = 0; k < data1?.tokens?.length; k++) {
            const d1 = data1?.tokens[k];
            d1.exchangeName = chainInfos[1].exchangeName
            if(d1.symbol === d2.symbol){
              combined.push({
                symbol:d1.symbol,
                data:[d, d1, d2]
                // data:[null, d1, d2]
              })    
            }
          }
        }
      }
    }
  }
  let networkName
  if(window.location.href.match(/\/exchanges\/Quick/)){
    networkName = 'matic'
  }else if (window.location.href.match(/\/exchanges\/Honey/)){
    networkName = 'xdai'
  }else if (window.location.href.match(/\/exchanges\/Pancake/)){
    networkName = 'bsc'
  }

  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal({
    NETWORK:networkName
  });

  if(provider){
    provider.getNetwork().then(({chainId}) => {
      setChainId(chainId)
    })
  }
  window.provider = provider
  let currentChain, balanceToDisplay
  if(chainId){
    currentChain = chainInfos.filter(c => c.chainId === chainId )[0]
  }
  window.ethers = ethers
  if(provider?.getSigner){
    let signer = provider.getSigner()
    provider.listAccounts().then(a => {
      setAccount(a[0])
      const mainnetProvider = getProvider()
      window.ethers = ethers
      window.provider = provider
      mainnetProvider.lookupAddress(a[0]).then((name)=>{
        setUserName(name)
      })
      if(currentChain){
        getBalance(currentChain.rpcUrl, a[0]).then(b => {
          setBalance(ethers.utils.formatEther(b))
        })    
      }
    })
  }
  if(balance){
    balanceToDisplay = parseFloat(balance).toFixed(2)
  }
  return (
    <Router>
      <div>
        <Header>
          <Link
            to={`/`}
            style={{ textDecoration: "none", fontSize: "xx-large" }}
          >
            🐰
          </Link>
          <NetworkContainer>
            <>
            <Link to='/about' >About</Link>
            {chainId && (
              (currentChain) ? (
                <div>
                  Connected to {currentChain.name} as
                  <Link
                    to={`/user/${userName || account}`}
                  >
                  { userName || `${account?.slice(0, 5)}...` }
                  </Link> (
                  {balanceToDisplay} ${currentChain.tokenSymbol})
                </div>
              ) : (`Unsupported Network`)
            )}
            <WalletButton
              provider={provider}
              loadWeb3Modal={loadWeb3Modal}
              logoutOfWeb3Modal={logoutOfWeb3Modal}
            />
            </>
          </NetworkContainer>
        </Header>
        <Switch>
          <Route path="/token/:symbol">
            <Token chainInfos={chainInfos} combined={combined} />
          </Route>
          <Route path="/exchanges/:from-:to/token/:symbol">
            <Swap
              chainId={chainId}
              chainInfos={chainInfos}
              currentChain={currentChain}
              combined={combined}
              account={account}
              connextNode={node}
              provider={provider}
            />
          </Route>
          <Route path="/exchanges/:from-:to/tokeninfo/:symbol">
            <Info
              chainId={chainId}
              chainInfos={chainInfos}
              currentChain={currentChain}
              combined={combined}
              account={account}
              connextNode={node}
              provider={provider}
            />
          </Route>
          <Route path="/about">
            <About />
          </Route>
          <Route path="/user/:account">
            <User
              pancakeData={pancakeData}
              honeyData={honeyData}
              quickData={quickData}
              chainInfos={chainInfos}
              connextNode={node}
              account={account}
            />
          </Route>
          <Route path="/">
            <Home chainInfos={chainInfos} combined={combined} />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
