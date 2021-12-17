import mongoose, { Schema } from "mongoose";
import _ from "lodash";

const Menu = new Schema({
  menuName: {
    type: String,
    required: true,
    trim: true,
  },
  activeMenu: {
    type: Boolean,
    required: true,
    default: false,
  },
  foodItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodItem",
      required: true,
    },
  ],
  menuCategories: [
    {
      categoryName: {
        type: String,
        required: true,
        trim: true,
      },
      foodItems: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "FoodItem",
        },
      ],
    },
  ],
  foodBundles: [
    {
      bundleImgSrc: {
        type: String,
      },
      bundleName: {
        type: String,
        required: true,
        trim: true,
      },
      bundlePrice: {
        type: Number,
        required: true,
      },
      isPromotion: {
        type: Boolean,
        required: true,
        default: false,
      },
      foodItems: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "FoodItem",
          required: true,
        },
      ],
    },
  ],
  outlet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Outlet",
    required: true,
  },
});

Menu.statics.validate = function (menu, fields) {
  if (fields.menuName) {
    if (!menu.menuName) {
      return Constants.ERROR_MENU_NAME_REQUIRED;
    }
  }
  if (fields.outlet) {
    if (!menu.outlet) {
      return Constants.ERROR_OUTLET_REQUIRED;
    }
  }
  if (fields.foodItems) {
    if (!menu.foodItems || (menu.foodItems && menu.foodItems.length === 0)) {
      return Constants.ERROR_MENU_FOOD_ITEM_REQUIRED;
    }
  }
  if (fields.itemCategories) {
    if (
      !menu.menuCategories ||
      (menu.menuCategories && menu.menuCategories.length === 0)
    ) {
      return Constants.ERROR_MENU_CATEGORIES_REQUIRED;
    }
    _.forEach(menu.menuCategories, (category) => {
      if (!category.categoryName) {
        return Constants.ERROR_MENU_CATEGORY_NAME_REQUIRED;
      }
      if (
        !category.foodItems ||
        (category.foodItems && category.foodItems.length === 0)
      ) {
        return Constants.ERROR_MENU_CATEGORY_FOOD_ITEMS_REQUIRED;
      }
    });
  }
  if (fields.foodBundles) {
    if (
      !menu.foodBundles ||
      (menu.foodBundles && menu.foodBundles.length === 0)
    ) {
      return Constants.ERROR_MENU_BUNDLE_REQUIRED;
    }
    _.forEach(menu.foodBundles, (foodBundle) => {
      if (!foodBundle.bundleName) {
        return Constants.ERROR_MENU_BUNDLE_NAME_REQUIRED;
      }
      if (!foodBundle.bundlePrice) {
        return Constants.ERROR_MENU_BUNDLE_PRICE_REQUIRED;
      }
      if (parseFloat(foodBundle.bundlePrice) < Constants.ITEM_MIN_PRICE) {
        return Constants.ERROR_NEGATIVE_BUNDLE_PRICE;
      }
      if (parseFloat(foodBundle.bundlePrice) > Constants.ITEM_MAX_PRICE) {
        return Constants.ERROR_BUNDLE_PRICE_EXCEED_LIMIT;
      }
      if (
        !foodBundle.foodItems ||
        (foodBundle.foodItems && foodBundle.foodItems.length === 0)
      ) {
        return Constants.ERROR_MENU_BUNDLE_FOOD_ITEMS_REQUIRED;
      }
    });
  }
  return null;
};

/**
 *
 * @param {*} menu
 * @param {*} foodItemsIdArr
 * @returns created menu
 */
Menu.statics.createNewMenu = function (menu) {
  return Promise.resolve()
    .then(() => this.create(menu))
    .then((newMenu) => {
      const foodItemsIdArr = [];
      if (newMenu.foodItems !== undefined || newMenu.foodItems.length !== 0) {
        for (const item of newMenu.foodItems) {
          foodItemsIdArr.push(item._id);
        }
      }
      const FoodItem = require("./FoodItem");
      const Outlet = require("./Outlet");

      const updateOptions = {
        $push: { menus: newMenu._id },
      };

      const options = {
        multi: true,
      };

      FoodItem.updateMany(
        {
          _id: {
            $in: foodItemsIdArr,
          },
        },
        updateOptions,
        options
      ).exec();

      Outlet.findByIdAndUpdate(menu.outlet._id, updateOptions).exec();
      return newMenu;
    });
};

/**
 *
 * @param {*} outletId
 * @returns menus
 */
Menu.statics.findMenusByOutletId = function (outletId) {
  const filterOptions = {
    outlet: mongoose.Types.ObjectId(outletId),
  };
  return this.find(filterOptions).populate("foodItems").exec();
};

Menu.statics.findActiveMenuByOutletId = function (outletId) {
  const filterOptions = {
    activeMenu: true,
    outlet: mongoose.Types.ObjectId(outletId),
  };
  return this.find(filterOptions)
    .populate("foodItems")
    .populate("outlet")
    .populate("menuCategories.foodItems")
    .populate("foodBundles.foodItems")
    .exec();
};

/**
 *
 * @param {*} menuId
 * @returns deleted menu
 *
 */
Menu.statics.deleteMenu = function (menuId) {
  return Promise.resolve()
    .then(() => this.findByIdAndDelete(menuId))
    .then((deletedMenu) => {
      const update = {
        $pull: { menus: menuId },
      };

      const FoodItem = require("./FoodItem");
      const Outlet = require("./Outlet");

      FoodItem.updateMany({ menus: menuId }, update).exec();
      Outlet.findOneAndUpdate({ menus: menuId }, update).exec();

      return deletedMenu;
    });
};

/**
 *
 * @param {*} menuId
 * @returns menu
 *
 */
Menu.statics.findMenuById = function (menuId) {
  return this.findById(menuId)
    .populate("foodItems")
    .populate("outlet")
    .populate("menuCategories.foodItems")
    .populate("foodBundles.foodItems")
    .exec();
};

Menu.statics.findAllMenus = function () {
  return this.find();
};

/**
 * Order related
 */

Menu.statics.findAllActiveMenus = function () {
  const filterConditions = {
    activeMenu: true,
  };
  return this.find(filterConditions)
    .populate("outlet")
    .populate("foodBundles.foodItems")
    .exec();
};

Menu.statics.updateMenu = function (menuId, newMenu) {
  const update = {
    $set: {
      menuName: newMenu.menuName,
      activeMenu: newMenu.activeMenu,
      foodItems: newMenu.foodItems,
      menuCategories: newMenu.menuCategories,
      foodBundles: newMenu.foodBundles,
    },
  };
  return this.findByIdAndUpdate(menuId, update).exec();
};

export default mongoose.model("Menu", Menu, "Menu");
