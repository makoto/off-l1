import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import { Body, Button, Header, Image, IconImage, Link, InternalLink } from ".";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { chain } from "lodash";
import { getProvider } from "../utils"

export const SwapLinkContainer = styled.span`
  margin-right: 1em;
`;

function User() {
  let { account } = useParams()
  const [ userAddress, setUserAddress ] = useState(false);

  if(account.match(/^0x/) && account.length === 42){
    setUserAddress(account)
  }else{
    const mainnetProvider = getProvider()
    mainnetProvider.resolveName(account).then((a)=>{
      setUserAddress(a)
    })
  }
  return (
    <Body>
      <h3>{account}</h3>
      <ul>
        <li> { userAddress }</li>
      </ul>
    </Body>
  )
}
export default User;
