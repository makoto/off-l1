import { BrowserNode } from "@connext/vector-browser-node";
import {
  ConditionalTransferCreatedPayload,
  ERC20Abi,
  FullChannelState,
  TransferNames,
} from "@connext/vector-types";
import { Contract, utils, constants, ethers, providers } from "ethers";

import UniswapWithdrawHelper from "@connext/vector-withdraw-helpers/artifacts/contracts/UniswapWithdrawHelper/UniswapWithdrawHelper.sol/UniswapWithdrawHelper.json";
import { JsonRpcProvider } from "@ethersproject/providers";
import { getBalanceForAssetId, getRandomBytes32 } from "@connext/vector-utils";

import { BigNumber } from "@ethersproject/bignumber";

const routerPublicIdentifier =
  "vector892GMZ3CuUkpyW8eeXfW2bt5W73TWEXtgV71nphXUXAmpncnj8";

const withdrawHelpers: { [chainId: number]: string } = {
  137: "0xD1CC3E4b9c6d0cb0B9B97AEde44d4908FF0be507",
  56: "0xad654314d3F6590243602D14b4089332EBb5227D",
  100: "0xe12639c8C458f719146286f8B8b7050176577a62",
};

const chainProviders: { [chainId: number]: string } = {
  56: "https://bsc-dataseed.binance.org/",
  100: "https://rpc.xdaichain.com/",
  137: "https://rpc-mainnet.matic.network",
};

const chainJsonProviders: { [chainId: number]: providers.JsonRpcProvider } = {
  56: new JsonRpcProvider("https://bsc-dataseed.binance.org/"),
  100: new JsonRpcProvider("https://rpc.xdaichain.com/"),
  137: new JsonRpcProvider("https://rpc-mainnet.matic.network"),
};

// TODO: FILL IN ADDRESSES
const uniswapRouters: { [chainId: number]: string } = {
  137: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
  56: "0x05ff2b0db69458a0750badebc4f9e13add608c7f",
  100: "0x1C232F01118CB8B424793ae03F870aa7D0ac7f77",
};

export const initNode = async () => {
  const node = new BrowserNode({
    routerPublicIdentifier,
    chainProviders,
  });
  await node.init();

  return node;
};

export const getOnchainBalance = async (
  ethProvider: any,
  assetId: string,
  address: any
) => {
  (window as any).constants = constants;
  (window as any).Contract = Contract;
  const balance =
    assetId === constants.AddressZero
      ? await ethProvider.getBalance(address)
      : await new Contract(assetId, ERC20Abi, ethProvider).balanceOf(address);
  return balance;
};

export const verifyRouterCapacityForTransfer = async (
  ethProvider: JsonRpcProvider,
  toToken: {
    id: any;
    decimals: string | number | ethers.BigNumber | utils.Bytes;
  },
  withdrawChannel: FullChannelState,
  transferAmount: any,
  swap: { hardcodedRate: number }
) => {
  const toAssetId = toToken.id;
  console.log(`verifyRouterCapacityForTransfer for ${transferAmount}`, {
    toAssetId,
    withdrawChannel,
  });
  const routerOnchain = await getOnchainBalance(
    ethProvider,
    toAssetId,
    withdrawChannel.alice
  );
  console.log(`verifyRouterCapacityForTransfer2`, { routerOnchain });
  const routerOffchain = BigNumber.from(
    getBalanceForAssetId(withdrawChannel, toAssetId, "bob")
  );
  return {
    routerOnchainBalance: ethers.utils.formatUnits(
      routerOnchain,
      toToken.decimals
    ),
    routerOffchainBalacne: ethers.utils.formatUnits(
      routerOffchain,
      toToken.decimals
    ),
  };
};

export const getChannelForChain = async (
  chainId: any,
  node: {
    getStateChannelByParticipants: (arg0: {
      chainId: any;
      counterparty: string;
    }) => any;
  }
) => {
  return await node.getStateChannelByParticipants({
    chainId: chainId,
    counterparty: routerPublicIdentifier,
  });
};

export const withdraw = async (
  node: {
    withdraw: (arg0: {
      assetId: any;
      amount: any;
      channelAddress: any;
      recipient: any;
    }) => any;
  },
  assetId: any,
  amount: any,
  channelAddress: any,
  recipient: boolean
) => {
  console.log("**** withdraw", {
    assetId,
    amount,
    channelAddress,
    recipient,
  });
  return await node.withdraw({
    assetId,
    amount,
    channelAddress,
    recipient,
  });
};

export const getChannelsForChains = async (
  fromChainId: any,
  toChainId: any,
  node: {
    getStateChannelByParticipants: (arg0: {
      chainId: any;
      counterparty: string;
    }) => any;
    setup: (arg0: {
      chainId: any;
      counterpartyIdentifier: string;
      timeout: string;
    }) => any;
    getStateChannel: (arg0: { channelAddress: any }) => any;
  }
) => {
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
    chainId: toChainId,
    counterparty: routerPublicIdentifier,
  });
  if (toChannelRes.isError) {
    throw toChannelRes.getError();
  }
  let toChannel = toChannelRes.getValue();
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

export const getRouterBalances = async ({
  fromChain,
  toChain,
  fromToken,
  toToken,
  node,
}: any) => {
  let { fromChannel, toChannel } = await getChannelsForChains(
    fromChain,
    toChain,
    node
  );
  const preTransferBalance = getBalanceForAssetId(
    fromChannel,
    fromToken,
    "bob"
  );
  const postTransferBalance = getBalanceForAssetId(toChannel, toToken, "bob");
  return {
    preTransferBalance,
    postTransferBalance,
  };
};

export const swap = async (
  swapAmount: ethers.BigNumberish,
  fromToken: string,
  fromTokenPair: string,
  toToken: string,
  toTokenPair: string,
  fromChainId: number,
  toChainId: number,
  node: BrowserNode,
  provider: providers.JsonRpcProvider,
  setLog: any
) => {
  console.log("***swap1");
  const signer = await provider.getSigner();
  const signerAddress = await signer.getAddress();
  setLog(`(0/7) Starting`);
  console.log(`Starting swap: `, {
    swapAmount,
    fromToken,
    toToken,
    fromChainId,
    toChainId,
  });

  let { fromChannel, toChannel } = await getChannelsForChains(
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
  console.log("***swap2");
  // // TODO: handle ETH
  const balance = getBalanceForAssetId(fromChannel, fromToken, "bob");
  if (BigNumber.from(balance).lt(swapAmount)) {
    console.log("***swap3");
    const fromTokenContract = new Contract(
      fromToken,
      ERC20Abi,
      provider.getSigner()
    );
    const tx = await fromTokenContract.transfer(
      fromChannel.channelAddress,
      swapAmount
    );
    setLog(`(1/7) Starting swap`, { tx: tx.hash, chainId: fromChainId });
    console.log("***swap5");
    console.log("Sent approval tx, waiting for confirmation: ", tx);
    const receipt = await tx.wait();
    console.log("Tx confirmed, receipt: ", receipt);
    // reconcile deposit on from chain
    const depositRes = await node.reconcileDeposit({
      channelAddress: fromChannel.channelAddress,
      assetId: fromToken,
    });
    console.log("*****swap5.1", { depositRes });
    if (depositRes.isError) {
      throw depositRes.getError();
    }
    console.log(`Deposit complete: `, depositRes.getValue());
  } else {
    setLog("(2/7) Balance in channel, sending now.");
  }

  // withdraw with swap data
  const fromChainIdHelperContract = new Contract(
    withdrawHelpers[fromChainId],
    UniswapWithdrawHelper.abi,
    chainJsonProviders[fromChainId]
  );
  console.log("Generating fromChain swap");
  const fromSwapData = await fromChainIdHelperContract.getCallData({
    amountIn: swapAmount,
    amountOutMin: 1, // TODO: maybe change this, but this will make the swap always succeed
    router: uniswapRouters[fromChainId],
    to: fromChannel.channelAddress,
    tokenA: fromToken,
    tokenB: fromTokenPair,
    path: [fromToken, fromTokenPair],
  });
  console.log("fromSwapData: ", fromSwapData);
  const fromSwapWithdraw = await node.withdraw({
    assetId: fromToken,
    amount: swapAmount.toString(),
    channelAddress: fromChannel.channelAddress,
    callData: fromSwapData,
    callTo: withdrawHelpers[fromChainId],
    recipient: withdrawHelpers[fromChainId],
  });
  if (fromSwapWithdraw.isError) {
    throw fromSwapWithdraw.getError();
  }
  console.log(`From swap withdraw complete: `, fromSwapWithdraw.getValue());
  // make sure tx is sent
  let fromSwapWithdrawTx = fromSwapWithdraw.getValue().transactionHash;
  setLog(`(3/7) Swapping`, { tx: fromSwapWithdrawTx, chainId: fromChainId });
  let receipt = await chainJsonProviders[fromChainId].waitForTransaction(
    fromSwapWithdrawTx!
  );
  console.log("fromSwapWithdraw receipt: ", receipt);

  // reconcile deposit on from chain
  setLog("(4/7) Reconciling deposit");
  const fromSwapDepositRes = await node.reconcileDeposit({
    channelAddress: fromChannel.channelAddress,
    assetId: fromTokenPair,
  });
  if (fromSwapDepositRes.isError) {
    throw fromSwapDepositRes.getError();
  }
  console.log(`Deposit complete: `, fromSwapDepositRes.getValue());

  let channelStateRes = await node.getStateChannel({
    channelAddress: fromChannel.channelAddress,
  });
  if (channelStateRes.isError) {
    throw channelStateRes.getError();
  }
  fromChannel = channelStateRes.getValue();
  console.log("fromChannel: ", fromChannel);
  const postFromSwapBalance = getBalanceForAssetId(
    fromChannel,
    fromTokenPair,
    "bob"
  );
  console.log("postFromSwapBalance: ", postFromSwapBalance);

  // transfer cross chain
  setLog("(5/7) Transferring cross chain");
  const preImage = getRandomBytes32();
  const lockHash = utils.soliditySha256(["bytes32"], [preImage]);
  const routingId = getRandomBytes32();
  await node.conditionalTransfer({
    publicIdentifier: node.publicIdentifier,
    amount: postFromSwapBalance,
    assetId: fromTokenPair,
    channelAddress: fromChannel.channelAddress,
    type: TransferNames.HashlockTransfer,
    details: {
      lockHash,
      expiry: "0",
    },
    meta: {
      routingId,
    },
    recipient: node.publicIdentifier,
    recipientChainId: toChainId,
    recipientAssetId: toToken,
  });

  // await transfer event
  console.log(
    `Waiting for transfer creation on channel ${toChannel.channelAddress}`
  );
  const toTransferData = await new Promise<ConditionalTransferCreatedPayload>(
    (res) => {
      node.on(
        "CONDITIONAL_TRANSFER_CREATED",
        (data: ConditionalTransferCreatedPayload) => {
          console.log("CONDITIONAL_TRANSFER_CREATED data: ", {
            data,
            toChannel,
          });
          if (data.channelAddress === toChannel.channelAddress) {
            res(data);
          } else {
            console.log(
              `Got transfer for ${data.channelAddress}, waiting for ${toChannel.channelAddress}`
            );
          }
        }
      );
    }
  );

  // resolve transfer
  const resolveRes = await node.resolveTransfer({
    channelAddress: toChannel.channelAddress,
    transferResolver: {
      preImage,
    },
    transferId: toTransferData.transfer.transferId,
  });
  if (resolveRes.isError) {
    throw resolveRes.getError();
  }
  const resolve = resolveRes.getValue();
  console.log("resolve: ", resolve);

  // get updated channel balance
  channelStateRes = await node.getStateChannel({
    channelAddress: toChannel.channelAddress,
  });
  if (channelStateRes.isError) {
    throw channelStateRes.getError();
  }
  toChannel = channelStateRes.getValue();
  console.log("toChannel: ", toChannel);
  const postCrossChainTransferBalance = getBalanceForAssetId(
    toChannel,
    toToken,
    "bob"
  );
  console.log("postCrossChainTransferBalance: ", postCrossChainTransferBalance);

  // withdraw with swap data
  const toChainIdHelperContract = new Contract(
    withdrawHelpers[toChainId],
    UniswapWithdrawHelper.abi,
    chainJsonProviders[toChainId]
  );
  const toSwapDataOption = {
    amountIn: postCrossChainTransferBalance,
    amountOutMin: 1, // TODO: maybe change this, but this will make the swap always succeed
    router: uniswapRouters[toChainId],
    to: toChannel.channelAddress,
    tokenA: toToken,
    tokenB: toTokenPair,
    path: [toToken, toTokenPair],
  };
  console.log("Generating toChain swap", {
    toSwapDataOption,
  });
  const toSwapData = await toChainIdHelperContract.getCallData(
    toSwapDataOption
  );
  console.log("toSwapData: ", toSwapData);
  const toSwapWithdraw = await node.withdraw({
    assetId: toToken,
    amount: postCrossChainTransferBalance,
    channelAddress: toChannel.channelAddress,
    callData: toSwapData,
    callTo: withdrawHelpers[toChainId],
    recipient: withdrawHelpers[toChainId],
  });
  if (toSwapWithdraw.isError) {
    throw toSwapWithdraw.getError();
  }
  console.log(`To swap withdraw complete: `, toSwapWithdraw.getValue());

  // make sure tx is sent
  let toSwapWithdrawHash = toSwapWithdraw.getValue().transactionHash;
  setLog("(6/7) Swapping", { hash: toSwapWithdrawHash, chainId: toChainId });
  receipt = await chainJsonProviders[toChainId].waitForTransaction(
    toSwapWithdrawHash!
  );
  console.log("toSwapWithdraw receipt: ", receipt);

  // reconcile deposit on toChain
  const toSwapDepositRes = await node.reconcileDeposit({
    channelAddress: toChannel.channelAddress,
    assetId: toTokenPair,
  });
  if (toSwapDepositRes.isError) {
    throw toSwapDepositRes.getError();
  }
  console.log(`Deposit complete: `, toSwapDepositRes.getValue());

  channelStateRes = await node.getStateChannel({
    channelAddress: toChannel.channelAddress,
  });
  if (channelStateRes.isError) {
    throw channelStateRes.getError();
  }
  toChannel = channelStateRes.getValue();
  console.log("toChannel: ", toChannel);
  const posttoSwapBalance = getBalanceForAssetId(toChannel, toTokenPair, "bob");
  console.log("posttoSwapBalance: ", posttoSwapBalance);

  // withdraw to address
  const toWithdraw = await node.withdraw({
    assetId: toTokenPair,
    amount: posttoSwapBalance,
    channelAddress: toChannel.channelAddress,
    recipient: signerAddress,
  });
  if (toWithdraw.isError) {
    throw toWithdraw.getError();
  }
  receipt = await chainJsonProviders[toChainId].waitForTransaction(
    toWithdraw.getValue().transactionHash!
  );

  setLog("(7/7) 🎉 Transfer Complete");
  console.log(`To withdraw complete: `, toWithdraw.getValue());
};
