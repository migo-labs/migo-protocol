export type StellarNativeAsset = {
  network: "stellar";
  type: "native";
  code: "XLM";
};

export type StellarCreditAsset = {
  network: "stellar";
  type: "credit";
  code: string;
  issuer: string;
};

export type FiatAsset = {
  network: "fiat";
  type: "bank";
  code: string; // ARS, USD, BRL, etc.
};

export type AssetConfig =
  | StellarNativeAsset
  | StellarCreditAsset
  | FiatAsset;
