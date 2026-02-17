export type PaymentMethod =
  | "STELLAR"
  | "BANK_TRANSFER"
  | "MERCADO_PAGO"
  | "CARD";

export type ExternalStatus =
  | "PENDING"
  | "CONFIRMED"
  | "FAILED";

export interface Payment {
  id: string;
  splitId: string;
  payerId: string;
  method: PaymentMethod;

  originalAsset: string;
  originalAmount: number;

  conversionRate: number;
  convertedAmount: number;

  externalStatus: ExternalStatus;
  providerReferenceId?: string;

  createdAt: Date;
  confirmedAt?: Date;
}
