import mongoose, { Schema } from "mongoose";
import _ from "lodash";
import moment from "moment";
import { Constants } from "common";
import settings from "../config/settings";

const { emitMessage } = require("../config/websocket");
const User = require("./User");
const Outlet = require("./Outlet");
const DeliveryHawkerCenter = require("./submodels/DeliveryHawkerCenter");

const Order = new Schema({
  orderCreationTime: {
    type: Date,
    required: true
  },
  orderPickUpTime: {
    type: Date,
  },
  completedTime: {
    type: Date,
  },
  estimatedTimeTillCompletion: {
    type: Number,
    default: 0,
  },
  // actual amount paid excluding deducted cashback
  // includes delivery fee
  // TODO: need to ensure that delivery fee is deducted from the totalPrice before computing the cashback
  totalPrice: {
    type: Number,
    required: true,
  },
  debitedCashback: {
    type: Number,
    default: 0
  },
  creditedCashback: {
    type: Number,
    default: 0
  },
  // delivery fee - commission = earning for deliverer
  deliveryFee: {
    type: Number,
    default: 0
  },
  deliveryCommission: {
    type: Number,
    default: 0
  },
  orderType: {
    type: String,
    required: true,
    enum: [Constants.DINE_IN, Constants.DELIVERY, Constants.TAKE_AWAY],
  },
  paymentType: {
    type: String,
    required: true,
    enum: [Constants.CASH, Constants.DIGITAL],
  },
  orderStatus: {
    type: String,
    required: true,
    enum: [
      Constants.UNPAID,
      Constants.PAID,
      Constants.CANCELLED,
      Constants.RECEIVED,
      Constants.PREPARING,
      Constants.READY,
      Constants.COMPLETED,
      Constants.REFUNDING,
      Constants.REFUNDED,
      Constants.PICKED_UP,
      Constants.ON_THE_WAY,
      Constants.REACHING,
    ],
  },
  specialNote: {
    type: String,
    trim: true,
  },
  foodBundleOrderItems: [
    {
      bundle_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      bundleName: {
        type: String,
      },
      bundleSubtotal: {
        type: Number,
      },
      bundleQuantity: {
        type: Number,
        default: 1,
      },
      bundleItems: [
        {
          foodItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FoodItem",
            required: true,
          },
          itemSubtotal: {
            type: Number,
            required: true,
          },
          orderItemStatus: {
            type: String,
            default: Constants.NEW,
            enum: [
              Constants.NEW,
              Constants.PREPARING,
              Constants.READY,
              Constants.NOT_AVAILABLE,
            ],
          },
          selectedCustomizations: [
            {
              customizationName: {
                type: String,
                required: true,
                trim: true,
              },
              selectedOption: {
                optionName: {
                  type: String,
                  required: true,
                },
                optionCharge: {
                  type: Number,
                  required: true,
                },
              },
            },
          ],
        },
      ],
    },
  ],
  individualOrderItems: [
    {
      foodItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FoodItem",
        required: true,
      },
      itemQuantity: {
        type: Number,
        default: 1,
      },
      itemSubtotal: {
        type: Number,
        required: true,
      },
      orderItemStatus: {
        type: String,
        default: Constants.NEW,
        enum: [
          Constants.NEW,
          Constants.PREPARING,
          Constants.READY,
          Constants.NOT_AVAILABLE,
        ],
      },
      selectedCustomizations: [
        {
          customizationName: {
            type: String,
            required: true,
            trim: true,
          },
          selectedOption: {
            optionName: {
              type: String,
              required: true,
            },
            optionCharge: {
              type: Number,
              required: true,
            },
          },
        },
      ],
    },
  ],
  deliverer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  outlet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Outlet",
    required: true,
  },
});

Order.statics.validate = function (order, fields) {
  if (fields.orderPickUpTime) {
    if (!order.completedTime) {
      return Constants.ERROR_ADVANCE_ORDER_REQUIRE_PICK_UP_TIME;
    }
  }
  if (fields.completedTime) {
    if (!order.completedTime) {
      return Constants.ERROR_ORDER_COMPLETION_TIME_REQUIRED;
    }
  }
  if (fields.estimatedTimeTillCompletion) {
    if (!order.estimatedTimeTillCompletion) {
      return Constants.ERROR_ORDER_ESTIMATED_TIME_REQUIRED;
    }
  }
  if (fields.customer) {
    if (!order.customer) {
      return Constants.ERROR_ORDER_CUSTOMER_REQUIRED;
    }
  }
  if (fields.paymentType) {
    if (!order.paymentType) {
      return Constants.ERROR_ORDER_PAYMENT_TYPE_REQUIRED;
    }
  }
  if (fields.outlet) {
    if (!order.outlet) {
      return Constants.ERROR_ORDER_OUTLET_REQUIRED;
    }
  }
  if (fields.totalPrice) {
    if (!order.totalPrice) {
      return Constants.ERROR_ORDER_TOTAL_PRICE_REQUIRED;
    }
  }
  if (fields.orderType) {
    if (!order.orderType) {
      return Constants.ERROR_ORDER_TYPE_REQUIRED;
    }
  }
  if (fields.orderStatus) {
    if (!order.orderStatus) {
      return Constants.ERROR_ORDER_STATUS_REQUIRED;
    }
  }
  if (fields.specialNote) {
    if (!order.specialNote) {
      return Constants.ERROR_ORDER_SPECIAL_NOTE_REQUIRED;
    }
  }
  // check that the order contains items
  if (fields.items) {
    if (
      (!order.foodBundleOrderItems ||
        order.foodBundleOrderItems.length === 0) &&
      (!order.individualOrderItems || order.individualOrderItems.length === 0)
    ) {
      return Constants.ERROR_EMPTY_ORDER;
    }

    if (order.individualOrderItems) {
      _.forEach(order.individualOrderItems, (orderItem) => {
        if (!orderItem.foodItem) {
          return Constants.ERROR_ORDER_FOOD_ITEM_REQUIRED;
        }
        if (!orderItem.itemSubtotal) {
          return Constants.ERROR_ORDER_FOOD_ITEM_SUBTOTAL_REQUIRED;
        }
      });
    }

    if (order.foodBundleOrderItems) {
      _.forEach(order.foodBundleOrderItems, (foodBundle) => {
        if (!foodBundle.bundle_id) {
          return Constants.ERROR_ORDER_FOOD_BUNDLE_UUID_REQUIRED;
        }
        if (!foodBundle.bundleName) {
          return Constants.ERROR_ORDER_FOOD_BUNDLE_NAME_REQUIRED;
        }
        if (!foodBundle.bundleSubtotal) {
          return Constants.ERROR_ORDER_FOOD_BUNDLE_SUBTOTAL_REQUIRED;
        }
        if (!foodBundle.bundleItems || foodBundle.bundleItems.length === 0) {
          return Constants.ERROR_ORDER_FOOD_BUNDLE_ITEMS_REQUIRED;
        }
      });
    }
  }

  return null;
};

/**
 * Customer
 */

Order.statics.createNewOrder = function (orderData) {
  orderData.orderCreationTime = Date.now();
  if (orderData.customer) {
    orderData.customer = mongoose.Types.ObjectId(orderData.customer._id);
  }
  if (orderData.deliverer) {
    orderData.customer = mongoose.Types.ObjectId(orderData.deliverer._id);
    orderData.deliveryCommission = orderData.deliveryFee * settings.DELIVERY_COMMISSION_RATE_IN_PERCENTAGE;
  }
  orderData.outlet = mongoose.Types.ObjectId(orderData.outlet);
  orderData.foodBundleOrderItems = _.map(
    orderData.foodBundleOrderItems,
    (bundle) => {
      bundle.bundle_id = mongoose.Types.ObjectId(bundle.bundle_id);
      bundle.bundleItems = _.map(bundle.bundleItems, (item) => {
        item.foodItem = mongoose.Types.ObjectId(item.foodItem._id);
        return item;
      });
      return bundle;
    }
  );
  orderData.individualOrderItems = _.map(
    orderData.individualOrderItems,
    (orderItem) => {
      orderItem.foodItem = mongoose.Types.ObjectId(orderItem.foodItem._id);
      return orderItem;
    }
  );
  if (orderData.paymentType === Constants.CASH) {
    if (orderData.customer) {
      orderData.orderStatus = Constants.UNPAID;
    } else {
      orderData.orderStatus = Constants.PAID;
    }
  } else {
    orderData.orderStatus = Constants.PAID;
  }

  return Promise.resolve()
    .then(() => this.create(orderData))
    .then((newOrder) => {
      const update = {
        $push: { orders: newOrder._id },
      };

      const options = {
        new: true,
      };

      // add created order to customer and outlet
      if (orderData.customer) {
        User.findByIdAndUpdate(newOrder.customer, update, options).exec();
      }
      Outlet.findByIdAndUpdate(newOrder.outlet, update, options).exec();
      return newOrder;
    });
};

Order.statics.createNewGuestCustomerOrder = function (orderData) {
  orderData.orderCreationTime = Date.now();
  orderData.outlet = mongoose.Types.ObjectId(orderData.outlet);
  orderData.foodBundleOrderItems = _.map(
    orderData.foodBundleOrderItems,
    (bundle) => {
      bundle.bundle_id = mongoose.Types.ObjectId(bundle.bundle_id);
      bundle.bundleItems = _.map(bundle.bundleItems, (item) => {
        item.foodItem = mongoose.Types.ObjectId(item.foodItem._id);
        return item;
      });
      return bundle;
    }
  );
  orderData.individualOrderItems = _.map(
    orderData.individualOrderItems,
    (orderItem) => {
      orderItem.foodItem = mongoose.Types.ObjectId(orderItem.foodItem._id);
      return orderItem;
    }
  );

  orderData.orderStatus = Constants.UNPAID;

  return Promise.resolve()
    .then(() => this.create(orderData))
    .then((newOrder) => {
      const update = {
        $push: { orders: newOrder._id },
      };

      const options = {
        new: true,
      };

      // add created order and outlet
      Outlet.findByIdAndUpdate(newOrder.outlet, update, options).exec();
      return newOrder;
    });
};

Order.statics.findOrderByOrderId = function (orderId) {
  return this.findById(orderId)
    .populate("customer")
    .populate({
      path: "outlet",
      populate: {
        path: "hawkerAccount",
        model: "User"
      },
    })
    .populate("foodBundleOrderItems.bundleItems.foodItem")
    .populate("individualOrderItems.foodItem")
    .exec();
};

Order.statics.findAllOrdersByCustomerId = function (customerId) {
  const filterOptions = {
    customer: customerId,
  };
  return this
    .find(filterOptions)
    .populate("customer")
    .populate("outlet")
    .populate("foodBundleOrderItems.bundleItems.foodItem")
    .populate("individualOrderItems.foodItem")
    .exec();
};

Order.statics.findAllOrdersByOutletId = function (outletId) {
  const filterOptions = {
    outlet: outletId,
  };
  return this
    .find(filterOptions)
    .populate("customer")
    .populate("outlet")
    .populate("foodBundleOrderItems.bundleItems.foodItem")
    .populate("individualOrderItems.foodItem")
    .exec();
};

Order.statics.findAllInProgressOrdersWithFoodItem = function (foodItemId) {
  const filterConditions = {
    $or: [
      { "individualOrderItems.foodItem": mongoose.Types.ObjectId(foodItemId) },
      {
        "foodBundleOrderItems.bundleItems.foodItem":
          mongoose.Types.ObjectId(foodItemId),
      },
    ],
    orderStatus: {
      $in: [Constants.PAID, Constants.UNPAID, Constants.RECEIVED],
    },
  };
  return this
    .find(filterConditions)
    .populate("customer")
    .populate("outlet")
    .populate("foodBundleOrderItems.bundleItems.foodItem")
    .populate("individualOrderItems.foodItem")
    .exec();
};

Order.statics.findAllInProgressOrdersByOutletId = function (outletId) {
  const filterConditions = {
    outlet: mongoose.Types.ObjectId(outletId),
    orderStatus: {
      $in: [Constants.PAID, Constants.UNPAID, Constants.RECEIVED],
    },
  };
  return this
    .find(filterConditions)
    .populate("customer")
    .populate("outlet")
    .populate("foodBundleOrderItems.bundleItems.foodItem")
    .populate("individualOrderItems.foodItem")
    .exec();
};

Order.statics.findOrdersById = function (orderIdArray) {
  const filterConditions = {
    _id: {
      $in: orderIdArray,
    },
  };

  return this
    .find(filterConditions)
    .populate("customer")
    .populate("outlet")
    .populate("foodBundleOrderItems.bundleItems.foodItem")
    .populate("individualOrderItems.foodItem")
    .exec();
};

Order.statics.markOrdersAsCancelled = function (orderIdArray) {
  const filterCondition = {
    _id: {
      $in: orderIdArray,
    },
  };
  const update = {
    $set: { orderStatus: Constants.REFUNDING },
  };

  return this.updateMany(filterCondition, update).exec();
};

Order.statics.updateOrderStatus = function (order, newStatus) {
  let update;

  if (newStatus === Constants.COMPLETED) {
    update = {
      $set: {
        orderStatus: newStatus,
        completedTime: Date.now()
      },
    };
  } else {
    update = {
      $set: { orderStatus: newStatus },
    };
  }

  const options = {
    new: true,
  };

  return this
    .findByIdAndUpdate(order._id, update, options)
    .populate("customer")
    .populate("outlet")
    .populate("foodBundleOrderItems.bundleItems.foodItem")
    .populate("individualOrderItems.foodItem")
    .exec();
};

Order.statics.updateOrderFoodItemStatusForMultipleOrders = function (
  orderIdArr,
  foodItemId,
  foodItemStatus
) {
  const filter = {
    _id: {
      $in: orderIdArr,
    },
  };

  const update = {
    $set: {
      "individualOrderItems.$[orderItemFilter].orderItemStatus": foodItemStatus,
    },
  };

  const options = {
    arrayFilters: [{ "orderItemFilter.foodItem": foodItemId }],
    new: true,
  };

  return this.updateMany(filter, update, options).exec();
};

Order.statics.updateOrderBundleItemStatusForMultipleOrders = function (
  orderIdArr,
  foodBundleId,
  foodItemId,
  foodBundleStatus
) {
  const filter = {
    _id: {
      $in: orderIdArr,
    },
  };

  const update = {
    $set: {
      "foodBundleOrderItems.$[bundleFilter].bundleItems.$[bundleItemFilter].orderItemStatus":
        foodBundleStatus,
    },
  };

  const options = {
    arrayFilters: [
      { "bundleFilter.bundle_id": mongoose.Types.ObjectId(foodBundleId) },
      {
        "bundleItemFilter.foodItem": {
          $eq: mongoose.Types.ObjectId(foodItemId),
        },
      },
    ],
    new: true,
  };

  return this.updateMany(filter, update, options).exec();
};

Order.statics.updateOrder = function (order) {
  let update;
  if (order.orderPickUpTime !== undefined) {
    update = {
      $set: {
        orderPickUpTime: order.orderPickUpTime,
        orderType: order.orderType
      },
    };
  } else {
    update = {
      $set: {
        orderPickUpTime: undefined,
        orderType: order.orderType
      },
    };
  }

  const options = {
    new: true,
  };

  return this.findByIdAndUpdate(order._id, update, options).exec();
};

/**
 * LEADER BOARD
 */
Order.statics.findAllHawkerCentresAndCuisineTypes = function () {

  return this.aggregate(
    [
      {
        $lookup: {
          from: 'Outlet',
          localField: 'outlet',
          foreignField: '_id',
          as: 'Outlet'
        }
      },
      {
        $lookup: {
          from: 'User',
          localField: 'Outlet.hawkerAccount',
          foreignField: '_id',
          as: 'Hawker'
        }
      },
      {
        $unwind: "$Outlet"
      },
      {
        $unwind: "$Hawker"
      },
      {
        $unwind: { path: "$Outlet.cuisineType", preserveNullAndEmptyArrays: true }
      },
      {
        $match: {
          $and: [
            { "Hawker.accountStatus": 'ACTIVE' },
            { "orderStatus": 'COMPLETED' }
          ]
        }
      },
      {
        $group:
        {
          _id: "$Outlet.hawkerCentreName", hawkerCentreName: { $first: "$Outlet.hawkerCentreName" },
          cuisineTypes: { "$addToSet": "$Outlet.cuisineType" },
        }
      }
    ]
  );
}

Order.statics.findNumOfSalesForAllHawkers = function () {

  return this.aggregate(
    [
      {
        $lookup: {
          from: 'Outlet',
          localField: 'outlet',
          foreignField: '_id',
          as: 'Outlet'
        }
      },
      {
        $lookup: {
          from: 'User',
          localField: 'Outlet.hawkerAccount',
          foreignField: '_id',
          as: 'Hawker'
        }
      },
      {
        $unwind: "$Outlet"
      },
      {
        $unwind: "$Hawker"
      },
      {
        $match: {
          $and: [
            { "Hawker.accountStatus": 'ACTIVE' },
            { "orderStatus": 'COMPLETED' }
          ]
        }
      },
      {
        $group:
          { _id: '$outlet', outletName: { $first: '$Outlet.outletName' }, outletPic: { $first: '$Hawker.profileImgSrc' }, hawkerCentreName: { $first: '$Outlet.hawkerCentreName' }, numOfSales: { $sum: 1 }, }
      },
      { $sort: { numOfSales: -1 } }
    ]
  );
}

Order.statics.findNumOfSalesForAllHawkersForPastDays = function (numOfDays) {
  let now = new Date();
  var numOfDaysBack = new Date();
  numOfDaysBack.setDate(now.getDate() - numOfDays);

  return this.aggregate(
    [
      {
        $lookup: {
          from: 'Outlet',
          localField: 'outlet',
          foreignField: '_id',
          as: 'Outlet'
        }
      },
      {
        $lookup: {
          from: 'User',
          localField: 'Outlet.hawkerAccount',
          foreignField: '_id',
          as: 'Hawker'
        }
      },
      {
        $unwind: "$Outlet"
      },
      {
        $unwind: "$Hawker"
      },
      {
        $match: {
          $and: [
            {
              $and: [
                { orderCreationTime: { $gte: numOfDaysBack } },
                { orderCreationTime: { $lte: now } }
              ]
            },
            { "Hawker.accountStatus": 'ACTIVE' },
            { "orderStatus": 'COMPLETED' }
          ]
        }
      },
      {
        $group:
          { _id: '$outlet', outletName: { $first: '$Outlet.outletName' }, outletPic: { $first: '$Hawker.profileImgSrc' }, hawkerCentreName: { $first: '$Outlet.hawkerCentreName' }, numOfSales: { $sum: 1 }, }
      },
      { $sort: { numOfSales: -1 } }
    ]
  );
}

Order.statics.findFoodItemsInIndividualOrderItems = function () {

  const validOrders = this.aggregate(
    [
      {
        $lookup: {
          from: 'Outlet',
          localField: 'outlet',
          foreignField: '_id',
          as: 'Outlet'
        }
      },
      {
        $lookup: {
          from: 'User',
          localField: 'Outlet.hawkerAccount',
          foreignField: '_id',
          as: 'Hawker'
        }
      },
      {
        $unwind: "$Outlet"
      },
      {
        $unwind: "$Hawker"
      },
      {
        $unwind: "$individualOrderItems"
      },
      {
        $lookup: {
          from: 'FoodItem',
          localField: 'individualOrderItems.foodItem',
          foreignField: '_id',
          as: 'FoodItem'
        }
      },
      {
        $unwind: "$FoodItem"
      },
      {
        $match: {
          $and: [
            { "Hawker.accountStatus": 'ACTIVE' },
            { "orderStatus": 'COMPLETED' },
            { "Outlet.isDeleted" : false }
          ]
        }
      },
      {
        $group:
          { _id: '$FoodItem._id', foodItemName: { $first: '$FoodItem.itemName' }, itemImageSrc: { $first: '$FoodItem.itemImageSrc' }, outletName: { $first: '$Outlet.outletName' }, outletType: { $first: '$Outlet.cuisineType' }, hawkerCentre: { $first: '$Outlet.hawkerCentreName' }, numOfSales: { $sum: '$individualOrderItems.itemQuantity' } }
      },
    ]
  );

  return validOrders;
}

Order.statics.findFoodItemsInFoodBundleOrderItems = function () {

  const validFoodBundleOrders = this.aggregate(
    [
      {
        $lookup: {
          from: 'Outlet',
          localField: 'outlet',
          foreignField: '_id',
          as: 'Outlet'
        }
      },
      {
        $lookup: {
          from: 'User',
          localField: 'Outlet.hawkerAccount',
          foreignField: '_id',
          as: 'Hawker'
        }
      },
      {
        $unwind: '$foodBundleOrderItems'
      },
      {
        $lookup: {
          from: 'FoodItem',
          let: { foodBundleItems: "$foodBundleOrderItems.bundleItems" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$foodBundleItems.foodItem"] } } },
          ],
          as: 'Bundle'
        }
      },
      {
        $unwind: "$Outlet"
      },
      {
        $unwind: "$Hawker"
      },
      {
        $unwind: "$Bundle"
      },
      {
        $match: {
          $and: [
            { "Hawker.accountStatus": 'ACTIVE' },
            { "orderStatus": 'COMPLETED' },
            { "Outlet.isDeleted" : false }
          ]
        }
      },
      {
        $group:
          { _id: '$Bundle._id', foodItemName: { $first: '$Bundle.itemName' }, itemImageSrc: { $first: '$Bundle.itemImageSrc' }, outletName: { $first: '$Outlet.outletName' }, outletType: { $first: '$Outlet.cuisineType' }, hawkerCentre: { $first: '$Outlet.hawkerCentreName' }, numOfSales: { $sum: '$foodBundleOrderItems.bundleQuantity' } }
      },
    ]
  );

  return validFoodBundleOrders;
}

Order.statics.findFoodItemsInIndividualOrderItemsForPastDays = function (numOfDays) {
  let now = new Date();
  var numOfDaysBack = new Date();
  numOfDaysBack.setDate(now.getDate() - numOfDays);

  const validOrders = this.aggregate(
    [
      {
        $lookup: {
          from: 'Outlet',
          localField: 'outlet',
          foreignField: '_id',
          as: 'Outlet'
        }
      },
      {
        $lookup: {
          from: 'User',
          localField: 'Outlet.hawkerAccount',
          foreignField: '_id',
          as: 'Hawker'
        }
      },
      {
        $unwind: "$Outlet"
      },
      {
        $unwind: "$Hawker"
      },
      {
        $unwind: "$individualOrderItems"
      },
      {
        $lookup: {
          from: 'FoodItem',
          localField: 'individualOrderItems.foodItem',
          foreignField: '_id',
          as: 'FoodItem'
        }
      },
      {
        $unwind: "$FoodItem"
      },
      {
        $match: {
          $and: [
            {
              $and: [
                { orderCreationTime: { $gte: numOfDaysBack } },
                { orderCreationTime: { $lte: now } }
              ]
            },
            { "Hawker.accountStatus": 'ACTIVE' },
            { "orderStatus": 'COMPLETED' },
            { "Outlet.isDeleted" : false }
          ]
        }
      },
      {
        $group:
          { _id: '$FoodItem._id', foodItemName: { $first: '$FoodItem.itemName' }, itemImageSrc: { $first: '$FoodItem.itemImageSrc' }, outletName: { $first: '$Outlet.outletName' }, outletType: { $first: '$Outlet.cuisineType' }, hawkerCentre: { $first: '$Outlet.hawkerCentreName' }, numOfSales: { $sum: '$individualOrderItems.itemQuantity' } }
      },
    ]
  );

  return validOrders;
}

Order.statics.findFoodItemsInFoodBundleOrderItemsForPastDays = function (numOfDays) {
  let now = new Date();
  var numOfDaysBack = new Date();
  numOfDaysBack.setDate(now.getDate() - numOfDays);

  const validFoodBundleOrders = this.aggregate(
    [
      {
        $lookup: {
          from: 'Outlet',
          localField: 'outlet',
          foreignField: '_id',
          as: 'Outlet'
        }
      },
      {
        $lookup: {
          from: 'User',
          localField: 'Outlet.hawkerAccount',
          foreignField: '_id',
          as: 'Hawker'
        }
      },
      {
        $unwind: '$foodBundleOrderItems'
      },
      {
        $lookup: {
          from: 'FoodItem',
          let: { foodBundleItems: "$foodBundleOrderItems.bundleItems" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$foodBundleItems.foodItem"] } } },
          ],
          as: 'Bundle'
        }
      },
      {
        $unwind: "$Outlet"
      },
      {
        $unwind: "$Hawker"
      },
      {
        $unwind: "$Bundle"
      },
      {
        $match: {
          $and: [
            {
              $and: [
                { orderCreationTime: { $gte: numOfDaysBack } },
                { orderCreationTime: { $lte: now } }
              ]
            },
            { "Hawker.accountStatus": 'ACTIVE' },
            { "orderStatus": 'COMPLETED' },
            { "Outlet.isDeleted" : false }
          ]
        }
      },
      {
        $group:
          { _id: '$Bundle._id', foodItemName: { $first: '$Bundle.itemName' }, itemImageSrc: { $first: '$Bundle.itemImageSrc' }, outletName: { $first: '$Outlet.outletName' }, outletType: { $first: '$Outlet.cuisineType' }, hawkerCentre: { $first: '$Outlet.hawkerCentreName' }, numOfSales: { $sum: '$foodBundleOrderItems.bundleQuantity' } }
      },
    ]
  );

  return validFoodBundleOrders;
}

Order.statics.findAllOrdersByOutletIdAndStatusAndTime = function (outletId, orderStatus, startDate, endDate) {

  const filter = {
    orderStatus: orderStatus,
    outlet: mongoose.Types.ObjectId(outletId),
    completedTime: {
      $gte: startDate,
      $lt: endDate,
    }
  }

  return this.find(filter)
    .populate("outlet")
    .populate("foodBundleOrderItems.bundleItems.foodItem")
    .populate("individualOrderItems.foodItem")
}

/**
 * DELIVERY
 */
Order.statics.findAllDeliveryOrders = function () {
  const orderBufferTimeLimit = settings.ORDER_BUFFER_TIME_IN_MINUTES;
  const orderBufferTime = moment().subtract(orderBufferTimeLimit, "minutes");

  const filter = {
    orderCreationTime: {
      $lt: orderBufferTime.toDate()
    },
    orderStatus: {
      $nin: [Constants.CANCELLED, Constants.COMPLETED]
    },
    orderPickUpTime: {
      $gt: moment().toDate()
    },
  }

  return this
    .find(filter)
    .populate("customer")
    .populate("outlet")
    .populate("foodBundleOrderItems.bundleItems.foodItem")
    .populate("individualOrderItems.foodItem")
    .then(deliveryOrders => {
      return groupOrdersByHawkerCenterName(deliveryOrders);
    })
}

Order.statics.findAllDeliveryOrdersByHawkerCenter = function (hawkerCenterName) {
  const orderBufferTimeLimit = settings.ORDER_BUFFER_TIME_IN_MINUTES;
  const orderBufferTime = moment().subtract(orderBufferTimeLimit, "minutes");

  const filter = {
    orderCreationTime: {
      $lt: orderBufferTime.toDate()
    },
    orderStatus: {
      $nin: [Constants.CANCELLED, Constants.COMPLETED]
    },
    orderPickUpTime: {
      $gt: moment().toDate()
    },
  }

  return this
    .find(filter)
    .populate("customer")
    .populate("outlet")
    .populate("foodBundleOrderItems.bundleItems.foodItem")
    .populate("individualOrderItems.foodItem")
    .then(deliveryOrders => {
      const hawkerCenter = groupOrdersByHawkerCenterName(deliveryOrders)
        .filter(hawkerCenter =>
          hawkerCenter.hawkerCenterName.toLowerCase().replace(' ', '') === hawkerCenterName.toLowerCase().replace(' ', '')
        )[0];

      return hawkerCenter.orders;
    });
}

function groupOrdersByHawkerCenterName(deliveryOrders) {
  const hawkerCenterSummary = new Map();
  const hawkerCenterCuisine = new Map();

  _.forEach(deliveryOrders, (order) => {
    if (!hawkerCenterSummary.get(order.outlet.hawkerCentreName)) {
      hawkerCenterSummary.set(order.outlet.hawkerCentreName, []);
      hawkerCenterCuisine.set(order.outlet.hawkerCentreName, new Set());
    }
    hawkerCenterSummary.get(order.outlet.hawkerCentreName).push(order);
    order.outlet.cuisineType.forEach(cuisine => hawkerCenterCuisine.get(order.outlet.hawkerCentreName).add(cuisine));
  });

  let allHawkerCenters = [];

  for (const [key, value] of hawkerCenterSummary) {
    allHawkerCenters.push(
      new DeliveryHawkerCenter(
        key,
        value,
        hawkerCenterCuisine.get(key)
      )
    );
  }
  return allHawkerCenters;
}

Order.statics.findAllCompletedDeliveryOrdersByDelivererId = function (delivererId) {
  const filter = {
    customer: mongoose.Types.ObjectId(delivererId),
    orderStatus: {
      $in: [Constants.CANCELLED, Constants.COMPLETED]
    }
  };

  return this
    .find(filter)
    .populate("customer")
    .populate("deliverer")
    .populate("outlet")
    .populate("foodBundleOrderItems.bundleItems.foodItem")
    .populate("individualOrderItems.foodItem")
}

/**
  System
*/

/**
 *
 * @returns "acknowledged" : true, "deletedCount" : 10
 */
 Order.statics.removeUnpaidCashOrdersForTimeout = function () {
  const limit = settings.UNPAID_ORDER_MAX_DURATION_IN_MINUTES;
  const limitDateTime = moment().subtract(limit, "minutes");

  const filter = {
    paymentType: Constants.CASH,
    orderStatus: Constants.UNPAID,
    orderCreationTime: { $lt: limitDateTime.toDate() },
  };

  return this.find(filter)
    .populate("customer")
    .populate("outlet")
    .populate("foodBundleOrderItems.bundleItems.foodItem")
    .populate("individualOrderItems.foodItem")
    .then((ordersToDelete) => {
      if (ordersToDelete) {
        for (let order of ordersToDelete) {
          emitMessage(Constants.DELETE_UNPAID_CASH_ORDER, order);
        }
      }
    })
    .then(() => this.deleteMany(filter));
};

Order.statics.fetchNewUnpaidOrdersForTimeOut = function () {
  const orderBufferTimeLimit = settings.ORDER_BUFFER_TIME_IN_MINUTES;
  const orderBufferTime = moment().subtract(orderBufferTimeLimit, "minutes");

  const filter = {
    orderStatus: Constants.UNPAID,
    paymentType: Constants.CASH,
    orderCreationTime: { $lt: orderBufferTime.toDate() },
  };

  return this.find(filter)
    .populate("customer")
    .populate("outlet")
    .populate("foodBundleOrderItems.bundleItems.foodItem")
    .populate("individualOrderItems.foodItem")
    .then((orderArr) => {
      for (let order of orderArr) {
        emitMessage(Constants.NEW_UNPAID_CASH_ORDER, order);
      }
    });
};

Order.statics.updateAdvanceTakeawayOrderForTimeOut = function () {
  const limit = settings.ADVANCE_ORDER_READY_LIMIT_IN_MINUTES;
  const limitDateTime = moment().subtract(limit, "minutes");

  const orderBufferTimeLimit = settings.ORDER_BUFFER_TIME_IN_MINUTES;
  const orderBufferTime = moment().subtract(orderBufferTimeLimit, "minutes");

  const filter = {
    orderStatus: Constants.PAID,
    orderType: Constants.TAKE_AWAY,
    orderPickUpTime: { $gt: limitDateTime.toDate() },
    orderCreationTime: { $lt: orderBufferTime.toDate() },
  };

  return this.find(filter)
    .populate("customer")
    .populate("outlet")
    .populate("foodBundleOrderItems.bundleItems.foodItem")
    .populate("individualOrderItems.foodItem")
    .then((orderArr) => {
      if (orderArr && orderArr.length > 0) {
        const ordersToUpdate = _.map(orderArr, (order) => order._id);
        const filterUpdate = {
          _id: { $in: ordersToUpdate },
        };
        const update = {
          $set: {
            orderStatus: Constants.RECEIVED,
          },
        };
        this.updateMany(filterUpdate, update).exec();
      }
      return orderArr;
    })
    .then((orders) => {
      for (let order of orders) {
        order.orderStatus = Constants.RECEIVED;
        // send order as new order to hawker
        emitMessage(Constants.NEW_ORDER, order);

        // notify customer order status update
        emitMessage(Constants.UPDATE_ORDER_STATUS, order);
      }
    });
};

Order.statics.fetchNewPaidOrdersForTimeOut = function () {
  // filter paid orders that are not advance orders
  const orderBufferTimeLimit = settings.ORDER_BUFFER_TIME_IN_MINUTES;
  const orderBufferTime = moment().subtract(orderBufferTimeLimit, "minutes");

  const filter = {
    orderStatus: Constants.PAID,
    orderPickUpTime: undefined,
    orderCreationTime: { $lt: orderBufferTime.toDate() },
  };

  return this.find(filter)
    .populate("customer")
    .populate("outlet")
    .populate("foodBundleOrderItems.bundleItems.foodItem")
    .populate("individualOrderItems.foodItem")
    .then((orderArr) => {
      if (orderArr && orderArr.length > 0) {
        const ordersToUpdate = _.map(orderArr, (order) => order._id);
        const filterUpdate = {
          _id: { $in: ordersToUpdate },
        };
        const update = {
          $set: {
            orderStatus: Constants.RECEIVED,
          },
        };
        this.updateMany(filterUpdate, update).exec();
      }
      return orderArr;
    })
    .then((orders) => {
      for (let order of orders) {
        order.orderStatus = Constants.RECEIVED;
        // send order as new order to hawker
        emitMessage(Constants.NEW_ORDER, order);

        // notify customer order status update
        emitMessage(Constants.UPDATE_ORDER_STATUS, order);
      }
    });
};

//HAWKER ANALYTICS

Order.statics.findAllEarningsByOutletIdAndTime = function (outletId, startDate, endDate) {

  return this.aggregate(
    [
      {
        $match: {
          $and: [
            {
              $and: [
                { orderCreationTime: { $gte: startDate } },
                { orderCreationTime: { $lte: endDate } }
              ]
            },
            { "orderStatus": 'COMPLETED' },
            { "outlet": mongoose.Types.ObjectId(outletId)},
          ]
        }
      },
      {
        $group:
          { _id: '$orderCreationTime', earnings: { $sum: '$totalPrice'}}
      },
    ]
  );
}

export default mongoose.model("Order", Order, "Order");
