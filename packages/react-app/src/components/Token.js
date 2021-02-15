import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import { Body, Button, Header, Image, IconImage, Link, InternalLink } from "../components";
import { useParams } from "react-router-dom";

function Token({
  chainInfos, combined
}) {
  let { symbol } = useParams();
  let tokenData
  if(combined.length > 0){
    tokenData = combined.filter(c => c.symbol === symbol)[0]
  }
  return (
    <Body>
      <h1>{symbol}</h1>
      <ul>
      {combined.length === 0 ? (<>Loading...</>) : (
        chainInfos.map((c, i) => {
          return chainInfos.map((cc, ii) => {
            if(c.name !== cc.name){
              let cValue = tokenData.data[i].derivedETH * c.unitPrice
              let ccValue = tokenData.data[ii].derivedETH * cc.unitPrice
              let diff = ((ccValue - cValue) / ((cValue + ccValue) / 2)) * 100
              if(diff > 0){
                return(
                  <li>{c.name} -> {cc.name} = ${cValue.toFixed(2)} -> ${ccValue.toFixed(2)}({diff.toFixed(2)} %)</li>
                )  
              }
            }
          })
        })
      )}
      </ul>
    </Body>
  )
}
export default Token;