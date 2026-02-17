import StellarSdk from "@stellar/stellar-sdk";

const server = new StellarSdk.Horizon.Server(
  "https://horizon-testnet.stellar.org"
);

const { Keypair, TransactionBuilder, Networks, Operation, Asset } = StellarSdk;

export async function sendSettlementPayment(amount: string) {
  const MIGO_SECRET = process.env.MIGO_SECRET!;
  const MERCHANT_PUBLIC = process.env.MERCHANT_PUBLIC!;

  console.log("MIGO_SECRET:", MIGO_SECRET);
  console.log("MERCHANT_PUBLIC:", MERCHANT_PUBLIC);

  if (!MIGO_SECRET || !MERCHANT_PUBLIC) {
    throw new Error("Stellar env vars not loaded");
  }

  const sourceKeypair = Keypair.fromSecret(MIGO_SECRET);

  const account = await server.loadAccount(sourceKeypair.publicKey());

  const transaction = new TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination: MERCHANT_PUBLIC,
        asset: Asset.native(),
        amount,
      })
    )
    .setTimeout(30)
    .build();

  transaction.sign(sourceKeypair);

  const result = await server.submitTransaction(transaction);

  return result.hash;
}
