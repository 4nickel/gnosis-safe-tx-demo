/* eslint-disable @typescript-eslint/no-explicit-any,node/no-extraneous-import */
import yargs from 'yargs';
import Web3 from 'web3';
import Safe, { Web3Adapter } from '@gnosis.pm/safe-core-sdk';
import { SafeTransactionDataPartial } from '@gnosis.pm/safe-core-sdk-types';
import { hideBin } from 'yargs/helpers';
import SafeServiceClient, {
  ProposeTransactionProps,
} from '@gnosis.pm/safe-service-client';

// Define your JSON metadata and address.
import ERC20Upgradeable from '@config/ERC20Upgradeable.json';
const exampleAddress = '0xEDA0A92877c9607b5B75eE2bE012B4bCe2599C81';

const targetMetadata = ERC20Upgradeable;
const targetAddress = exampleAddress;
// Call the method.
const getTargetTx = (targetContract: any) => {
  return targetContract.methods.approve(
    '0x382e12E4AD5C360E57BdD937a55B27c8AA15731B',
    '1'
  );
};

export const send = async (args: any) => {
  const web3 = new Web3(args.rpcUrl);

  const contract = new web3.eth.Contract(
    targetMetadata.abi as any,
    targetAddress
  );

  const contractFunc = await getTargetTx(contract);

  const data = contractFunc.encodeABI();
  const userAccount = web3.eth.accounts.privateKeyToAccount(args.privateKey);
  web3.eth.accounts.wallet.add(userAccount);
  web3.eth.defaultAccount = userAccount.address;

  const ethAdapter = new Web3Adapter({
    web3: web3,
    signerAddress: userAccount.address,
  });

  const safeSdk: Safe = await Safe.create({
    ethAdapter: ethAdapter,
    safeAddress: args.safeAddress,
  });

  const transaction: SafeTransactionDataPartial = {
    to: targetAddress,
    value: '0',
    data: data,
  };
  const safeTransaction = await safeSdk.createTransaction(transaction);
  const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
  await safeSdk.signTransaction(safeTransaction);

  const transactionConfig: ProposeTransactionProps = {
    safeAddress: args.safeAddress,
    safeTransaction,
    safeTxHash,
    senderAddress: userAccount.address,
  };
  const safeService = new SafeServiceClient(args.safeUrl);
  return await safeService.proposeTransaction(transactionConfig);
};

yargs(hideBin(process.argv))
  .scriptName('gnosis-tx')
  .version('1.0.0')
  .usage('$0 command [args]')
  .option('config', {
    type: 'string',
    describe: 'path to configuration file',
  })
  .command(
    'send',
    'Send the transaction to gnosis safe',
    (yargs) => {
      yargs.option('rpc-url', {
        type: 'string',
        required: true,
        describe: 'RPC provider URL',
      });
      yargs.option('private-key', {
        type: 'string',
        required: true,
        describe: 'private key of the user wallet',
      });
      yargs.option('safe-address', {
        type: 'string',
        required: true,
        describe: 'address of the gnosis safe',
      });
      yargs.option('safe-url', {
        type: 'string',
        required: true,
        describe: 'transaction URL of the gnosis safe',
      });
    },
    send
  )
  .help()
  .parseAsync()
  .then();
