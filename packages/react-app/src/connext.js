import { BrowserNode } from "@connext/vector-browser-node";
import { ERC20Abi } from "@connext/vector-types";
import { Contract } from "@ethersproject/contracts";
import UniswapWithdrawHelper from "@connext/vector-withdraw-helpers/artifacts/contracts/UniswapWithdrawHelper/UniswapWithdrawHelper.sol/UniswapWithdrawHelper.json";
import { JsonRpcProvider } from "@ethersproject/providers";
import { getBalanceForAssetId } from "@connext/vector-utils";
import { BigNumber } from "@ethersproject/bignumber";

const routerPublicIdentifier =
  "vector892GMZ3CuUkpyW8eeXfW2bt5W73TWEXtgV71nphXUXAmpncnj8";

const withdrawHelpers = {
  137: "0xD1CC3E4b9c6d0cb0B9B97AEde44d4908FF0be507",
  56: "0xad654314d3F6590243602D14b4089332EBb5227D",
  100: "0xe12639c8C458f719146286f8B8b7050176577a62",
};

const chainProviders = {
  "56": "https://bsc-dataseed.binance.org/",
  "100": "https://rpc.xdaichain.com/",
  "137": "https://rpc-mainnet.matic.network",
};

const chainJsonProviders = {
  "56": new JsonRpcProvider("https://bsc-dataseed.binance.org/"),
  "100": new JsonRpcProvider("https://rpc.xdaichain.com/"),
  "137": new JsonRpcProvider("https://rpc-mainnet.matic.network"),
};

// TODO: FILL IN ADDRESSES
const uniswapRouters = {
  137: "0xD1CC3E4b9c6d0cb0B9B97AEde44d4908FF0be507",
  56: "0xD1CC3E4b9c6d0cb0B9B97AEde44d4908FF0be507",
  100: "0xD1CC3E4b9c6d0cb0B9B97AEde44d4908FF0be507",
};

export const initNode = async () => {
  const node = new BrowserNode({
    routerPublicIdentifier,
    chainProviders,
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

  // // TODO: handle ETH
  const balance = getBalanceForAssetId(fromChannel, fromToken, "bob");
  if (BigNumber.from(balance).gt(swapAmount)) {
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
  }

  // withdraw with swap data
  const fromChainIdHelperContract = new Contract(
    withdrawHelpers[fromChainId],
    UniswapWithdrawHelper.abi,
    chainJsonProviders[fromChainId]
  );
  const fromSwapData = await fromChainIdHelperContract.getCallData({
    amountIn: swapAmount,
    amountOutMin: 1, // TODO: maybe change this, but this will make the swap always succeed
    router: uniswapRouters[fromChainId],
    to: fromChannel.channelAddress,
    tokenA: fromToken,
    tokenB: toToken,
    path: [fromToken, toToken],
  });
  console.log("fromSwapData: ", fromSwapData);

  // await withdrawal event

  // transfer cross chain

  // withdraw to swap

  // await withdrawal event

  // withdraw to address
};
