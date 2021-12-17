import mongoose, { Schema } from "mongoose";
import { Constants } from "common";
import * as _ from "lodash";
const Outlet = require("./Outlet");

const QueueSetting = new Schema({
  defaultQueuePreference: {
    type: String,
    default: Constants.ORDER_TIME,
    enum: [
      Constants.ORDER_TIME,
      Constants.SIMILAR_ITEM,
    ]
  },
  queueByOrderTimeSetting: [
    {
      queueCondition: {
        type: String,
        enum: [
          Constants.BY_DELIVERY,
          Constants.BY_NOT_DELIVERY,
          Constants.BY_DINE_IN,
          Constants.BY_NOT_DINE_IN,
        ],
      }
    }
  ],
  queueBySimilarOrderSetting: {
    orderItemGroupQuantity: [
      {
        foodItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "FoodItem",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1
        }
      }
    ],
    queueSegregationCondition: [
      {
        queueCondition: {
          type: String,
          enum: [
            Constants.BY_DELIVERY,
            Constants.BY_NOT_DELIVERY,
            Constants.BY_DINE_IN,
            Constants.BY_NOT_DINE_IN,
            Constants.BY_TAKEAWAY,
          ],
        }
      }
    ]
  },
  outlet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Outlet",
    required: true,
  },
});

QueueSetting.statics.createQueueSettingForOutlet = function (outlet) {
  const queueSetting = {
    outlet: outlet,
  }

  return Promise.resolve()
    .then(() => this.create(queueSetting))
    .then((createdQueueSetting) => {
      const update = {
        $set: { queueSetting: createdQueueSetting._id },
      };

      const options = {
        new: true,
      };

      return Outlet.findByIdAndUpdate(outlet._id, update, options).exec();
    });
}

QueueSetting.statics.findQueueSettingByOutletId = function (outletId) {
  const filterOptions = {
    outlet: mongoose.Types.ObjectId(outletId),
  };
  return this
    .find(filterOptions)
    .populate("outlet")
    .populate("queueBySimilarOrderSetting.orderItemGroupQuantity.foodItem")
    .exec();
}

QueueSetting.statics.updateQueueSetting = function (queueSetting) {
  const update = {
    $set: { ...queueSetting }
  };
  const options = {
    new: true
  };
  return this
    .findByIdAndUpdate(queueSetting._id, update, options)
    .populate("outlet")
    .populate("queueBySimilarOrderSetting.orderItemGroupQuantity.foodItem")
    .exec();
}

export default mongoose.model("QueueSetting", QueueSetting, "QueueSetting");
