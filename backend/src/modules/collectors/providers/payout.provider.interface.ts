export interface PayoutTransferResult {
  transferId: string;
  status: string;
  amountCents: number;
  currency: string;
  destinationAccount: string;
  created: Date;
}

export interface IPayoutProvider {
  createInstantTransfer(
    collectorId: string,
    amountCents: number,
    currency: string,
    destinationAccount: string,
  ): Promise<PayoutTransferResult>;
}
