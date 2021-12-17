import { ResponseHelper } from "helpers";
import { ClientError, Constants } from "common";
import { Order, Outlet, Menu, Wallet } from "models";
import moment from "moment";
import * as _ from "lodash";

const { emitMessage } = require("../config/websocket");
const HawkerStore = require("../models/submodels/HawkerStore");
const DEBUG_ENV = "OrderController";

const OrderController = {
  request: {},
};

OrderController.request.createNewOrder = function (req, res) {
  const reqError = Order.validate(req.body, {
    customer: true,
    outlet: true,
    totalPrice: true,
    orderType: true,
    items: true,
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }

  return Order.createNewOrder(req.body).then(
    (createdOrder) => {
      ResponseHelper.success(res, createdOrder);
    },
    (error) => {
      ResponseHelper.error(res, new ClientError(error), DEBUG_ENV);
    }
  );
};

OrderController.request.createNewGuestHawkerOrder = function (req, res) {
  const reqError = Order.validate(req.body, {
    outlet: true,
    totalPrice: true,
    orderType: true,
    items: true,
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }

  return Order.createNewOrder(req.body).then(
    (createdOrder) => {
      ResponseHelper.success(res, createdOrder);
    },
    (error) => {
      ResponseHelper.error(res, new ClientError(error), DEBUG_ENV);
    }
  )
};

OrderController.request.createNewGuestCustomerOrder = function (req, res) {
  const reqError = Order.validate(req.body, {
    outlet: true,
    totalPrice: true,
    orderType: true,
    items: true,
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }

  return Order.createNewGuestCustomerOrder(req.body).then(
    (createdOrder) => {
      ResponseHelper.success(res, createdOrder);
    },
    (error) => {
      ResponseHelper.error(res, new ClientError(error), DEBUG_ENV);
    }
  );
};

OrderController.request.findOrderByOrderId = function (req, res) {
  const { orderId } = req.params;

  return Order.findOrderByOrderId(orderId).then((order) => {
    if (order) {
      return ResponseHelper.success(res, order);
    } else {
      return ResponseHelper.error(
        res,
        new ClientError(Constants.ERROR_ORDER_ID_NOT_FOUND),
        DEBUG_ENV
      );
    }
  });
};

OrderController.request.findOrdersById = function (req, res) {
  const orders = req.body;

  const ids = _.map(orders, (order) => order._id);

  return Order.findOrdersById(ids).then(
    (orders) => {
      return ResponseHelper.success(res, orders);
    },
    (error) => {
      return ResponseHelper.error(res, new ClientError(error), DEBUG_ENV);
    }
  );
};

OrderController.request.findOrdersByOrderId = function (req, res) {
  const orders = req.body;

  return Order.findOrdersById(orders).then(
    (orders) => {
      return ResponseHelper.success(res, orders);
    },
    (error) => {
      return ResponseHelper.error(res, new ClientError(error), DEBUG_ENV);
    }
  );
};


OrderController.request.findCompletedOrdersByCustomerId = function (req, res) {
  const { customerId } = req.params;
  return Order.findAllOrdersByCustomerId(customerId).then((allOrders) => {
    if (allOrders) {
      ResponseHelper.success(
        res,
        _.filter(
          allOrders,
          (order) =>
            order.orderStatus === Constants.COMPLETED ||
            order.orderStatus === Constants.CANCELLED ||
            order.orderStatus === Constants.REFUNDED
        )
      );
    } else {
      return ResponseHelper.success(res, []);
    }
  });
};

OrderController.request.findOngoingOrdersByCustomerId = function (req, res) {
  const { customerId } = req.params;
  return Order.findAllOrdersByCustomerId(customerId).then((allOrders) => {
    if (allOrders) {
      ResponseHelper.success(
        res,
        _.filter(
          allOrders,
          (order) =>
            order.orderStatus !== Constants.COMPLETED &&
            order.orderStatus !== Constants.CANCELLED &&
            order.orderStatus !== Constants.REFUNDED
        )
      );
    } else {
      return ResponseHelper.success(res, []);
    }
  });
};

OrderController.request.findAllHawkerCenters = function (req, res) {
  return Outlet.findAllHawkerCenters().then((allHawkerCenters) => {
    if (allHawkerCenters) {
      return ResponseHelper.success(res, allHawkerCenters);
    } else {
      return ResponseHelper.success(res, []);
    }
  });
};

OrderController.request.findAllHawkerOutletsByHawkerCentre = function (
  req,
  res
) {
  const { hawkerCentreName } = req.params;
  return Menu
    .findAllActiveMenus()
    .then((allActiveMenus) => {
      if (allActiveMenus) {
        const hawkerStoreArr = [];
        _.forEach(allActiveMenus, (menu) => {
          if (menu.outlet && menu.outlet.hawkerCentreName === hawkerCentreName) {
            hawkerStoreArr.push(
              new HawkerStore(
                menu.outlet,
                _.filter(menu.foodBundles, (foodBundle) => foodBundle.isPromotion)
              )
            );
          }
        });
        return ResponseHelper.success(res, hawkerStoreArr);
      } else {
        return ResponseHelper.success(res, []);
      }
    });
};

OrderController.request.findCompletedOrdersByOutletId = function (req, res) {
  const { outletId } = req.params;
  return Order.findAllOrdersByOutletId(outletId).then((allOrders) => {
    if (allOrders) {
      ResponseHelper.success(
        res,
        _.filter(
          allOrders,
          (order) =>
            order.orderStatus === Constants.COMPLETED ||
            order.orderStatus === Constants.CANCELLED
        )
      );
    } else {
      return ResponseHelper.success(res, []);
    }
  });
};

OrderController.request.findAllInProgressOrdersByOutletId = function (
  req,
  res
) {
  const { outletId } = req.params;

  return Order.findAllInProgressOrdersByOutletId(outletId).then(
    (orders) => ResponseHelper.success(res, orders),
    (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
};

OrderController.request.updateOrderFoodItemStatusForMultipleOrders = function (
  req,
  res
) {
  const { foodItemId, foodItemStatus } = req.params;
  const orders = req.body;

  const ids = _.map(orders, (order) => order._id);

  return Order.updateOrderFoodItemStatusForMultipleOrders(
    ids,
    foodItemId,
    foodItemStatus
  )
    .then((res) => Order.findOrdersById(ids))
    .then(
      (updatedOrders) => {
        for (const order of updatedOrders) {
          emitMessage(Constants.UPDATE_ORDER_STATUS, order);
        }

        return ResponseHelper.success(res, updatedOrders);
      },
      (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    );
};

OrderController.request.updateOrderBundleItemStatusForMultipleOrders = function (req, res) {
  const { foodBundleId, foodItemId, foodBundleStatus } = req.params;
  const orders = req.body;

  const ids = _.map(orders, (order) => order._id);
  return Order.updateOrderBundleItemStatusForMultipleOrders(
    ids,
    foodBundleId,
    foodItemId,
    foodBundleStatus
  )
    .then((res) => Order.findOrdersById(ids))
    .then(
      (updatedOrders) => {
        for (const order of updatedOrders) {
          emitMessage(Constants.UPDATE_ORDER_STATUS, order);
        }

        return ResponseHelper.success(res, updatedOrders);
      },
      (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    );
};

/**
UNPAID -> RECEIVED -> PREPARING -> READY -> COMPLETED
PAID -> RECEIVED -> PREPARING -> READY -> COMPLETED
CASH ORDER -> CANCELLED
DIGITAL ORDER -> REFUNDING -> REFUNDED
UNPAID -> PAID -> RECEIVED -> PREPARING -> READY -> ACCEPTED -> PICKED_UP -> ON_THE_WAY -> REACHING -> COMPLETED
PAID -> RECEIVED -> PREPARING -> READY -> ACCEPTED -> PICKED_UP -> ON_THE_WAY -> REACHING -> COMPLETED
*/
OrderController.request.updateOrderStatus = function (req, res) {
  const { newStatus } = req.params;
  const order = req.body;
  const reqError = Order.validate(order, {
    outlet: true,
    orderStatus: true,
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }


  let stateError = false;
  switch (order.orderStatus) {
    case Constants.UNPAID:
      if (newStatus !== Constants.PAID) {
        stateError = true;
      }
      break;
    case Constants.RECEIVED:
      if (newStatus !== Constants.PREPARING) {
        stateError = true;
      }
      break;
    case Constants.PREPARING:
      if (newStatus !== Constants.READY && newStatus !== Constants.RECEIVED) {
        stateError = true;
      }
      break;
    case Constants.READY:
      if (
        newStatus !== Constants.COMPLETED &&
        newStatus !== Constants.PREPARING &&
        (order.orderType === Constants.DELIVERY && newStatus !== Constants.ACCEPTED)
      ) {
        stateError = true;
      }
      break;
    case Constants.ACCEPTED:
      if (
        newStatus !== Constants.PICKED_UP
      ) {
        stateError = true;
      }
      break;
    case Constants.PICKED_UP:
      if (
        newStatus !== Constants.ON_THE_WAY
      ) {
        stateError = true;
      }
      break;
    case Constants.ON_THE_WAY:
      if (
        newStatus !== Constants.REACHING
      ) {
        stateError = true;
      }
      break;
    case Constants.REACHING:
      if (
        newStatus !== Constants.COMPLETED
      ) {
        stateError = true;
      }
      break;
    default:
      stateError = true;
  }

  if (stateError) {
    return ResponseHelper.error(
      res,
      new ClientError(Constants.ERROR_WRONG_NEXT_STATUS_FOR_ORDER),
      DEBUG_ENV
    );
  }

  return Order
    .updateOrderStatus(order, newStatus)
    .then(
      (updatedOrder) => {
        if (updatedOrder.orderStatus === Constants.COMPLETED
          && updatedOrder.paymentType === Constants.DIGITAL) {
          Wallet.debitCustomerWalletForOrder(order);
        }
        emitMessage(Constants.UPDATE_ORDER_STATUS, updatedOrder);
        return ResponseHelper.success(res, updatedOrder);
      },
      (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    );
};

OrderController.request.cancelOrder = function (req, res) {
  const order = req.body;

  const reqError = Order.validate(order, {
    outlet: true,
    orderStatus: true,
    paymentType: true,
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }

  return Order.updateOrderStatus(order, Constants.CANCELLED).then(
    (updatedOrder) => {
      emitMessage(Constants.CANCEL_ORDER, updatedOrder);
      return ResponseHelper.success(res, updatedOrder);
    },
    (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
};

OrderController.request.updateOrder = function (req, res) {
  const order = req.body;
  const reqError = Order.validate(order, {
    outlet: true,
    orderType: true,
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }
  return Order.updateOrder(order).then(
    (updatedOrder) => {
      emitMessage(Constants.UPDATE_ORDER, updatedOrder);
      return ResponseHelper.success(res, updatedOrder);
    },
    (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
};

OrderController.request.cancelAllInProgressOrdersByOutletId = function (
  req,
  res
) {
  const { outletId } = req.params;

  return Order.findAllInProgressOrdersByOutletId(outletId)
    .then((inProgressOrders) => {
      const orderIdToCancel = [];
      // const orderIdToRefund = [];

      for (let order of inProgressOrders) {
        order.orderStatus = Constants.CANCELLED;
        orderIdToCancel.push(order._id);
        //notify customer
        emitMessage(Constants.UNABLE_TO_FULFILL_ORDER, order);
      }

      return Order.markOrdersAsCancelled(orderIdToCancel);
    })
    .then(
      (success) => ResponseHelper.success(res),
      (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    );
};

OrderController.request.retrieveCompletedOrdersByOutletId = function (
  req,
  res
) {
  const { outletId, startDate, endDate } = req.params;

  let startDateVal = moment(startDate);
  let endDateVal = moment(endDate);

  if (!startDate || !startDateVal.isValid() || !endDateVal.isValid()) {
    return ResponseHelper.error(
      res,
      new ClientError(Constants.ERROR_INCORRECT_INPUT_OF_DATE),
      DEBUG_ENV
    );
  } else if (!endDate) {
    endDateVal = moment(startDate).add(1, "days");
  }

  return Order.findAllOrdersByOutletIdAndStatusAndTime(outletId, Constants.COMPLETED, startDateVal, endDateVal).then(
    (success) => ResponseHelper.success(res, success),
    (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
};

/**
 * LEADER BOARD
 */

OrderController.request.findAllHawkerCentresAndCuisineTypes = function (req, res) {

  return Order.findAllHawkerCentresAndCuisineTypes().then(
    retrievedHawkerCenters => ResponseHelper.success(res, retrievedHawkerCenters),
    error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
};

OrderController.request.findNumOfSalesForAllHawkers = function (req, res) {

  return Order.findNumOfSalesForAllHawkers().then(
    retrievedNumOfSales => ResponseHelper.success(res, retrievedNumOfSales),
    error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
};

OrderController.request.findNumOfSalesForAllHawkersForPastDays = function (req, res) {

  const { numOfDays } = req.params;

  if (isNaN(numOfDays)) {
    return ResponseHelper.error(
      res,
      new ClientError(Constants.ERROR_INCORRECT_INPUT_OF_NUMBER_OF_DAYS),
      DEBUG_ENV
    );
  }

  return Order.findNumOfSalesForAllHawkersForPastDays(numOfDays).then(
    retrievedNumOfSales => ResponseHelper.success(res, retrievedNumOfSales),
    error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
};

OrderController.request.findNumOfSalesForAllFoodItem = function (req, res) {

  let individualItem;
  let foodBundleItem;

  Order.findFoodItemsInIndividualOrderItems().then(
    retrievedIndividualItem => {
      individualItem = retrievedIndividualItem;

      Order.findFoodItemsInFoodBundleOrderItems().then(
        retrievedFoodBundleItem => {
          foodBundleItem = retrievedFoodBundleItem;

          for (var i = 0; i < foodBundleItem.length; i++) {
            if (individualItem.filter(e => String(e._id) === String(foodBundleItem[i]._id)).length > 0) {
              for (var j = 0; j < individualItem.length; j++) {
                if (String(individualItem[j]._id) === String(foodBundleItem[i]._id)) {
                  individualItem[j].numOfSales += foodBundleItem[i].numOfSales;
                  break;
                }
              }
            } else {
              individualItem.push(foodBundleItem[i]);
            }
          }

          individualItem.sort((a, b) => b.numOfSales - a.numOfSales);

          ResponseHelper.success(res, individualItem)

        },
        error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
      )
    },
    error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
};

OrderController.request.findNumOfSalesForAllFoodItemForPastDays = function (req, res) {

  const { numOfDays } = req.params;

  let individualItem;
  let foodBundleItem;

  if (isNaN(numOfDays)) {
    return ResponseHelper.error(
      res,
      new ClientError(Constants.ERROR_INCORRECT_INPUT_OF_NUMBER_OF_DAYS),
      DEBUG_ENV
    );
  }

  Order.findFoodItemsInIndividualOrderItemsForPastDays(numOfDays).then(
    retrievedIndividualItem => {
      individualItem = retrievedIndividualItem;

      Order.findFoodItemsInFoodBundleOrderItemsForPastDays(numOfDays).then(
        retrievedFoodBundleItem => {
          foodBundleItem = retrievedFoodBundleItem;

          for (var i = 0; i < foodBundleItem.length; i++) {
            if (individualItem.filter(e => String(e._id) === String(foodBundleItem[i]._id)).length > 0) {
              for (var j = 0; j < individualItem.length; j++) {
                if (String(individualItem[j]._id) === String(foodBundleItem[i]._id)) {
                  individualItem[j].numOfSales += foodBundleItem[i].numOfSales;
                  break;
                }
              }
            } else {
              individualItem.push(foodBundleItem[i]);
            }
          }

          individualItem.sort((a, b) => b.numOfSales - a.numOfSales);

          ResponseHelper.success(res, individualItem)

        },
        error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
      )
    },
    error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
};

/**
 * DELIVERY
 */

OrderController.request.findAllDeliveryOrders = function (req, res) {
  return Order
    .findAllDeliveryOrders()
    .then((allHawkerCenters) => {
      if (allHawkerCenters) {
        return ResponseHelper.success(res, allHawkerCenters);
      } else {
        return ResponseHelper.success(res, []);
      }
    });
};

OrderController.request.findAllDeliveryOrdersByHawkerCenter = function (req, res) {
  const { hawkerCenterName } = req.params;

  return Order
    .findAllDeliveryOrdersByHawkerCenter(hawkerCenterName)
    .then((orders) => {
      if (orders) {
        return ResponseHelper.success(res, orders);
      } else {
        return ResponseHelper.success(res, []);
      }
    });
};

OrderController.request.findAllCompletedDeliveryOrdersByDelivererId = function (req, res) {
  const { delivererId } = req.params;

  return Order
    .findAllCompletedDeliveryOrdersByDelivererId(delivererId)
    .then((orders) => {
      if (orders) {
        return ResponseHelper.success(res, orders);
      } else {
        return ResponseHelper.success(res, []);
      }
    });
};

OrderController.request.generateHawkerAnalytics = function (req, res) {
  const { outletId } = req.params
  const { startDate, endDate, interval } = req.body;

  let startDateM = moment(startDate);
  let endDateM = moment(endDate);
  let intervalTitle;
  let formatDate;
  switch (interval) {
    case "days":
      intervalTitle = "for the Month";
      formatDate = 'DD/MM';
      break;
    case "months":
      intervalTitle = "for the Year";
      formatDate = 'MM/YYYY';
      break;
    case "hours":
      intervalTitle = "for the Day";
      formatDate = 'h:mm aaa';
      break;
    default:
      intervalTitle = "From";
      break;
  }

  let tempDate = moment(startDateM);

  let data = {
    sales: {
      name: `Sales ${intervalTitle} : ${startDateM.format('DD/MM/YYYY')}-${endDateM.format('DD/MM/YYYY')}`,
      totalNumOfSales: 0,
      series: []
    },
  }

  while (tempDate.startOf('day').isSameOrBefore(endDateM.startOf('day'))) {
    data.sales.series.push(
      {
        name: tempDate.format(formatDate),
        value: 0
      }
    )
    tempDate.add(1, interval);
  }
  return Order.findAllOrdersByOutletIdAndStatusAndTime(outletId, startDateM, endDateM.subtract(1, 'days'))
    .then(orders => {
      console.log(orders);
      for (let o of orders) {
        data.sales.series
          .filter(x => moment(o.completedTime).format(formatDate).toString() === x.name)[0].value += o.totalPrice;
      }
      return ResponseHelper.success(res, data);
    })
    .catch((error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV));
}

OrderController.request.generateHawkerAnalyticsEarnings = function (req, res) {
  const { outletId } = req.params
  const { startDate, endDate, interval } = req.body;

  let startDateM = moment(startDate);
  let endDateM = moment(endDate);
  let intervalTitle;
  let formatDate;
  let intervalCode;
  switch (interval) {
    case "days":
      intervalTitle = "for the Month";
      intervalCode = "day";
      formatDate = 'DD/MM';
      break;
    case "months":
      intervalTitle = "for the Year";
      intervalCode = "month";
      formatDate = 'MM/YYYY';
      break;
    case "hours":
      intervalTitle = "for the Day";
      intervalCode = "hour";
      formatDate = 'h:mm aaa';
      break;
    case "years":
      intervalTitle = "for the Day";
      intervalCode = "year";
      formatDate = 'YYYY';
      break;
    default:
      intervalTitle = "From";
      break;
  }

  let tempDate = moment(startDateM);

  let data = {
    sales: {
      // name: `Sales ${intervalTitle} : ${startDateM.format('DD/MM/YYYY')}-${endDateM.format('DD/MM/YYYY')}`,
      name: `Sales ${intervalTitle}`,
      totalEarnings: 0,
      series: []
    },
  }

  while (tempDate.startOf(intervalCode).isSameOrBefore(endDateM.startOf(intervalCode))) {
    data.sales.series.push(
      {
        name: tempDate.format(formatDate),
        value: 0
      }
    )
    tempDate.add(1, interval);
  }

  if(interval === "days") {
    endDateM = endDateM.subtract(1, 'days');
  }

  return Order.findAllEarningsByOutletIdAndTime(outletId, startDateM.toDate(), endDateM.toDate()).then(
    retrievedCollatedEarnings => {
      for(const res of retrievedCollatedEarnings) {
        data.sales.totalEarnings += res.earnings;
        data.sales.series
        .filter(x => moment(res._id).format(formatDate).toString() === x.name)[0].value += res.earnings;
      }
      return ResponseHelper.success(res, data)
    },
    error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
}

export default OrderController;
