import React from "react";
import ReactDOM from "react-dom";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";
import "./index.css";
import App from "./App";

// You should replace this url with your own and put it into a .env file
// See all subgraphs: https://thegraph.com/explorer/

const bscClient = new ApolloClient({
  uri: "https://api.bscgraph.org/subgraphs/name/cakeswap"
});

const maticClient = new ApolloClient({
  uri: "https://graph.ginete.in/subgraphs/name/matic/quickswap"
});

const xdaiClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/1hive/uniswap-v2"
});

const chainInfos = [{
  chainId:56,
  name:'BSC',
  client:bscClient,
  tokenSymbol:'BNB',
  tokenAddress:'0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
  explorerUrl:'https://bscscan.com',
  rpcUrl: 'https://bsc-dataseed1.defibit.io'
},{
  chainId:137,
  name:'Matic',
  client:maticClient,
  tokenSymbol:'MATIC',
  tokenAddress:'0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
  explorerUrl:'https://explorer-mainnet.maticvigil.com',
  rpcUrl: 'https://rpc-mainnet.matic.network'
},{
  chainId:100,
  name:'xDai',
  client:xdaiClient,
  tokenSymbol:'xDAI',
  tokenAddress:'0x6b175474e89094c44da98b954eedeac495271d0f',
  explorerUrl:'https://blockscout.com/poa/xdai',
  rpcUrl: 'https://rpc.xdaichain.com'
}]

ReactDOM.render(
  <ApolloProvider client = {chainInfos[0].client}>
    <App
      chainInfos={chainInfos}      
    />
  </ApolloProvider>,
  document.getElementById("root"),
);
