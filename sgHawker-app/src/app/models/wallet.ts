import { Outlet } from './outlet';
import { Cashback } from './submodels/cashback';
import { WalletTransaction } from './walletTransaction';
import { User } from './user';

export class Wallet {
    _id: string | undefined;
    outlet: Outlet | undefined;
    user: User | undefined;
    withdrawalFrequency: number | undefined;
    nextWithdrawalDate: Date | undefined;
    balance: number | undefined;
    subscriptionPaymentDue: number | undefined;
    walletTransactions: WalletTransaction [] | undefined;
    availableCashBacks: Cashback [] | undefined;

    constructor(
      _id?: string,
      outlet?: Outlet,
      user?: User,
      withdrawalFrequency?: number,
      nextWithdrawalDate?: Date,
      balance?: number,
      subscriptionPaymentDue?: number,
      walletTransactions?: WalletTransaction [],
      availableCashBacks?: Cashback [],
      ) {
      this.outlet = outlet;
      this.user = user;
      this.withdrawalFrequency = withdrawalFrequency;
      this.nextWithdrawalDate = nextWithdrawalDate;
      this.balance = balance;
      this.subscriptionPaymentDue = subscriptionPaymentDue;
      this.walletTransactions = walletTransactions;
      this.availableCashBacks = availableCashBacks;
    }
}
