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
  query($address: String!){
    ethereum(network: bsc){
      transfers(any: [ 
        {sender: {is:$address}}  
        {receiver: {is:$address}} 
      ], options:{ desc:"block.timestamp.unixtime" }){
        block{
          timestamp{
            time
            unixtime
          }
        }
        transaction{
          hash
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
        receiver{
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


export const GET_HOUR_DATA = gql`
  query tokenDayDatas($tokenId: String!){
    tokenDayDatas(first: 100, orderBy: date, orderDirection: desc, where: { token: $tokenId}) {
      id
      date
      token
      { id symbol }
      priceUSD
      dailyVolumeUSD
      totalLiquidityUSD
    }
  }
`;