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