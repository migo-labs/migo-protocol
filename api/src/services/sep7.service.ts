export function buildMockTransactionXdr(splitId: string, amount: number): string {
  // MOCK — luego esto será generado con @stellar/stellar-sdk
  return `MOCK_XDR_SPLIT_${splitId}_AMOUNT_${amount}`;
}

export function generateSep7Uri(xdr: string): string {
  return `web+stellar:tx?xdr=${encodeURIComponent(xdr)}`;
}