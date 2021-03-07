import styled from "styled-components";
import {
  Link as RouterLink
} from "react-router-dom";

export const Note = styled.p`
  color: grey;
  margin: 5px;
`

export const Highlight = styled.span`
  background-color: orange;
`

export const ActionContainer = styled.p`
   margin: 1em;
`

export const WarningContainer = styled.p`
  color: orange;
  text-align: center;
`

export const Header = styled.header`
  background-color: #ffe2d1;
  color: black;
  min-height: 70px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-left: 2em;
  color: #5E4C59;
`;

export const Title = styled.h3`
  margin:1em;
`

export const Body = styled.body`
  align-items: center;
  background-color: #5E4C5A;
  color: white;
  display: flex;
  flex-direction: column;
  font-size: calc(10px + 2vmin);
  justify-content: center;
  min-height: calc(100vh - 70px);
`;

export const Image = styled.img`
  height: 40vmin;
  margin: 16px;
  pointer-events: none;
`;

export const IconImage = styled.img`
  height: 0.7em;
  width: 0.7em;
  margin-left:0.3em;
  margin-right:0.3em;
  pointer-events: none;
`;

export const Link = styled.a.attrs({
  target: "_blank",
  rel: "noopener noreferrer",
})`
  color: #ffe2d1;
  margin-top: 10px;
`;

export const InternalLink = RouterLink

export const Button = styled.button`
  background-color: white;
  border: none;
  border-radius: 8px;
  color: #5E4C5A;
  cursor: pointer;
  font-size: 16px;
  text-align: center;
  vertical-align: middle;
  text-decoration: none;
  margin: 0px 20px;
  padding: 12px 24px;

  ${props => props.disabled && "disabled"} :{
    opacity:0.5;
  }
`;

export const NetworkContainer = styled.span`
  display: flex;
  vertical-align: center;
  align-items: center;
  a{
    color: #5E4C5A;
    margin: 0 5px;
  }
`

export const Input = styled.input`
 padding: 1em;
 margin: 1em;
`

export const Label = styled.span`
  margin: 0.5em;
  padding: 8px;
  font-size: x-small;
  text-align: center;
  vertical-align: middle;
  width: 50px;
  display: inline-block;
  border-radius: 0.35rem;
  ${props =>  `background-color:${props.color}`  }
`

export const ChartContainer = styled.div`
  margin: 1em;
`