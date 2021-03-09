import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import { Body, Button, Header, Image, IconImage, Link, InternalLink } from ".";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { chain } from "lodash";
export const SwapLinkContainer = styled.span`
  margin-right: 1em;
`;

function Token({ chainInfos, combined }) {
  let { symbol } = useParams();
  let tokenData;
  if (combined.length > 0) {
    tokenData = combined.filter((c) => c.symbol === symbol)[0];
  }
  return (
    <Body>
      <h1>{symbol}</h1>
      <ul>
        {combined.length === 0 ? (
          <>Loading...</>
        ) : (
          chainInfos.map((c, i) => {
            return chainInfos.map((cc, ii) => {
              console.log(tokenData.data[i], { cc, ii });
              if (
                tokenData.data[i] &&
                tokenData.data[ii] &&
                c.name !== cc.name
              ) {
                let cValue = tokenData.data[i].derivedETH * c.unitPrice;
                let ccValue = tokenData.data[ii].derivedETH * cc.unitPrice;
                let diff =
                  ((ccValue - cValue) / ((cValue + ccValue) / 2)) * 100;
                if (diff > 0) {
                  return (
                    <li>
                      <SwapLinkContainer>
                        <IconImage src={c.exchangeIcon} />${cValue.toFixed(2)}
                        &nbsp; -{">"}
                        <IconImage src={cc.exchangeIcon} />${ccValue.toFixed(2)}
                        ({diff.toFixed(2)} %)
                      </SwapLinkContainer>
                      <InternalLink
                        to={`/exchanges/${c.exchangeName}-${cc.exchangeName}/token/${symbol}`}
                      >
                        Swap
                      </InternalLink>
                    </li>
                  );
                }
              }
            });
          })
        )}
      </ul>
    </Body>
  );
}
export default Token;
