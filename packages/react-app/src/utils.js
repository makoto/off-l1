import { JsonRpcProvider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import { abis } from "@project/contracts";
import { ethers } from "ethers";
import { formatUnits } from "ethers/lib/utils";
const MAX_AMOUNT = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
const ZERO_AMOUNT = '0x'

export async function getBalance(endpoint, address){
  const provider = new JsonRpcProvider(endpoint)
  return provider.getBalance(address)
}

export async function getTokenBalance(endpoint, token, address){
  console.log('****getTokenBalance1')
  const tokenAddress = token.id
  const provider = new JsonRpcProvider(endpoint)
  console.log('****getTokenBalance2', {tokenAddress})
  const erc20 = new Contract(tokenAddress, abis.erc20, provider);
  console.log('****getTokenBalance3', {address})
  const tokenBalance = await erc20.balanceOf(address);
  console.log('****getTokenBalance4', {tokenBalance})
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

function getRouter(exchange){
  const provider = new JsonRpcProvider(exchange.rpcUrl)
  return new Contract(exchange.exchangeRouterAddress, abis.router, provider);
}

export async function getQuote(
  fromExchange,
  toExchange,
  fromToken,
  fromTokenPair,
  toToken,
  toTokenPair,
  amount
){
  const fromRouter = getRouter(fromExchange)
  const rawAmount = ethers.utils.parseUnits(amount.toString(), fromToken.decimals)
  console.log('***getQuote0', {
    amount:amount.toString(),
    rawAmount,
    from:fromToken,
    to:fromTokenPair
  })
  const baseQuotes = await fromRouter.getAmountsOut(rawAmount, [fromToken.id, fromTokenPair.id])

  const toRouter = getRouter(toExchange)
  console.log('***getQuote1.1',{    
    baseQuotes,
    rawAmount:baseQuotes[1],
    rawAmount2:baseQuotes[1].toString(),
    from:toToken,
    to:toTokenPair  
  })
  window.ethers = ethers
  const formatted = ethers.utils.formatUnits(baseQuotes[1], fromTokenPair.decimals)
  const rounded = ethers.FixedNumber.from(formatted).round(toToken.decimals)
  const newRawAmount = ethers.utils.parseUnits(rounded.toString(), toToken.decimals)
  console.log('***getQuote1.2',{    
    formatted,
    newRawAmount,
    fromDecimals:fromTokenPair.decimals,
    toDecimals:toToken.decimals
  })

  const reverseQuotes = await toRouter.getAmountsOut(newRawAmount, [toToken.id, toTokenPair.id])
  return [
    {
      raw:baseQuotes[0],
      formatted:ethers.utils.formatUnits(baseQuotes[0], fromToken.decimals),
      decimals:fromToken.decimals
    },
    {
      raw:baseQuotes[1],
      formatted:ethers.utils.formatUnits(baseQuotes[1], fromTokenPair.decimals),
      decimals:fromTokenPair.decimals
    },
    {
      raw:reverseQuotes[0],
      formatted:ethers.utils.formatUnits(reverseQuotes[0], toToken.decimals),
      decimals:toToken.decimals
    },
    {
      raw:reverseQuotes[1],
      formatted:ethers.utils.formatUnits(reverseQuotes[1], toTokenPair.decimals),
      decimals:toTokenPair.decimals
    }
  ]
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

export function displayNumber(n, digits =3){
  return n ? parseFloat(n).toFixed(digits) : 0
}
