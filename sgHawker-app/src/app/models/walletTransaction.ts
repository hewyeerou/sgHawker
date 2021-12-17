import { BankAccount } from './submodels/bankAccount';
import { Card } from './submodels/card';
import { TransactionTypeEnum } from './enums/transaction-type-enum';
import { Order } from './order';
import { Wallet } from './wallet';

export class WalletTransaction {
    _id: string | undefined;
    transactionDate: Date | undefined;
    paidCashbackAmount: number | undefined;
    paidNonCashbackAmount: number | undefined;
    receivedCashbackAmount: number | undefined;
    topUpAmount: number | undefined;
    withdrawalAmount: number | undefined;
    transactionType: TransactionTypeEnum | undefined;
    creditCardInvolved: Card | undefined;
    bankAccountInvolved: BankAccount | undefined;
    wallet: Wallet | undefined;
    order: Order | undefined;

    constructor(
    _id?: string,
    transactionType?: TransactionTypeEnum,
    withdrawalAmount?: number,
    topUpAmount?: number,
    receivedCashbackAmount?: number,
    paidNonCashbackAmount?: number,
    paidCashbackAmount?: number,
    transactionDate?: Date,
    order?: Order,
    creditCardInvolved?: Card,
    bankAccountInvolved?: BankAccount,
    wallet?: Wallet
      ) {
      this.order = order;
      this.transactionType = transactionType;
      this.withdrawalAmount = withdrawalAmount;
      this.topUpAmount = topUpAmount;
      this.receivedCashbackAmount = receivedCashbackAmount;
      this.paidCashbackAmount = paidCashbackAmount;
      this.paidNonCashbackAmount = paidNonCashbackAmount;
      this.transactionDate = transactionDate;
      this.creditCardInvolved = creditCardInvolved;
      this.bankAccountInvolved = bankAccountInvolved;
      this.wallet = wallet;
    }
}
