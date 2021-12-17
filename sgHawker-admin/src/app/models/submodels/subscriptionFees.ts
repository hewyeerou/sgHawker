export class SubscriptionFees {
    premium: number | undefined;
    deluxe: number | undefined;

    constructor(
    premium?: number,
    deluxe?: number,
      ) {
      this.premium = premium;
      this.deluxe = deluxe;
    }
}
