import mongoose, { Schema } from "mongoose";
import { Constants, Logger } from "common";
import * as _ from "lodash";
import moment from "moment";
const Outlet = require("./Outlet");
const User = require("./User");
const WalletTransaction = require("./WalletTransaction");

const DEBUG_ENV = "MODEL_WALLET";

const Wallet = new Schema({
  withdrawalFrequency: {
    type: Number,
  },
  nextWithdrawalDate: {
    type: Date,
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
  },
  subscriptionPaymentDue: {
    type: Number,
  },
  availableCashBacks: [
    {
      cashbackBalance: {
        type: Number,
      },
      outlet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Outlet",
      },
    },
  ],
  walletTransactions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WalletTransaction",
    },
  ],
  outlet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Outlet",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  goals: [
    {
      goalTitle: {
        type: String,
      },
      goalStartDate: {
        type: Date
      }, 
      goalEndDate: {
        type: Date
      },
      goalCategory: {
        enum: [Constants.SALES, Constants.CASHBACK, Constants.DELIVERY_EARNINGS, Constants.BUDGET],
      },
      targetAmount: {
        type: Number
      },
      completed: {
        type: Boolean,
        default: false
      },
      isMaster: {
        type: Boolean,
        default: false
      }
    },
  ],
});

Wallet.statics.validate = function (wallet, fields) {
  if (fields.outlet) {
    if (!wallet.outlet) {
      return Constants.ERROR_OUTLET_ID_NOT_FOUND;
    }
  }
  if (fields.user) {
    if (!wallet.user) {
      return Constants.ERROR_USER_ID_REQUIRED;
    }
  }
  if (fields.balance) {
    if (!wallet.balance) {
      return Constants.ERROR_WALLET_BALANCE_REQUIRED;
    }
    if (fields.withdrawalFrequency) {
      if (!wallet.withdrawalFrequency) {
        return Constants.ERROR_WALLET_WITHDRAWAL_FREQUENCY_REQUIRED;
      }
    }
  }
  if (fields.topUpAmount) {
    if (!wallet.topUpAmount || wallet.topUpAmount <= 0) {
      return Constants.ERROR_TOP_UP_AMOUNT_MUST_BE_POSITIVE;
    }
  }
  if (fields.fromWallet) {
    if (!wallet.fromWallet) {
      return Constants.ERROR_REFUND_REQUIRE_FROM_WALLET;
    }
  }
  if (fields.toWallet) {
    if (!wallet.toWallet) {
      return Constants.ERROR_REFUND_REQUIRE_TO_WALLET;
    }
  }
  if (fields.amountToRefund) {
    if (!wallet.amountToRefund) {
      return Constants.ERROR_REFUND_REQUIRE_AMOUNT;
    }
  }
  if (fields.order) {
    if (!wallet.order) {
      return Constants.ERROR_REFUND_REQUIRE_ORDER;
    }
  }
  return null;
};

Wallet.statics.createNewWallet = function (
  ownerId,
  withdrawalFrequency,
  isOutletWallet
) {
  let wallet;

  if (isOutletWallet) {
    wallet = {
      outlet: mongoose.Types.ObjectId(ownerId),
      withdrawalFrequency: withdrawalFrequency,
      nextWithdrawalDate: moment().add(withdrawalFrequency, "days"),
    };
  } else {
    wallet = {
      user: mongoose.Types.ObjectId(ownerId),
    };
  }

  return this.create(wallet)
    .then((createdWallet) => {
      const update = {
        $set: {
          wallet: mongoose.Types.ObjectId(createdWallet._id),
        },
      };
      const options = {
        new: true,
      };

      if (isOutletWallet) {
        return Outlet.findByIdAndUpdate(ownerId, update, options)
          .populate("wallet")
          .exec();
      } else {
        return User.findByIdAndUpdate(ownerId, update, options)
          .populate("wallet")
          .exec();
      }
    })
    .then((updatedOwner) => {
      return updatedOwner.wallet;
    });
};

Wallet.statics.findWalletByOwnerId = function (ownerId) {
  const filterConditions = {
    $or: [
      { outlet: mongoose.Types.ObjectId(ownerId) },
      { user: mongoose.Types.ObjectId(ownerId) },
    ],
  };

  return this.find(filterConditions)
    .populate("outlet")
    .populate("user")
    .populate({
      path: "walletTransactions",
      options: { sort: { 'transactionDate': -1 } },
      populate: {
        path: "order",
        model: "Order",
        populate: {
          path: "outlet",
          model: "Outlet",
        },
      },
    })
    .populate("availableCashBacks")
    .populate("availableCashBacks.outlet")
    .exec();
};

Wallet.statics.topUpFromCreditCardToWallet = function (
  walletId,
  topUpAmount,
  creditCardInvolved
) {
  return this.findById(walletId)
    .then((wallet) => {
      const update = {
        $set: {
          balance: wallet.balance + topUpAmount,
        },
      };
      return this.findByIdAndUpdate(wallet._id, update).exec();
    })
    .then((updatedWallet) =>
      WalletTransaction.createNewCustomerTopUpTransaction(
        updatedWallet._id,
        creditCardInvolved,
        topUpAmount
      )
    );
};

Wallet.statics.debitFromWalletToBankAccount = function (
  walletId,
  bankAccountInvolved,
  setNewNextWithdrawalDate
) {
  return this.findById(walletId)
    .then((wallet) => {
      let update;

      if (setNewNextWithdrawalDate) {
        update = {
          $set: {
            balance: 0,
            nextWithdrawalDate: moment().add(
              wallet.withdrawalFrequency,
              "days"
            ),
          },
        };
      } else {
        update = {
          $set: {
            balance: 0,
          },
        };
      }
      // return old model
      return this.findByIdAndUpdate(wallet._id, update).exec();
    })
    .then((outdatedWallet) =>
      WalletTransaction.createNewHawkerWithdrawalTransaction(
        outdatedWallet,
        bankAccountInvolved
      )
    );
};

Wallet.statics.refundForOrder = function (
  fromWallet,
  toWallet,
  amountToRefund,
  order
) {
  return processRefundForOrder(fromWallet, toWallet, amountToRefund, order);
};

async function processRefundForOrder(
  fromWallet,
  toWallet,
  amountToRefund,
  order
) {
  const session = await mongoose.startSession();
  const Wallet = require("./Wallet");

  try {
    session.startTransaction();

    const fromWalletUpdate = {
      $set: {
        balance: fromWallet.balance - amountToRefund,
      },
    };

    await Wallet.findByIdAndUpdate(fromWallet._id, fromWalletUpdate, {
      session,
    });

    const toWalletUpdate = {
      $set: {
        balance: toWallet.balance + amountToRefund,
      },
    };

    await Wallet.findByIdAndUpdate(toWallet._id, toWalletUpdate, { session });

    WalletTransaction.createNewRefundTransactions(
      fromWallet,
      toWallet,
      amountToRefund,
      order
    );

    await session.commitTransaction();
  } catch (error) {
    Logger.error("TRANSACTION ERROR: ", error, DEBUG_ENV);
    await session.abortTransaction();
  }

  session.endSession();
}

Wallet.statics.debitCustomerWalletForOrder = function (
  order
) {

  const walletWrapper = {
    customerWallet: undefined,
    outletWallet: undefined,
    delivererWallet: undefined,
    adminWallet: undefined
  }

  if (order.orderType === Constants.DELIVERY) {
    const User = require('./User');

    return User
      .find({ accountType: Constants.ADMIN })
      .then(accounts => {
        return this.find({ user: mongoose.Types.ObjectId(accounts[0]._id) })
      })
      .then(wallets => {
        walletWrapper.adminWallet = wallets[0];
        return this.find({ user: mongoose.Types.ObjectId(order.customer._id) })
      })
      .then(wallets => {
        walletWrapper.customerWallet = wallets[0];
        return this.find({ user: mongoose.Types.ObjectId(order.deliverer._id) })
      })
      .then(wallets => {
        walletWrapper.delivererWallet = wallets[0];
        return this.find({ outlet: mongoose.Types.ObjectId(order.outlet._id) })
      })
      .then(wallets => {
        walletWrapper.outletWallet = wallets[0];
        return updateWalletBalanceForOrder(walletWrapper, order);
      })
  } else {
    return this
      .find({ user: mongoose.Types.ObjectId(order.customer._id) })
      .then(wallets => {
        walletWrapper.customerWallet = wallets[0];
        return this.find({ outlet: mongoose.Types.ObjectId(order.outlet._id) })
      })
      .then(wallets => {
        walletWrapper.outletWallet = wallets[0];
        return updateWalletBalanceForOrder(walletWrapper, order);
      })
  }
};

async function updateWalletBalanceForOrder(
  walletWrapper,
  order
) {
  const customerWallet = walletWrapper.customerWallet;
  const outletWallet = walletWrapper.outletWallet;
  const adminWallet = walletWrapper.adminWallet;
  const delivererWallet = walletWrapper.delivererWallet;

  const session = await mongoose.startSession();
  const Wallet = require("./Wallet");

  try {
    session.startTransaction();

    let cashbacks = [];
    let cashbackForOutlet;

    customerWallet.availableCashBacks.forEach((cashback) => {
      if (cashback.outlet.toString() === order.outlet._id) {
        // remove the associated cashback for the outlet
        cashbackForOutlet = cashback;
      } else {
        cashbacks.push(cashback);
      }
    });

    let customerUpdate;

    if (!cashbackForOutlet && order.outlet.cashbackIsActive) {
      cashbackForOutlet = {
        cashbackBalance: order.creditedCashback,
        outlet: mongoose.Types.ObjectId(order.outlet._id),
      };
      customerUpdate = {
        $set: {
          balance: customerWallet.balance - order.totalPrice,
        },
        $push: {
          availableCashBacks: cashbackForOutlet,
        },
      };
    } else if (!cashbackForOutlet && !order.outlet.cashbackIsActive) {
      // cashback dont exists and outlet dont offer cashback
      customerUpdate = {
        $set: {
          balance: customerWallet.balance - order.totalPrice,
        },
      };
    } else {
      if (cashbackForOutlet && order.outlet.cashbackIsActive) {
        // cashback exists and outlet offers cashback
        // deduct cashback used for order
        cashbackForOutlet.cashbackBalance -= order.debitedCashback;
        // add in new cashback
        cashbackForOutlet.cashbackBalance += order.creditedCashback;
      } else if (cashbackForOutlet && !order.outlet.cashbackIsActive) {
        // cashback exists and outlet dont offer cashback
        cashbackForOutlet.cashbackBalance -= order.debitedCashback;
      }

      cashbacks.push(cashbackForOutlet);

      customerUpdate = {
        $set: {
          balance: customerWallet.balance - order.totalPrice,
          availableCashBacks: cashbacks,
        },
      };
    }

    await Wallet.findByIdAndUpdate(customerWallet._id, customerUpdate, {
      session,
    });

    const outletWalletUpdate = {
      $set: {
        balance: outletWallet.balance + order.totalPrice,
      },
    };
    await Wallet.findByIdAndUpdate(outletWallet._id, outletWalletUpdate, {
      session,
    });

    if (order.orderType === Constants.DELIVERY) {
      const delivererWalletUpdate = {
        $set: {
          balance: delivererWallet.balance + (order.deliveryFee - order.deliveryCommission)
        }
      };
      await Wallet.findByIdAndUpdate(delivererWallet._id, delivererWalletUpdate, {
        session,
      });

      const adminWalletUpdate = {
        $set: {
          balance: delivererWallet.balance + order.deliveryCommission
        }
      };
      await Wallet.findByIdAndUpdate(adminWallet._id, adminWalletUpdate, {
        session,
      });

      WalletTransaction.createNewDeliveryTransactions(
        delivererWallet,
        adminWallet,
        order
      )
    }

    WalletTransaction.createNewOrderTransactions(
      customerWallet,
      outletWallet,
      order
    );

    await session.commitTransaction();
  } catch (error) {
    Logger.error("TRANSACTION ERROR: ", error, DEBUG_ENV);
    await session.abortTransaction();
  }

  session.endSession();
}

Wallet.statics.updateWithdrawalFrequency = function (
  walletId,
  withdrawalFrequency
) {
  const update = {
    $set: {
      withdrawalFrequency: withdrawalFrequency,
      nextWithdrawalDate: moment().add(withdrawalFrequency, "days"),
    },
  };
  const options = {
    new: true,
  };
  return this.findByIdAndUpdate(walletId, update, options)
    .populate({
      path: "walletTransactions",
      populate: {
        path: "order",
        model: "Order",
        populate: {
          path: "outlet",
          model: "Outlet",
        },
      },
    })
    .populate("availableCashBacks")
    .populate("availableCashBacks.outlet")
    .exec();
};

// if admin needs to manually charge the subscription fee
Wallet.statics.debitSubscriptionFeeByWalletId = function (
  overduePaymentDate,
  walletId,
  creditCard
) {
  const creditCardInvolved = {
    cardName: creditCard.cardName,
    cardNumber: creditCard.cardNumber,
    truncatedCardNumber: creditCard.truncatedCardNumber,
    expiryDate: creditCard.expiryDate,
    cvv: creditCard.cvv,
    cardType: creditCard.cardType,
  };

  return this.findById(walletId)
    .populate("walletTransactions")
    .then((wallet) => {
      if (
        !wallet ||
        wallet.subscriptionPaymentDue === undefined ||
        wallet.subscriptionPaymentDue === 0
      ) {
        return;
      }
      const update = {
        $set: {
          subscriptionPaymentDue: 0,
        },
      };

      let beforeUpdate;
      return (
        this.findByIdAndUpdate(wallet._id, update)
          .then((outdatedWallet) => {
            beforeUpdate = outdatedWallet;
            return WalletTransaction.createNewSubscriptionPaymentForOverduePayment(
              overduePaymentDate,
              outdatedWallet,
              creditCardInvolved
            );
          })
          .then(() => {
            return this.creditIntoAdminWallet(
              beforeUpdate.subscriptionPaymentDue
            );
          })
      );
    });
};

Wallet.statics.updateSubscriptionPaymentDue = function (
  walletId,
  currentAccountTier,
  newAccountTier
) {
    return this.findById(walletId).populate('walletTransactions').then((wallet) => {
        if (!wallet) {
            return;
        }

        const daysInCurrentMonth = moment().daysInMonth()
        const remainingDaysTillEndOfMonth = moment().endOf('month').diff(moment(), 'days');
        const daysUpTillNow = moment().endOf('month').date() - remainingDaysTillEndOfMonth;

        const User1 = require("./User");
        User1.findAdminAccount().then((admin) => {
            let newSubscriptionPaymentDue = 0;
            switch (currentAccountTier) {
                case Constants.FREE:
                  if (newAccountTier === Constants.PREMIUM) {
                      newSubscriptionPaymentDue = admin.subscriptionFees.premium / daysInCurrentMonth * remainingDaysTillEndOfMonth;
                  } else if (newAccountTier === Constants.DELUXE) {
                      newSubscriptionPaymentDue = admin.subscriptionFees.deluxe / daysInCurrentMonth * remainingDaysTillEndOfMonth;
                  }
                  break;
                case Constants.PREMIUM:
                  if (newAccountTier === Constants.FREE) {
                      newSubscriptionPaymentDue = admin.subscriptionFees.premium / daysInCurrentMonth * daysUpTillNow;
                  } else if (newAccountTier === Constants.DELUXE) {
                      newSubscriptionPaymentDue
                          = admin.subscriptionFees.premium / daysInCurrentMonth * daysUpTillNow
                          + admin.subscriptionFees.deluxe / daysInCurrentMonth * remainingDaysTillEndOfMonth;
                  }
                  break;
                case Constants.DELUXE:
                  if (newAccountTier === Constants.FREE) {
                    // if overdue, dont update subscriptionPaymentDue
                    if (this.checkIfOverdueSubscription(wallet) === 'OVERDUE') {
                      newSubscriptionPaymentDue = wallet.subscriptionPaymentDue
                    } else {
                      newSubscriptionPaymentDue = admin.subscriptionFees.deluxe / daysInCurrentMonth * daysUpTillNow;
                    }
                    console.log(wallet.outlet)
                    Outlet.setOutletAsMaster(wallet.outlet, false);
                  } else if (newAccountTier === Constants.PREMIUM) {
                    newSubscriptionPaymentDue
                        = admin.subscriptionFees.deluxe / daysInCurrentMonth * daysUpTillNow
                        + admin.subscriptionFees.premium / daysInCurrentMonth * remainingDaysTillEndOfMonth;
                    Outlet.setOutletAsMaster(wallet.outlet, false);
                  }
                  break;
                default:
                  break;
            }
            const update = {
                $set: {
                    subscriptionPaymentDue: newSubscriptionPaymentDue.toFixed(2),
                },
            };
            return this.findByIdAndUpdate(wallet._id, update).exec();
        });
    });
};

Wallet.statics.checkIfOverdueSubscription = function (wallet) {
  const subscriptionPaymentTransaction = wallet.walletTransactions.filter(t => t.transactionType === Constants.SUBSCRIPTION_PAYMENT);
  const latestSubscriptionPaymentTransactionDate = subscriptionPaymentTransaction[0].transactionDate;
  if (moment(latestSubscriptionPaymentTransactionDate).isBefore(moment().endOf('month').format('YYYY-MM-DD')) && wallet.subscriptionPaymentDue === 0) {
    return 'PAID';
  } else {
    return moment(latestSubscriptionPaymentTransactionDate).month() === moment().month() - 1 ? 'PAID' : 'OVERDUE'
  }
}

Wallet.statics.creditIntoAdminWallet = function (paymentAmount) {
  const User = require("./User");
  User.findAdminAccount().then((admin) => {
    const update = {
      $set: {
        balance: admin.wallet.balance + paymentAmount,
      },
    };
    return this.findByIdAndUpdate(admin.wallet._id, update).exec();
  });
};


Wallet.statics.createGoal = function (
  walletId,
  newGoal
  ) {
    const update = {
      $push: {
        goals: newGoal
      },
    };
    this.findByIdAndUpdate(walletId, update).exec();
};

// pass in whole goal array
Wallet.statics.updateGoals = function (
  walletId,
  newGoals
  ) {
    const update = {
      $set: {
        goals: newGoals
      },
    };
    this.findByIdAndUpdate(walletId, update).exec();
};

/*
 * System
 */

Wallet.statics.debitFromWalletToBankAccountByOutletId = function (
  outletId,
  bankAccount
) {
  const bankAccountInvolved = {
    fullName: bankAccount.fullName,
    accountNumber: bankAccount.accountNumber,
    nameOfBank: bankAccount.nameOfBank,
  };

  const startDate = moment().subtract(1, "days");
  const endDate = moment().add(1, "days");

  const filter = {
    outlet: mongoose.Types.ObjectId(outletId),
    nextWithdrawalDate: {
      $gte: startDate,
      $lt: endDate,
    },
  };

  return this.find(filter).then((wallets) => {
    if (!wallets || wallets.length <= 0) {
      return;
    }

    const wallet = wallets[0];
    const update = {
      $set: {
        balance: 0,
        nextWithdrawalDate: moment().add(wallet.withdrawalFrequency, "days"),
      },
    };
    this.findByIdAndUpdate(wallet._id, update).then((outdatedWallet) =>
      WalletTransaction.createNewHawkerWithdrawalTransaction(
        outdatedWallet,
        bankAccountInvolved
      )
    );
  });
};

Wallet.statics.debitSubscriptionFeeByOutletId = function (
  outletId,
  creditCard,
  subscriptionFee
) {
  const creditCardInvolved = {
    cardName: creditCard.cardName,
    cardNumber: creditCard.cardNumber,
    truncatedCardNumber: creditCard.truncatedCardNumber,
    expiryDate: creditCard.expiryDate,
    cvv: creditCard.cvv,
    cardType: creditCard.cardType,
  };

  const filter = {
    outlet: mongoose.Types.ObjectId(outletId),
  };

  let paid = false;

  return this.find(filter).then((wallets) => {
    if (
      !wallets ||
      wallets.length <= 0 ||
      wallets[0].subscriptionPaymentDue === undefined
    ) {
      return;
    } else if (wallets[0].subscriptionPaymentDue === 0) {
      paid = true;
    }

    const wallet = wallets[0];
    const update = {
      $set: {
        subscriptionPaymentDue: subscriptionFee,
      },
    };
    this.findByIdAndUpdate(wallet._id, update).then((outdatedWallet) => {
      if (!paid) {
        WalletTransaction.createNewSubscriptionPayment(
          outdatedWallet,
          creditCardInvolved
        );
        this.creditIntoAdminWallet(outdatedWallet.subscriptionPaymentDue);
      }
    });
  });
};

export default mongoose.model("Wallet", Wallet, "Wallet");
