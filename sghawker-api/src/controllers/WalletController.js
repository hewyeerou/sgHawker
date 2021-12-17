import _ from "lodash";
import moment from "moment";
import { ClientError, Constants } from "common";
import { ResponseHelper } from "helpers";
import { Wallet, WalletTransaction } from "models";

const DEBUG_ENV = "WalletController";

const WalletController = {
  request: {},
};

WalletController.request.createNewWalletForOutlet = function (req, res) {
  const { outletId } = req.params;
  const { withdrawalFrequency } = req.body;

  const reqError = Wallet.validate(req.body, {
    withdrawalFrequency: true,
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }

  return Wallet.createNewWallet(outletId, withdrawalFrequency, true)
    .then((createdWallet) => ResponseHelper.success(res, createdWallet))
    .catch((error) =>
      ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    );
};

WalletController.request.createNewWalletForCustomer = function (req, res) {
  const { customerId } = req.params;

  return Wallet.createNewWallet(customerId, null, false)
    .then((createdWallet) => ResponseHelper.success(res, createdWallet))
    .catch((error) =>
      ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    );
};

WalletController.request.findWalletByOwnerId = function (req, res) {
  const { ownerId } = req.params;

  return Wallet.findWalletByOwnerId(ownerId)
    .then((wallets) => ResponseHelper.success(res, wallets[0]))
    .catch((error) =>
      ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    );
};

WalletController.request.topUpFromCreditCardToWallet = function (req, res) {
  const { walletId } = req.params;
  const { topUpAmount, creditCardInvolved } = req.body;

  let reqError = Wallet.validate(req.body, {
    topUpAmount: true,
  });

  reqError = WalletTransaction.validate(req.body, {
    creditCardInvolved: true,
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }

  return Wallet.topUpFromCreditCardToWallet(
    walletId,
    topUpAmount,
    creditCardInvolved
  )
    .then((updatedWallet) => ResponseHelper.success(res, updatedWallet))
    .catch((error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV));
};

WalletController.request.refundForOrder = function (req, res) {
  const { fromWallet, toWallet, amountToRefund, order } = req.body;

  let reqError = Wallet.validate(req.body, {
    fromWallet: true,
    toWallet: true,
    amountToRefund: true,
    order: true,
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }

  return Wallet
    .refundForOrder(fromWallet, toWallet, amountToRefund, order)
    .then((response) => ResponseHelper.success(res))
    .catch((error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV));
};

/**
 * Admin will be able to set new next withdrawal date if the system was unsuccessful
 */
WalletController.request.debitFromWalletToBankAccount = function (req, res) {
  const { walletId } = req.params;
  const { bankAccountInvolved, setNewNextWithdrawalDate } = req.body;

  const reqError = WalletTransaction.validate(req.body, {
    bankAccountInvolved: true,
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }

  return Wallet.debitFromWalletToBankAccount(
    walletId,
    bankAccountInvolved,
    setNewNextWithdrawalDate
  )
    .then((updatedWallet) => ResponseHelper.success(res, updatedWallet))
    .catch((error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV));
};

WalletController.request.updateWithdrawalFrequency = function (req, res) {
  const { walletId } = req.params;
  const { withdrawalFrequency } = req.body;

  const reqError = Wallet.validate(req.body, {
    withdrawalFrequency: true,
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }

  return Wallet.updateWithdrawalFrequency(
    walletId,
    withdrawalFrequency
  )
    .then((updatedWallet) => ResponseHelper.success(res, updatedWallet))
    .catch((error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV));

};

WalletController.request.debitSubscriptionFeeByWalletId = function (req, res) {
  const { walletId } = req.params;
  const { overduePaymentDate, creditCard}  = req.body;

  return Wallet.debitSubscriptionFeeByWalletId(
    overduePaymentDate,
    walletId,
    creditCard
  )
    .then((updatedWallet) => ResponseHelper.success(res, updatedWallet))
    .catch((error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV));

};

WalletController.request.generatePlatformEarningDashboard = function (req, res) {
  const { walletId } = req.params
  const { startDate, endDate } = req.body;

  let startOfPrevMonth;
  let endOfPrevMonth;
  let tempDate;
  let startDateFilter;
  let endDateFilter;

  if (startDate && endDate) {
    startOfPrevMonth = moment(startDate);
    endOfPrevMonth = moment(endDate);

    tempDate = moment(startDate);
    startDateFilter = moment(startDate);
    endDateFilter = moment(endDate);
  } else {
    startOfPrevMonth = moment().subtract(1, 'months').startOf('month');
    endOfPrevMonth = moment().subtract(1, 'months').endOf('month');

    tempDate = moment().subtract(1, 'years');
    startDateFilter = moment().subtract(1, 'years');
    endDateFilter = moment();
  }

  let data = {
    prevMonthEarning: {
      name: `Earning: ${startOfPrevMonth.format('DD/MM/YYYY')}-${endOfPrevMonth.format('DD/MM/YYYY')}`,
      value: 0,
    },
    prevMonthCommission: {
      name: `Delivery Commission: ${startOfPrevMonth.format('DD/MM/YYYY')}-${endOfPrevMonth.format('DD/MM/YYYY')}`,
      value: 0,
    },
    prevMonthSubscription: {
      name: `Subscription: ${startOfPrevMonth.format('DD/MM/YYYY')}-${endOfPrevMonth.format('DD/MM/YYYY')}`,
      value: 0,
    },
    prevMonthRefund: {
      name: `Refund: ${startOfPrevMonth.format('DD/MM/YYYY')}-${endOfPrevMonth.format('DD/MM/YYYY')}`,
      value: 0,
    },
    earningByMonth: {
      totalEarning: {
        name: 'Total Earning',
        series: []
      },
      deliveryCommission: {
        name: 'Total Commission',
        series: []
      },
      subscription: {
        name: 'Total Subscription',
        series: []
      },
      refundForOrder: {
        name: 'Total Refund',
        series: []
      },
    },
    subscriberByMonth: {
      subscriber: {
        name: 'Total Subscriber',
        series: []
      }
    }
  };

  while (!tempDate.isSame(endDateFilter)) {
    data.earningByMonth.deliveryCommission.series.push(
      {
        name: tempDate.format('MM/YYYY'),
        value: 0
      }
    );
    data.earningByMonth.subscription.series.push(
      {
        name: tempDate.format('MM/YYYY'),
        value: 0
      }
    );
    data.earningByMonth.refundForOrder.series.push(
      {
        name: tempDate.format('MM/YYYY'),
        value: 0
      }
    );
    data.earningByMonth.totalEarning.series.push(
      {
        name: tempDate.format('MM/YYYY'),
        value: 0
      }
    );

    data.subscriberByMonth.subscriber.series.push(
      {
        name: tempDate.format('MM/YYYY'),
        value: 0
      }
    );

    tempDate = tempDate.add(1, 'months');
  }

  return WalletTransaction
    .findTransactionByWalletId(walletId, startDateFilter, endDateFilter.subtract(1, 'months'))
    .then(transactionPrevMonth => {

      for (let transaction of transactionPrevMonth) {
        switch (transaction.transactionType) {
          case Constants.REFUND:
            if (moment(transaction.transactionDate).isBetween(startOfPrevMonth, endOfPrevMonth, '[]')) {
              data.prevMonthRefund.value += transaction.refundedAmount;
            }

            data.earningByMonth.refundForOrder.series.filter(x => moment(transaction.transactionDate).format('MM/YYYY').toString() === x.name)[0].value += transaction.refundedAmount;
            break;
          case Constants.SUBSCRIPTION_PAYMENT:
            if (moment(transaction.transactionDate).isBetween(startOfPrevMonth, endOfPrevMonth, '[]')) {
              data.prevMonthSubscription.value += transaction.paymentAmount;
              data.prevMonthEarning.value += transaction.paymentAmount;
            }

            data.earningByMonth.subscription.series.filter(x => moment(transaction.transactionDate).format('MM/YYYY').toString() === x.name)[0].value += transaction.paymentAmount;
            data.earningByMonth.totalEarning.series.filter(x => moment(transaction.transactionDate).format('MM/YYYY').toString() === x.name)[0].value += transaction.paymentAmount;
            data.subscriberByMonth.subscriber.series.filter(x => moment(transaction.transactionDate).format('MM/YYYY').toString() === x.name)[0].value += 1;
            break;
          case Constants.DELIVERY:
            if (moment(transaction.transactionDate).isBetween(startOfPrevMonth, endOfPrevMonth, '[]')) {
              data.prevMonthCommission.value += transaction.deliveryFeeCommission;
              data.prevMonthEarning.value += transaction.deliveryFeeCommission;
            }

            data.earningByMonth.deliveryCommission.series.filter(x => moment(transaction.transactionDate).format('MM/YYYY').toString() === x.name)[0].value += transaction.deliveryFeeCommission;
            data.earningByMonth.totalEarning.series.filter(x => moment(transaction.transactionDate).format('MM/YYYY').toString() === x.name)[0].value += transaction.deliveryFeeCommission;
            break;
          default:
        }
      }

      return ResponseHelper.success(res, data);
    })
    .catch((error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV));
}

export default WalletController;
