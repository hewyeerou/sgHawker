import Promise from "bluebird";
import _ from "lodash";
import { ClientError, Constants } from "common";
import { ResponseHelper, Logger } from "helpers";
import { FoodItem, Order } from "models";
import multer from "multer";
import fs from "fs";

const DEBUG_ENV = "FoodItemController";
const { emitMessage } = require("../config/websocket");

const FoodItemController = {
  request: {},
};

/**
 * File upload
 */

function removeExistingFoodItemPicture(folderDir, foodItemId) {
  var uploadDir = fs.readdirSync(folderDir);
  for (let i = 0; i < uploadDir.length; i++) {
    if (uploadDir[i].includes("img-" + foodItemId)) {
      fs.unlinkSync(`${folderDir}/${uploadDir[i]}`);
    }
  }
}

/**
 * Delete Image from Deleted Food Item
 */
function removeDeletedFoodItemPicture(folderDir) {
  fs.unlinkSync(`${folderDir}`);
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    let fileLocation = `public/static/upload/foodItemImg`;
    try {
      if (!fs.existsSync(fileLocation)) {
        fs.mkdirSync(fileLocation);
      }
    } catch (err) {
      Logger.error("Error: Unable to create user folder");
    }
    cb(null, fileLocation);
  },
  filename(req, file, cb) {
    const { foodItemId } = req.params;
    let folder = `public/static/upload/foodItemImg`;

    let filePrepend = "img";
    removeExistingFoodItemPicture(folder, foodItemId);
    cb(null, `${filePrepend}-${foodItemId}`);
  },
});

const upload = multer({
  storage,
}).single("file");

FoodItemController.request.uploadFoodItemImage = function (req, res) {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json({ message: err });
    }
    const { foodItemId } = req.params;
    return FoodItem.findById(foodItemId)
      .then((foodItem) =>
        FoodItem.updateFoodItemDetails(foodItem._id, {
          itemImageSrc: req.file.path,
        })
      )
      .then(
        (foodItem) => ResponseHelper.success(res, foodItem),
        (error) => ResponseHelper.error(res, error, DEBUG_ENV)
      );
  });
};

/**
 * Food
 */

FoodItemController.request.createNewFoodItem = function (req, res) {
  const reqError = FoodItem.validate(req.body, {
    itemName: true,
    itemPrice: true,
    itemAvailability: true,
    itemCategory: true,
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }

  FoodItem.createFoodItem(req.body, req.body.outlet._id).then(
    (createdFoodItem) => {
      ResponseHelper.success(res, createdFoodItem);
    },
    (error) => {
      ResponseHelper.error(res, new ClientError(error), DEBUG_ENV);
    }
  );
};

FoodItemController.request.findAllFoodItemByOutletId = function (req, res) {
  const { outletId } = req.params;

  return FoodItem.findAllFoodItemsByOutlet(outletId).then(
    (foodItems) => ResponseHelper.success(res, foodItems),
    (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
};

FoodItemController.request.findFoodItemById = function (req, res) {
  const { foodItemId } = req.params;
  return FoodItem.findFoodItemById(foodItemId)
    .then((item) => Promise.resolve(item))
    .then((item) => {
      if (item) {
        return ResponseHelper.success(res, item);
      } else {
        return ResponseHelper.error(
          res,
          new ClientError(Constants.ERROR_FOOD_ITEM_NOT_FOUND),
          DEBUG_ENV
        );
      }
    });
};

FoodItemController.request.disableFoodItemById = function (req, res) {
  const { foodItemId } = req.params;

  return FoodItem.updateFoodItemDetails(
    foodItemId,
    {
      itemAvailability: false
    })
    .then(
      updatedFoodItem => {
        Order
          .findAllInProgressOrdersWithFoodItem(foodItemId)
          .then(inProgressOrders => {
            const orderIdToCancel = [];
            // const orderIdToRefund = [];

            for (let order of inProgressOrders) {
              order.orderStatus = Constants.CANCELLED;
              orderIdToCancel.push(order._id);
              
              //notify customer
              emitMessage(Constants.UNABLE_TO_FULFILL_ORDER, order);
            }

            return Order.markOrdersAsCancelled(orderIdToCancel);
            // return Promise
            //   .resolve()
            //   .then(() => Order.markOrdersAsRefunding(orderIdToRefund))
            //   .then(() => Order.markOrdersAsCancelled(orderIdToCancel))
          });
        return ResponseHelper.success(res, updatedFoodItem);
      },
      error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
    )
};

FoodItemController.request.enableFoodItemById = function (req, res) {
  const { foodItemId } = req.params;

  return FoodItem.updateFoodItemDetails(
    foodItemId,
    { itemAvailability: true }
  ).then(
    updatedFoodItem => ResponseHelper.success(res, updatedFoodItem),
    error => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  )
};

FoodItemController.request.updateFoodItemDetails = function (req, res) {
  const foodItemToUpdate = req.body;

  const reqError = FoodItem.validate(req.body, {
    itemName: true,
    itemPrice: true,
    itemCategory: true,
    outlet: true,
  });

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }

  return FoodItem.updateFoodItemDetails(
    foodItemToUpdate._id,
    foodItemToUpdate
  ).then(
    (foodItem) => ResponseHelper.success(res, foodItem),
    (error) => {
      return ResponseHelper.error(res, new ClientError(error), DEBUG_ENV);
    }
  );
};

FoodItemController.request.deleteFoodItem = function (req, res) {
  const { foodItemId } = req.params;

  return FoodItem.deleteFoodItem(foodItemId).then((deletedFoodItem) => {
    if (deletedFoodItem) {
      if (
        deletedFoodItem.itemImageSrc !== "public/static/default-fooditem.jpeg"
      ) {
        removeDeletedFoodItemPicture(deletedFoodItem.itemImageSrc);
      }
      return ResponseHelper.success(res);
    } else {
      return ResponseHelper.error(
        res,
        new ClientError(Constants.ERROR_FOOD_ITEM_ID_NOT_FOUND),
        DEBUG_ENV
      );
    }
  });
};

/*
 * Category
 */

FoodItemController.request.retrieveAllUniqueFoodCategories = function (
  req,
  res
) {
  const { outletId } = req.params;

  return FoodItem.findAllDistinctCategories(outletId).then(
    (categories) => {
      ResponseHelper.success(res, categories);
    },
    (error) => {
      ResponseHelper.error(res, new ClientError(error), DEBUG_ENV);
    }
  );
};

FoodItemController.request.updateCategoryName = function (req, res) {
  const { outletId } = req.params;
  const oldItemCategory = req.body.oldItemCategory.toUpperCase();
  const { newItemCategory } = req.body;

  const reqError = FoodItem.validate(
    {
      itemCategory: newItemCategory,
      outlet: outletId
    },
    {
      itemCategory: true,
      outlet: true,
    }
  );

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }
  return FoodItem.findAndUpdateCategoryNameForOutlet(
    outletId,
    oldItemCategory,
    newItemCategory
  ).then(
    (result) => ResponseHelper.success(res, { modified: result.nModified }),
    (error) => ResponseHelper.error(res, error, DEBUG_ENV)
  );
};

FoodItemController.request.updateCategory = function (req, res) {
  const { foodItemsIds, toItemCategory } = req.body;
  const reqError = FoodItem.validate(
    { itemCategory: toItemCategory },
    {
      itemCategory: true,
    }
  );

  if (reqError) {
    return ResponseHelper.error(res, new ClientError(reqError), DEBUG_ENV);
  }
  return FoodItem.findAndUpdateCategoryForFoodItems(
    foodItemsIds,
    toItemCategory
  ).then(
    (result) => ResponseHelper.success(res, result),
    (error) => ResponseHelper.error(res, new ClientError(error), DEBUG_ENV)
  );
};


export default FoodItemController;