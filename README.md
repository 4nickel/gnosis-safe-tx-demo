## gnosis-safe

> Demo of gnosis safe transactions.

### Installation
```sh
cd gnosis-safe-tx-demo
yarn install
yarn build
```

### Usage

#### send

Sends a transaction via multisig.

To use, edit`targetMetadata`, `targetAddress` and `getTargetTx` and run `yarn build`.

Then execute the transaction with:

```sh
yarn start send --rpc-url URL --private-key KEY --safe-address ADDR --safe-url URL
```
