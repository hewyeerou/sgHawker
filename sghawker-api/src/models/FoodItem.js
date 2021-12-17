import mongoose, { Schema } from "mongoose";
import _ from "lodash";
import { Constants } from "common";
const Outlet = require('./Outlet');

const FoodItem = new Schema({
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  itemDescription: {
    type: String,
    trim: true
  },
  itemPrice: {
    type: Number,
    required: true
  },
  itemImageSrc: {
    type: String
  },
  itemAvailability: {
    type: Boolean,
    required: true,
    default: true
  },
  itemCategory: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  itemCustomizations: [
    {
      customizationName: {
        type: String,
        required: true,
        trim: true
      },
      mandatory: {
        type: Boolean,
        required: true,
        default: true
      },
      customizationOptions: [
        {
          optionName: {
            type: String,
            required: true
          },
          optionCharge: {
            type: Number,
            required: true
          }
        }
      ]
    }
  ],
  outlet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Outlet',
    required: true
  },
  menus: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu'
    }
  ],
});

FoodItem.statics.validate = function (foodItem, fields) {
  if (fields.itemName) {
    if (!foodItem.itemName) {
      return Constants.ERROR_FOOD_NAME_REQUIRED;
    }
  }
  if (fields.itemDescription) {
    if (!foodItem.itemDescription) {
      return Constants.ERROR_ITEM_DESCRIPTION_REQUIRED;
    }
  }
  if (fields.outlet) {
    if (!foodItem.outlet) {
      return Constants.ERROR_FOOD_OUTLET_REQUIRED;
    }

    if (!mongoose.Types.ObjectId.isValid(foodItem.outlet)) {
      return Constants.ERROR_OUTLET_INVALID_ID_PROVIDED;
    }
  }
  if (fields.itemPrice) {
    if (!foodItem.itemPrice) {
      return Constants.ERROR_ITEM_PRICE_REQUIRED;
    }
    if (parseFloat(foodItem.itemPrice) < Constants.ITEM_MIN_PRICE) {
      return Constants.ERROR_NEGATIVE_ITEM_PRICE;
    }
    if (parseFloat(foodItem.itemPrice) > Constants.ITEM_MAX_PRICE) {
      return Constants.ERROR_ITEM_PRICE_EXCEED_LIMIT;
    }
  }
  if (fields.itemImageSrc) {
    if (!foodItem.itemImageSrc) {
      return Constants.ERROR_ITEM_IMAGE_SOURCE_REQUIRED;
    }
  }
  if (fields.itemAvailability) {
    if (foodItem.itemAvailability === undefined) {
      return Constants.ERROR_ITEM_AVAILABILITY_REQUIRED;
    }
  }
  if (fields.itemCategory) {
    if (!foodItem.itemCategory || foodItem.itemCategory.length === 0) {
      return Constants.ERROR_ITEM_CATEGORIES_REQUIRED;
    }
  }
  if (fields.menus) {
    if (!foodItem.menus || (foodItem.menus && foodItem.menus.length === 0)) {
      return Constants.ERROR_ITEM_MENU_MISSING;
    }
  }
  if (fields.itemCustomizations) {
    if (!foodItem.itemCustomizations || (foodItem.itemCustomizations && foodItem.itemCustomizations.length === 0)) {
      return Constants.ERROR_ITEM_CUSTOMIZATIONS_REQUIRED;
    }
    _.forEach(fields.itemCustomizations, customization => {
      if (!customization.customizationName) {
        return Constants.ERROR_ITEM_CUSTOMIZATION_NAME_REQUIRED;
      }
      if (!customization.mandatory) {
        return Constants.ERROR_ITEM_CUSTOMIZATION_NAME_REQUIRED;
      }
      if (!customization.customizationOptions || (customization.customizationOptions
        && customization.customizationOptions.length === 0)) {
        return Constants.ERROR_ITEM_CUSTOMIZATION_NAME_REQUIRED;
      }
      _.forEach(customization.customizationOptions, option => {
        if (!option.optionName) {
          return Constants.ERROR_ITEM_CUSTOMIZATION_OPTION_NAME_REQUIRED;
        }
        if (!option.optionCharge) {
          return Constants.ERROR_ITEM_CUSTOMIZATION_OPTION_PRICE_REQUIRED;
        }
        if (parseFloat(option.optionCharge) < Constants.ITEM_MIN_PRICE) {
          return Constants.ERROR_NEGATIVE_CUSTOMIZATION_OPTION_PRICE;
        }
        if (parseFloat(option.optionCharge) > Constants.ITEM_MAX_PRICE) {
          return Constants.ERROR_ITEM_CUSTOMIZATION_OPTION_PRICE_EXCEED_LIMIT;
        }
      });
    });
  }
  return null;
};

FoodItem.statics.findAllFoodItemsByOutletId = function (outletId) {
  return this.find({ outlet: outletId }).exec();
}

FoodItem.statics.createFoodItem = function (foodItem, selectedOutlet) {
  const foodItemData = {
    ...foodItem,
    outlet: selectedOutlet
  };

  return Promise.resolve()
    .then(() => this.create(foodItemData))
    .then(newFoodItem => {
      const update = {
        $push: { foodItems: newFoodItem }
      };

      const options = {
        useFindAndModify: false,
        new: true
      };
      Outlet.findByIdAndUpdate(selectedOutlet, update, options).exec();
      return newFoodItem;
    });
};

FoodItem.statics.updateFoodItemDetails = function (foodItemId, updateDetails) {
  const update = {
    $set: { ...updateDetails }
  };
  const options = {
    new: true
  };
  return this.findByIdAndUpdate(foodItemId, update, options).exec();
};

FoodItem.statics.findAllFoodItemsByOutlet = function (outletId) {
  return this.find({ outlet: mongoose.Types.ObjectId(outletId) }).exec();
};

FoodItem.statics.deleteFoodItem = function (foodItemId) {
  return Promise.resolve()
    .then(() => this.findByIdAndDelete(foodItemId))
    .then(deletedFoodItem => {
      const updateOutlet = {
        $pull: { foodItems: foodItemId }
      };
      const updateMenu = {
        $pull: {
          foodItems: foodItemId,
          menuCategories: { foodItems: foodItemId },
          foodBundles: { foodItems: foodItemId }
        }
      };

      const Outlet = require('./Outlet');
      const Menu = require('./Menu');

      Menu.findOneAndUpdate({
        foodItems: foodItemId,
        menuCategories: { foodItems: foodItemId },
        foodBundles: { foodItems: foodItemId }
      }, updateMenu).exec();
      
      Outlet.findOneAndUpdate({ foodItems: foodItemId }, updateOutlet).exec();

      return deletedFoodItem;
    });
};


FoodItem.statics.findAndUpdateCategoryNameForOutlet = function (outletId, oldItemCategory, newItemCategory) {
  return this.updateMany(
    {
      outlet: outletId,
      itemCategory: oldItemCategory
    },
    {
      itemCategory: newItemCategory
    }
  ).exec();
};

FoodItem.statics.findAndUpdateCategoryForFoodItems = function (foodItemsIds, toItemCategory) {
  return this.updateMany(
    {
      _id: {
        $in: foodItemsIds
      }
    },
    {
      itemCategory: toItemCategory
    }
  ).exec();
}

FoodItem.statics.findAllDistinctCategories = function (outletId) {
  return this.find({ outlet: outletId }).distinct('itemCategory');
};

FoodItem.statics.findFoodItemById = function (foodItemId) {
  return this.findById(foodItemId, null).exec();
}

export default mongoose.model("FoodItem", FoodItem, "FoodItem");
