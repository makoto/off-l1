import { BrowserNode } from "@connext/vector-browser-node";
import { from } from "apollo-boost";

const routerPublicIdentifier =
  "vector892GMZ3CuUkpyW8eeXfW2bt5W73TWEXtgV71nphXUXAmpncnj8";

export const initNode = async () => {
  const node = new BrowserNode({
    routerPublicIdentifier,
    chainProviders: {
      "56":
        "https://bsc-dataseed.binance.org/",
      "100": "https://rpc.xdaichain.com/",
      "137":
        "https://rpc-mainnet.matic.network",
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
  if (!fromChannel) {
    const res = await node.setup({
      chainId: fromChainId,
      counterpartyIdentifier: routerPublicIdentifier,
      timeout: "100000",
    });
    if (res.isError) {
      throw res.getError();
    }
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
  if (!toChannel) {
    const res = await node.setup({
      chainId: toChainId,
      counterpartyIdentifier: routerPublicIdentifier,
      timeout: "100000",
    });
    if (res.isError) {
      throw res.getError();
    }
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
  fromToken,
  toToken,
  fromChainId,
  toChainId,
  node
) => {
  const { fromChannel, toChannel } = await getChannelsForChains(
    fromChainId,
    toChainId,
    node
  );
};
