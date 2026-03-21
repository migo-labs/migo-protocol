import StellarSdk from "@stellar/stellar-sdk";
import BigNumber from "bignumber.js";
import { AssetConfig } from "../types/asset.types";

const server = new StellarSdk.Horizon.Server(
  "https://horizon-testnet.stellar.org"
);

const { Keypair, TransactionBuilder, Networks, Operation, Asset } = StellarSdk;

function toStellarAsset(config: AssetConfig): InstanceType<typeof Asset> {
  if (config.network !== "stellar") {
    throw new Error("Only stellar network supported for now");
  }
  if (config.type === "native") {
    return Asset.native();
  }
  if (config.type === "credit") {
    return new Asset(config.code, config.issuer);
  }
  throw new Error("Unsupported stellar asset type");
}

function assetsMatch(
  a: InstanceType<typeof Asset>,
  b: InstanceType<typeof Asset>
): boolean {
  if (a.isNative() && b.isNative()) return true;
  if (a.isNative() || b.isNative()) return false;
  return a.getCode() === b.getCode() && a.getIssuer() === b.getIssuer();
}

function settlementSourceAssetFromEnv(): InstanceType<typeof Asset> {
  const raw = process.env.MIGO_SETTLEMENT_SOURCE?.trim();
  if (!raw || raw.toLowerCase() === "native") {
    return Asset.native();
  }
  const colon = raw.indexOf(":");
  if (colon < 1 || colon === raw.length - 1) {
    throw new Error(
      "MIGO_SETTLEMENT_SOURCE must be \"native\" or ASSET_CODE:ISSUER (e.g. USDC:GBBD...)"
    );
  }
  return new Asset(raw.slice(0, colon), raw.slice(colon + 1));
}

function horizonAssetFromPathStep(step: {
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
}): InstanceType<typeof Asset> {
  if (step.asset_type === "native") {
    return Asset.native();
  }
  if (!step.asset_code || !step.asset_issuer) {
    throw new Error("Invalid path hop from Horizon");
  }
  return new Asset(step.asset_code, step.asset_issuer);
}

export async function sendSettlementPayment(
  amount: string,
  settlementAsset: AssetConfig
) {
  const MIGO_SECRET = process.env.MIGO_SECRET!;
  const MERCHANT_PUBLIC = process.env.MERCHANT_PUBLIC!;

  if (!MIGO_SECRET || !MERCHANT_PUBLIC) {
    throw new Error("Stellar env vars not loaded");
  }

  const sourceKeypair = Keypair.fromSecret(MIGO_SECRET);
  const sourcePublic = sourceKeypair.publicKey();
  const account = await server.loadAccount(sourcePublic);

  const destAsset = toStellarAsset(settlementAsset);
  const sourceAsset = settlementSourceAssetFromEnv();

  let operation: InstanceType<typeof Operation>;

  if (assetsMatch(sourceAsset, destAsset)) {
    operation = Operation.payment({
      destination: MERCHANT_PUBLIC,
      asset: destAsset,
      amount,
    });
  } else {
    const pathCall = server.strictReceivePaths(
      [sourceAsset],
      destAsset,
      amount
    );
    const { records } = await pathCall.call();
    const record = records[0];
    if (!record) {
      const src = sourceAsset.isNative()
        ? "XLM"
        : `${sourceAsset.getCode()}:${sourceAsset.getIssuer()}`;
      const dest = destAsset.isNative()
        ? "XLM"
        : `${destAsset.getCode()}:${destAsset.getIssuer()}`;
      throw new Error(
        `No Stellar DEX path found to deliver ${amount} of destination asset to merchant (source=${src}, dest=${dest}). Check liquidity and trustlines.`
      );
    }

    const sendMax = new BigNumber(record.source_amount)
      .times(1.01)
      .toFixed(7, BigNumber.ROUND_UP);

    const path: InstanceType<typeof Asset>[] = (record.path || []).map(
      (hop: { asset_type: string; asset_code?: string; asset_issuer?: string }) =>
        horizonAssetFromPathStep(hop)
    );

    operation = Operation.pathPaymentStrictReceive({
      destination: MERCHANT_PUBLIC,
      sendAsset: sourceAsset,
      sendMax,
      destAsset,
      destAmount: amount,
      path,
    });
  }

  const transaction = new TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(operation)
    .setTimeout(0)
    .build();

  transaction.sign(sourceKeypair);

  const result = await server.submitTransaction(transaction);

  return result.hash;
}
