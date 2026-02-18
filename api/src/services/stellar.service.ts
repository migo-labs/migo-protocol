import StellarSdk from "@stellar/stellar-sdk";
import { AssetConfig } from "../types/asset.types";

const server = new StellarSdk.Horizon.Server(
  "https://horizon-testnet.stellar.org"
);

const { Keypair, TransactionBuilder, Networks, Operation, Asset } = StellarSdk;

export async function sendSettlementPayment(amount: string, settlementAsset: AssetConfig) {
  const MIGO_SECRET = process.env.MIGO_SECRET!;
  const MERCHANT_PUBLIC = process.env.MERCHANT_PUBLIC!;

  //console.log("MIGO_SECRET:", MIGO_SECRET);
  //console.log("MERCHANT_PUBLIC:", MERCHANT_PUBLIC);

  if (!MIGO_SECRET || !MERCHANT_PUBLIC) {
    throw new Error("Stellar env vars not loaded");
  }

  const sourceKeypair = Keypair.fromSecret(MIGO_SECRET);

  const account = await server.loadAccount(sourceKeypair.publicKey());

  let stellarAsset;

  if (settlementAsset.network !== "stellar") {
    throw new Error("Only stellar network supported for now");
  }

  if (settlementAsset.type === "native") {
    stellarAsset = Asset.native();
  } else if (settlementAsset.type === "credit") {
    stellarAsset = new Asset(
      settlementAsset.code,
      settlementAsset.issuer
    );
  } else {
    throw new Error("Unsupported stellar asset type");
  }


  const transaction = new TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination: MERCHANT_PUBLIC,
        asset: stellarAsset,
        amount,
      })
    )
    .setTimeout(30)
    .build();

  transaction.sign(sourceKeypair);

  const result = await server.submitTransaction(transaction);

  return result.hash;
}
