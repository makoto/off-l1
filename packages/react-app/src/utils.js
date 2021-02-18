import { JsonRpcProvider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import { abis } from "@project/contracts";
import { ethers } from "ethers";
const MAX_AMOUNT = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
const ZERO_AMOUNT = '0x'

export async function getBalance(endpoint, address){
  const provider = new JsonRpcProvider(endpoint)
  return provider.getBalance(address)
}

export async function getTokenBalance(endpoint, token, address){
  const tokenAddress = token.id
  const provider = new JsonRpcProvider(endpoint)
  const erc20 = new Contract(tokenAddress, abis.erc20, provider);
  const tokenBalance = await erc20.balanceOf(address);
  return ethers.utils.formatUnits(tokenBalance, token.decimals)
}

export async function getTokenAllowance(exchange, token, ownerAddress){
  const endpoint = exchange.rpcUrl
  const tokenAddress = token.id
  const provider = new JsonRpcProvider(endpoint)
  const erc20 = new Contract(tokenAddress, abis.erc20, provider);
  const tokenBalance = await erc20.allowance(ownerAddress, exchange.exchangeRouterAddress);
  if(tokenBalance.toHexString() === MAX_AMOUNT){
    return 'infinite'
  }else{
    return ethers.utils.formatUnits(tokenBalance, token.decimals)
  }
}

export async function approveToken(exchange, token){
  const endpoint = exchange.rpcUrl
  const provider = new JsonRpcProvider(endpoint)
  const tokenAddress = token.id
  const erc20 = new Contract(tokenAddress, abis.erc20, provider);
  await erc20.approve(exchange.exchangeRouterAddress, MAX_AMOUNT);
}

export async function revokeToken(exchange, token){
  const endpoint = exchange.rpcUrl
  const provider = new JsonRpcProvider(endpoint)
  const tokenAddress = token.id
  const erc20 = new Contract(tokenAddress, abis.erc20, provider);
  await erc20.decreaseAllowance(exchange.exchangeRouterAddress, ZERO_AMOUNT);
}

export async function geQuote(exchange, fromToken, toToken, amount){
  const endpoint = exchange.rpcUrl
  const provider = new JsonRpcProvider(exchange.rpcUrl)
  const router = new Contract(exchange.exchangeRouterAddress, abis.router, provider);
  window.ethers = ethers
  const rawAmount = ethers.utils.parseUnits(amount.toString(), fromToken.decimals)

  console.log({
    rpcUrl:exchange.rpcUrl,
    explorerUrl:exchange.explorerUrl,
    router:exchange.exchangeRouterAddress,abi:abis.router,
    rawAmount, tokens:[fromToken.id, toToken.id]
  })
  const r = await router.WETH()
  console.log('***WETH', {r})
  // const baseQuotes = await router.getAmountsOut(rawAmount, [fromToken.id, toToken.id])
  // console.log('***baseQuotes', {
  //   rawAmount,
  //   baseQuotes,
  //   amount
  // })
  // return baseQuotes
}

export async function getBNB(){
  const result = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=binancecoin%2C%20dai&vs_currencies=usd`)
  return await result.json()
}

// Matic derived price is actually ETH
export async function getEth(){
  const result = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`)
  return await result.json()
}

export async function getDai(){
  const result = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=dai&vs_currencies=usd`)
  return await result.json()
}
