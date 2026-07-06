import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import {
  IPayoutProvider,
  PayoutTransferResult,
} from "./payout.provider.interface";

@Injectable()
export class StripeConnectProvider implements IPayoutProvider {
  private readonly logger = new Logger(StripeConnectProvider.name);

  async createInstantTransfer(
    collectorId: string,
    amountCents: number,
    currency: string,
    destinationAccount: string,
  ): Promise<PayoutTransferResult> {
    if (!destinationAccount) {
      throw new BadRequestException(
        "Collector Stripe Connect account ID is missing.",
      );
    }
    if (amountCents < 1000) {
      throw new BadRequestException(
        "Minimum withdrawal amount is $10.00 (1000 cents).",
      );
    }

    this.logger.log(
      `💳 Initiating Stripe Connect Instant Payout of ${amountCents} cents to ${destinationAccount}`,
    );

    // In venture production, this calls stripe.transfers.create({ amount: amountCents, currency, destination: destinationAccount })
    const simulatedTransferId = `tr_connect_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return {
      transferId: simulatedTransferId,
      status: "COMPLETED",
      amountCents,
      currency,
      destinationAccount,
      created: new Date(),
    };
  }
}
