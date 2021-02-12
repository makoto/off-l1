import React from "react";
import { Contract } from "@ethersproject/contracts";
import { getDefaultProvider } from "@ethersproject/providers";
import { useQuery } from "@apollo/react-hooks";

import { Body, Button, Header, Image, Link } from "./components";
import logo from "./ethereumLogo.png";
import useWeb3Modal from "./hooks/useWeb3Modal";

import { addresses, abis } from "@project/contracts";
import GET_TRANSFERS from "./graphql/subgraph";
import { ConnextModal } from "@connext/vector-modal";

async function readOnChainData() {
  // Should replace with the end-user wallet, e.g. Metamask
  const defaultProvider = getDefaultProvider();
  // Create an instance of an ethers.js Contract
  // Read more about ethers.js on https://docs.ethers.io/v5/api/contract/contract/
  const ceaErc20 = new Contract(addresses.ceaErc20, abis.erc20, defaultProvider);
  // A pre-defined address that owns some CEAERC20 tokens
  const tokenBalance = await ceaErc20.balanceOf("0x3f8CB69d9c0ED01923F11c829BaE4D9a4CB6c82C");
  console.log({ tokenBalance: tokenBalance.toString() });
}

function WalletButton({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
  return (
    <Button
      onClick={() => {
        if (!provider) {
          loadWeb3Modal();
        } else {
          logoutOfWeb3Modal();
        }
      }}
    >
      {!provider ? "Connect Wallet" : "Disconnect Wallet"}
    </Button>
  );
}

function App() {
  const { loading, error, data } = useQuery(GET_TRANSFERS);
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();
  const [showModal, setShowModal] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !error && data && data.transfers) {
      console.log({ transfers: data.transfers });
    }
  }, [loading, error, data]);

  return (
    <>
      <button onClick={() => setShowModal(true)}>Hello World</button>
      <ConnextModal
        showModal={showModal}
        onClose={() => setShowModal(false)}
        onReady={params => console.log('MODAL IS READY =======>', params)}
        depositAddress={''}
        withdrawalAddress={''}
        routerPublicIdentifier="vector7tbbTxQp8ppEQUgPsbGiTrVdapLdU5dH7zTbVuXRf1M4CEBU9Q"
        depositAssetId={'0xbd69fC70FA1c3AED524Bb4E82Adc5fcCFFcD79Fa'}
        depositChainId={5}
        depositChainProvider="https://goerli.infura.io/v3/"
        withdrawAssetId={'0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1'}
        withdrawChainId={80001}
        withdrawChainProvider="https://rpc-mumbai.matic.today"
      />
    </>
  );

  // return (
  //   <div>
  //     <Header>
  //       <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
  //     </Header>
  //     <Body>
  //       <Image src={logo} alt="react-logo" />
  //       <p>
  //         Edit <code>packages/react-app/src/App.js</code> and save to reload.
  //       </p>
  //       {/* Remove the "hidden" prop and open the JavaScript console in the browser to see what this function does */}
  //       <Button hidden onClick={() => readOnChainData()}>
  //         Read On-Chain Balance
  //       </Button>
  //       <Link href="https://ethereum.org/developers/#getting-started" style={{ marginTop: "8px" }}>
  //         Learn Ethereum
  //       </Link>
  //       <Link href="https://reactjs.org">Learn React</Link>
  //       <Link href="https://thegraph.com/docs/quick-start">Learn The Graph</Link>
  //     </Body>
  //   </div>
  // );
}

export default App;
