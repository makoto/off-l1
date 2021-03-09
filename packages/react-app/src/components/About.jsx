import React from "react";
import {
  Note,
  Body,
  Button,
  Header,
  Image,
  IconImage,
  Link,
  InternalLink,
} from ".";
import styled from "styled-components";
export const AboutContainer = styled.p`
  max-width: 80%;
  p {
    font-size: large;
  }
  a {
    margin: 0 0.5em;
  }
`;

export const IFrameContainer = styled.p`
  margin: 0 auto;
  width: 560px;
`;

export default function About() {
  return (
    <Body>
      <AboutContainer>
        <h3>About Off L1</h3>
        <p>
          Off L1 is a prototype to showcase 1 click cross chain arbitrage
          potential powered by
          <Link href="https://connext.networ/">Connext</Link>. State channel
          allows you to establish peer to peer micropayment without making
          on-chain transaction each time. Once you transferred your fund into
          on-chain multi-sig smart contract, you can send signed messages to
          instruct your counterparty to take actions on your behalf.
        </p>

        <p>
          In the case of cross chain payment, you have a state channel node
          running on your browser and the node interact a counter party called
          "Router". In theory, you can interact with various smart contracts and
          hop around multiple chains back and forth until you withdraw your fund
          from your node. Read{" "}
          <Link href="https://docs.connext.network/core-concepts">
            Connext core concept section
          </Link>{" "}
          to learn more and watch the demo video to see it in action!
        </p>

        <IFrameContainer>
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/FRWpYjUJTyc"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </IFrameContainer>

        <p>
          For those of you who have no patience watching nearly 10 min video,
          you can browse{" "}
          <Link href="https://speakerdeck.com/makoto_inoue/off-l1">
            the pitch slide
          </Link>
          .
        </p>

        <h5>Risks and limitations</h5>
        <p>
          You can play with the app by swapping a few coins to experience this
          new paradigm but please do NOT use it to seek profit. This app is to
          showcase only. Even though no one can maliciously steal your money
          there are the following risks and limitations.
          <ul>
            <li>
              If you close your browser or refresh the page during the transfer
              the fund may stuck somewhere between. You can withdraw from your
              user page in some scenarios but not all edge cases are tested.
            </li>
            <li>
              If one of the routers is down, again the fund may stuck somewhere
              between.
            </li>
            <li>
              If the router runs out of the fund (aka swap limit) to transfer to
              the other chain, the dapp should not show swap the button but if
              there are any UI bugs, you may be able to send the fund which may
              stuck somewhere between.
            </li>

            <li>
              The potential swap is a estimate. The price may change during the
              transfer which may leads into the net loss.
            </li>

            <li>
              Currently, the swapping token pairs are hard coded at the
              frontend. The author of the dapp thinks they are correct pairs but
              they may be wrong pairs. If the site is compromised, the attacker
              can swap to malicious token pair which could lead you to swap
              assets into meaningless tokens (though as long as the pair retains
              the same rate, you could manually swap back to the original
              token).
            </li>
            <li>
              REPEAT AFTER ME. THIS IS A DEMO SITE AND THERE WILL BE BUGS AND
              YOU MAY LOSE YOUR FUND
            </li>
          </ul>
        </p>

        <h5>Interested in the development?</h5>
        <p>
          The code is open-sourced on{" "}
          <Link href="https://github.com/makoto/off-l1">Github</Link> and you
          can follow the author's Twitter at{" "}
          <Link href="https://twitter.com/makoto_inoue">@makoto_inoue</Link>. If
          you are interested in the development of the project, please{" "}
          <Link href="https://forms.gle/hvjNjUVWFXQGqEce6">
            drop your email here
          </Link>{" "}
          so that you will be the first one to hear the progress.
        </p>
      </AboutContainer>
    </Body>
  );
}
