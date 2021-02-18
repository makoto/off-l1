import { BrowserNode } from "@connext/vector-browser-node";
import { ERC20Abi } from "@connext/vector-types";
import { Contract } from "@ethersproject/contracts";

const routerPublicIdentifier =
  "vector892GMZ3CuUkpyW8eeXfW2bt5W73TWEXtgV71nphXUXAmpncnj8";

export const initNode = async () => {
  const node = new BrowserNode({
    routerPublicIdentifier,
    chainProviders: {
      "56": "https://bsc-dataseed.binance.org/",
      "100": "https://rpc.xdaichain.com/",
      "137": "https://rpc-mainnet.matic.network",
    },
  });
  await node.init();

  return node;
};

export const getChannelsForChains = async (fromChainId, toChainId, node) => {
  let fromChannelRes = await node.getStateChannelByParticipants({
    chainId: fromChainId,
    counterparty: routerPublicIdentifier,
  });
  if (fromChannelRes.isError) {
    throw fromChannelRes.getError();
  }
  let fromChannel = fromChannelRes.getValue();
  console.log("fromChannel: ", fromChannel);
  if (!fromChannel) {
    const res = await node.setup({
      chainId: fromChainId,
      counterpartyIdentifier: routerPublicIdentifier,
      timeout: "100000",
    });
    if (res.isError) {
      throw res.getError();
    }
    console.log("res.getValue(): ", res.getValue());
    const channelStateRes = await node.getStateChannel({
      channelAddress: res.getValue(),
    });
    if (channelStateRes.isError) {
      throw res.getError();
    }
    fromChannel = channelStateRes.getValue();
  }

  const toChannelRes = await node.getStateChannelByParticipants({
    chainId: fromChainId,
    counterparty: routerPublicIdentifier,
  });
  if (toChannelRes.isError) {
    throw toChannelRes.getError();
  }
  let toChannel = fromChannelRes.getValue();
  console.log("toChannel: ", toChannel);
  if (!toChannel) {
    const res = await node.setup({
      chainId: toChainId,
      counterpartyIdentifier: routerPublicIdentifier,
      timeout: "100000",
    });
    if (res.isError) {
      throw res.getError();
    }
    console.log("res.getValue(): ", res.getValue());
    const channelStateRes = await node.getStateChannel({
      channelAddress: res.getValue(),
    });
    if (channelStateRes.isError) {
      throw res.getError();
    }
    toChannel = channelStateRes.getValue();
  }
  return { fromChannel, toChannel };
};

export const swap = async (
  swapAmount,
  fromToken,
  toToken,
  fromChainId,
  toChainId,
  node,
  provider
) => {
  console.log(`Starting swap: `, {
    swapAmount,
    fromToken,
    toToken,
    fromChainId,
    toChainId,
  });
  const { fromChannel, toChannel } = await getChannelsForChains(
    fromChainId,
    toChainId,
    node
  );

  const network = await provider.getNetwork();
  if (network.chainId !== fromChainId) {
    throw new Error(
      `Wrong network, expected chainId ${fromChainId}, got ${network.chainId}`
    );
  }

  // TODO: handle ETH
  const fromTokenContract = new Contract(
    fromToken,
    ERC20Abi,
    provider.getSigner()
  );
  const tx = await fromTokenContract.transfer(
    fromChannel.channelAddress,
    swapAmount
  );
  console.log("Sent approval tx, waiting for confirmation: ", tx);
  const receipt = await tx.wait();
  console.log("Tx confirmed, receipt: ", receipt);

  // reconcile deposit on from chain
  const depositRes = await node.reconcileDeposit({
    channelAddress: fromChannel.channelAddress,
    assetId: fromToken,
  });
  if (depositRes.isError) {
    throw depositRes.getError();
  }
  console.log(`Deposit complete: `, depositRes.getValue());

  // withdraw with swap data
};
