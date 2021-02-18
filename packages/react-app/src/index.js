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
  uri: "https://graph01.ginete.in/subgraphs/name/matic/quickswap"
});

const xdaiClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/1hive/uniswap-v2"
});

const chainInfos = [{
  chainId:56,
  chainIcon: 'https://dex-bin.bnbstatic.com/static/images/favicon.png',
  name:'BSC',
  client:bscClient,
  tokenSymbol:'BNB',
  tokenAddress:'0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
  exchangeName:'Pancake',
  exchangeIcon:'https://pancakeswap.info/favicon.png',
  explorerUrl:'https://bscscan.com',
  exchangeRouterAddress:'0x05ff2b0db69458a0750badebc4f9e13add608c7f',
  rpcUrl: 'https://bsc-dataseed1.defibit.io'
},{
  chainId:137,
  chainIcon: 'https://matic.network/favicon-48.png',
  name:'Matic',
  client:maticClient,
  tokenSymbol:'MATIC',
  tokenAddress:'0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
  exchangeName:'Quick',
  exchangeIcon:'https://quickswap.exchange/logo_circle.png',
  exchangeRouterAddress:'0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
  explorerUrl:'https://explorer-mainnet.maticvigil.com',
  rpcUrl: 'https://rpc-mainnet.matic.network'
},{
  chainId:100,
  chainIcon:'https://gblobscdn.gitbook.com/spaces%2F-Lpi9AHj62wscNlQjI-l%2Favatar.png',
  name:'xDai',
  client:xdaiClient,
  tokenSymbol:'xDAI',
  tokenAddress:'0x6b175474e89094c44da98b954eedeac495271d0f',
  exchangeName:'Honey',
  exchangeIcon:'https://honeyswap.org/images/favicon.svg',
  exchangeRouterAddress:'0x1C232F01118CB8B424793ae03F870aa7D0ac7f77',
  explorerUrl:'https://blockscout.com/poa/xdai',
  rpcUrl:'https://xdai.poanetwork.dev'
  // rpcUrl: 'https://rpc.xdaichain.com'
}]

ReactDOM.render(
  <ApolloProvider client = {chainInfos[0].client}>
    <App
      chainInfos={chainInfos}      
    />
  </ApolloProvider>,
  document.getElementById("root"),
);
