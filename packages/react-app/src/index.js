import React from "react";
import ReactDOM from "react-dom";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";
import "./index.css";
import App from "./App";
import bsc from "./assets/bsc.png";
import pancake from "./assets/pancake.png";
import matic from "./assets/matic.png";
import quick from "./assets/quick.png";
import honey from "./assets/honey.png";
import xdai from "./assets/xdai.png";

// You should replace this url with your own and put it into a .env file
// See all subgraphs: https://thegraph.com/explorer/

const bscClient = new ApolloClient({
  uri: "https://api.bscgraph.org/subgraphs/name/cakeswap"
  // uri: "https://info.burgerswap.org/subgraphs/name/burgerswap/platform"
});

const bitQueryClient = new ApolloClient({
  uri: "https://graphql.bitquery.io"
})

const maticClient = new ApolloClient({
  // uri: "https://graph01.ginete.in/subgraphs/name/matic/quickswap"
  uri: "https://api.thegraph.com/subgraphs/name/sameepsi/quickswap"
});

const xdaiClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/1hive/uniswap-v2"
});

const chainInfos = [{
  chainId:56,
  chainIcon: bsc,
  name:'BSC',
  client:bscClient,
  bitQueryClient,
  tokenSymbol:'BNB',
  tokenAddress:'0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
  exchangeName:'Pancake',
  exchangeIcon: pancake,
  instructionGuide:'https://academy.binance.com/en/articles/connecting-metamask-to-binance-smart-chain',
  explorerUrl:'https://bscscan.com',
  exchangeRouterAddress:'0x05ff2b0db69458a0750badebc4f9e13add608c7f',
  rpcUrl: 'https://bsc-dataseed1.defibit.io'
},{
  chainId:137,
  chainIcon: matic,
  name:'Matic',
  client:maticClient,
  tokenSymbol:'MATIC',
  tokenAddress:'0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
  exchangeName:'Quick',
  exchangeIcon:quick,
  instructionGuide:'https://docs.matic.network/docs/develop/metamask/config-matic',
  exchangeRouterAddress:'0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
  explorerUrl:'https://explorer-mainnet.maticvigil.com',
  rpcUrl: 'https://rpc-mainnet.matic.network'
},{
  chainId:100,
  chainIcon:xdai,
  name:'xDai',
  client:xdaiClient,
  tokenSymbol:'xDAI',
  tokenAddress:'0x6b175474e89094c44da98b954eedeac495271d0f',
  exchangeName:'Honey',
  exchangeIcon:honey,
  instructionGuide:'https://www.xdaichain.com/for-users/wallets/metamask/metamask-setup',
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
