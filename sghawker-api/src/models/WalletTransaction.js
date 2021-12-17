import mongoose, { Schema } from "mongoose";
import { Constants } from "common";
import * as _ from "lodash";

const WalletTransaction = new Schema({
  transactionDate: {
    type: Date,
    required: true,
  },
  /**
  Order related
  */
  paidCashbackAmount: {
    type: Number,
  },
  paidNonCashbackAmount: { // includes delivery fee
    type: Number,
  },
  receivedCashbackAmount: {
    type: Number,
  },
  refundedAmount: {
    type: Number
  },
  deliveryFee: { // total delivery fee paid by customer
    type: Number
  },
  deliveryEarning: { // earning by deliverer
    type: Number
  },
  deliveryFeeCommission: { // for platform
    type: Number
  },
  /**
  customer top up
  */
  topUpAmount: {
    type: Number,
  },
  /**
  bank transfer
  */
  withdrawalAmount: {
    type: Number,
  },
  /**
  subscription fee
  */
  paymentAmount: {
    type: Number
  },
  transactionType: {
    type: String,
    required: true,
    enum: [Constants.TOP_UP, Constants.WITHDRAWAL, Constants.ORDER, Constants.SUBSCRIPTION_PAYMENT, Constants.REFUND, Constants.DELIVERY],
  },
  creditCardInvolved: {
    cardName: { type: String },
    cardNumber: { type: String },
    truncatedCardNumber: { type: String },
    expiryDate: { type: Date },
    cvv: { type: String },
    cardType: { type: String }
  },
  bankAccountInvolved: {
    fullName: { type: String },
    accountNumber: { type: String },
    nameOfBank: { type: String },
  },
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
});

WalletTransaction.statics.validate = function (walletTransaction, fields) {
  if (fields.transactionType) {
    if (!walletTransaction.transactionType) {
      return Constants.ERROR_TRANSACTION_TYPE_REQUIRED;
    }
  }
  if (fields.paidCashbackAmount) {
    if (!walletTransaction.paidCashbackAmount) {
      return Constants.ERROR_PAID_CASHBACK_AMOUNT_REQUIRED;
    }
  }
  if (fields.paidNonCashbackAmount) {
    if (!walletTransaction.paidNonCashbackAmount) {
      return Constants.ERROR_PAID_NONCASHBACK_AMOUNT_REQUIRED;
    }
  }
  if (fields.receivedCashbackAmount) {
    if (!walletTransaction.receivedCashbackAmount) {
      return Constants.ERROR_RECEIVED_CASHBACK_AMOUNT_REQUIRED;
    }
  }
  if (fields.topUpAmount) {
    if (!walletTransaction.topUpAmount) {
      return Constants.ERROR_TOP_UP_AMOUNT_REQUIRED;
    }
  }
  if (fields.withdrawalAmount) {
    if (!walletTransaction.withdrawalAmount) {
      return Constants.ERROR_WITHDRAWAL_AMOUNT_REQUIRED;
    }
  }
  if (fields.outlet) {
    if (!walletTransaction.outlet) {
      return Constants.ERROR_OUTLET_ID_NOT_FOUND;
    }
  }
  if (fields.user) {
    if (!walletTransaction.user) {
      return Constants.ERROR_USER_ID_REQUIRED;
    }
  }
  if (fields.creditCardInvolved) {
    if (
      !walletTransaction.creditCardInvolved.cardName ||
      !walletTransaction.creditCardInvolved.cardNumber ||
      !walletTransaction.creditCardInvolved.expiryDate
    ) {
      return Constants.ERROR_INCOMPLETE_CREDIT_CARD_INFO;
    }
  }
  if (fields.bankAccountInvolved) {
    if (
      !walletTransaction.bankAccountInvolved.fullName ||
      !walletTransaction.bankAccountInvolved.fullName ||
      !walletTransaction.bankAccountInvolved.fullName
    ) {
      return Constants.ERROR_INCOMPLETE_BANK_ACCOUNT_INFO;
    }
  }
  return null;
};

WalletTransaction.statics.createNewCustomerTopUpTransaction = function (
  walletId,
  creditCardInvolved,
  topUpAmount
) {

  const newTransaction = {
    transactionType: Constants.TOP_UP,
    topUpAmount: topUpAmount,
    wallet: mongoose.Types.ObjectId(walletId),
    creditCardInvolved: {
      ...creditCardInvolved,
    },
    transactionDate: Date.now()
  };

  return this
    .create(newTransaction)
    .then((createdTransaction) => updateWalletTransactions(walletId, createdTransaction._id));
};

WalletTransaction.statics.createNewHawkerWithdrawalTransaction = function (
  wallet,
  bankAccountInvolved
) {
  const newTransaction = {
    transactionType: Constants.WITHDRAWAL,
    withdrawalAmount: wallet.balance,
    wallet: mongoose.Types.ObjectId(wallet._id),
    bankAccountInvolved: {
      ...bankAccountInvolved,
    },
    transactionDate: Date.now()
  };
  return this
    .create(newTransaction)
    .then((createdTransaction) => updateWalletTransactions(wallet._id, createdTransaction._id));
};

WalletTransaction.statics.createNewRefundTransactions = function (
  fromWallet,
  toWallet,
  amount,
  order,
) {
  let fromWalletTransaction = {
    transactionType: Constants.REFUND,
    order: mongoose.Types.ObjectId(order._id),
    wallet: mongoose.Types.ObjectId(fromWallet._id),
    refundedAmount: amount,
    transactionDate: Date.now()
  };

  let toWalletTransaction = {
    ...fromWalletTransaction
  };
  toWalletTransaction.wallet = mongoose.Types.ObjectId(toWallet._id);

  return this
    .create([fromWalletTransaction, toWalletTransaction])
    .then(transactionArr => {
      for (const transaction of transactionArr) {
        updateWalletTransactions(transaction.wallet, transaction._id);
      }
    });
};

WalletTransaction.statics.createNewOrderTransactions = function (
  customerWallet,
  outletWallet,
  order
) {
  let customerTransaction = {
    transactionType: Constants.ORDER,
    wallet: mongoose.Types.ObjectId(customerWallet._id),
    order: mongoose.Types.ObjectId(order._id),
    paidCashbackAmount: order.debitedCashback,
    paidNonCashbackAmount: order.totalPrice,
    receivedCashbackAmount: order.creditedCashback,
    transactionDate: Date.now()
  };

  let outletTransaction = { ...customerTransaction };
  outletTransaction.wallet = mongoose.Types.ObjectId(outletWallet._id);

  return this
    .create([customerTransaction, outletTransaction])
    .then(transactionArr => {
      for (const transaction of transactionArr) {
        updateWalletTransactions(transaction.wallet, transaction._id);
      }
    });
};

WalletTransaction.statics.createNewDeliveryTransactions = function (
  delivererWallet,
  adminWallet,
  order
) {
  let delivererTransaction = {
    transactionType: Constants.DELIVERY,
    wallet: mongoose.Types.ObjectId(delivererWallet._id),
    order: mongoose.Types.ObjectId(order._id),
    deliveryFee: order.deliveryFee,
    deliveryEarning: (order.deliveryFee - order.deliveryCommission),
    deliveryFeeCommission: order.deliveryCommission,
    transactionDate: Date.now(),
  };

  let adminTransaction = { ...delivererTransaction };
  adminTransaction.wallet = mongoose.Types.ObjectId(adminWallet._id);

  return this
    .create([delivererTransaction, adminTransaction])
    .then(transactionArr => {
      for (const transaction of transactionArr) {
        updateWalletTransactions(transaction.wallet, transaction._id);
      }
    });
};

WalletTransaction.statics.createNewSubscriptionPayment = function (
  wallet,
  creditCardInvolved
) {
  const newTransaction = {
    transactionType: Constants.SUBSCRIPTION_PAYMENT,
    paymentAmount: wallet.subscriptionPaymentDue,
    wallet: mongoose.Types.ObjectId(wallet._id),
    creditCardInvolved: {
      ...creditCardInvolved,
    },
    transactionDate: Date.now()
  };
  const User = require("./User");
  User.findAdminAccount().then((admin) => {
    let adminTransaction = { ...newTransaction };
    adminTransaction.wallet = mongoose.Types.ObjectId(admin.wallet._id);

    return this
      .create([newTransaction, adminTransaction])
      .then(transactionArr => {
        for (const transaction of transactionArr) {
          updateWalletTransactions(transaction.wallet, transaction._id);
        }
      });
  })
};

WalletTransaction.statics.createNewSubscriptionPaymentForOverduePayment = function (
  overduePaymentDate,
  wallet,
  creditCardInvolved
) {
  const newTransaction = {
    transactionType: Constants.SUBSCRIPTION_PAYMENT,
    paymentAmount: wallet.subscriptionPaymentDue,
    wallet: mongoose.Types.ObjectId(wallet._id),
    creditCardInvolved: {
      ...creditCardInvolved,
    },
    transactionDate: overduePaymentDate
  };
  const User = require("./User");
  User.findAdminAccount().then((admin) => {
    let adminTransaction = { ...newTransaction };
    adminTransaction.wallet = mongoose.Types.ObjectId(admin.wallet._id);

    return this
      .create([newTransaction, adminTransaction])
      .then(transactionArr => {
        for (const transaction of transactionArr) {
          updateWalletTransactions(transaction.wallet, transaction._id);
        }
      });
  })
};

WalletTransaction.statics.findTransactionByWalletId = function (
  walletId,
  startDate = undefined,
  endDate = undefined,
) {
  let filter;

  if (!startDate || !endDate) {
    filter = {
      wallet: mongoose.Types.ObjectId(walletId)
    }
  } else {
    filter = {
      wallet: mongoose.Types.ObjectId(walletId),
      transactionDate: {
        $gte: startDate,
        $lte: endDate,
      }
    }
  }

  return this
    .find(filter)
    .populate("wallet")
    .populate("order")
    .exec();
};

WalletTransaction.statics.filterTransactionByTransactionType = function (
  transactionType
) {
  const filter = {
    transactionType: transactionType
  }

  return this
    .find(filter)
    .populate("wallet")
    .populate("order")
    .exec();
}

function updateWalletTransactions(walletId, transactionId, session = undefined) {
  const Wallet = require("./Wallet");

  const update = {
    $push: {
      walletTransactions: transactionId,
    },
  };

  let options = {
    new: true,
  };

  if (session) {
    options.session = session;
  }

  return Wallet
    .findByIdAndUpdate(walletId, update, options)
    .populate({
      path: 'walletTransactions',
      populate: {
        path: 'order',
        model: 'Order',
        populate: {
          path: 'outlet',
          model: 'Outlet'
        }
      }
    })
    .exec();
}

export default mongoose.model("WalletTransaction", WalletTransaction, "WalletTransaction");
