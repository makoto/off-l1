import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import { Body, Button, Header, Image, IconImage, Link, InternalLink } from ".";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { chain } from "lodash";
export const SwapLinkContainer = styled.span`
  margin-right: 1em;
`;

function User() {
  let { account } = useParams();
  
  return (
    <Body>
      <h3>{account}</h3>
      <ul>
      </ul>
    </Body>
  )
}
export default User;
