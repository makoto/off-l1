import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import { Body, Button, Header, Image, IconImage, Link, InternalLink } from "../components";
import { useParams } from "react-router-dom";

function Token() {
    let { symbol } = useParams();
    return (
      <Body>
        {symbol}
      </Body>
    )
  }
  export default Token;