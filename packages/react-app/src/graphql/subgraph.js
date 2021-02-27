import { gql } from "apollo-boost";

export const TOKEN_DATA = gql`
  query($tokenIds:[String]){
    tokens(first:50, orderBy:tradeVolumeUSD, orderDirection: desc, where:{
      totalLiquidity_gt:10,
      tradeVolume_gt:1,
      id_in:$tokenIds
    }){
      id,
      symbol,
      decimals,
      totalLiquidity
      tradeVolumeUSD
      untrackedVolumeUSD
      txCount
      derivedETH
    }
  }
`

export const BSC_TOKEN_TRANSFERS = gql`
  query($address:String!) {
    ethereum(network: bsc){
        transfers(receiver:{is:$address}, sender:{is:"0x169d436de25ed3356fc67fdc4ff54090938099c6"}){
          block{
            timestamp{
              time
            }
          }
          currency{
            address
            symbol
            decimals
            tokenType
          }
          amount
          sender{
            address
          }
        }
      }
    }
`

export const BSC_TOKEN_BALANCES = gql`
  query (
    $address: String!
  ) {
    ethereum(network: bsc) {
      address(address: {is: $address}) {
        balances {
          currency {
            address
            symbol
            tokenType
          }
          value
        }
      }
    }
  }
`
