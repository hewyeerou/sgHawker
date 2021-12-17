import express from "express";
import {
  UserController,
  OutletController,
  FoodItemController,
  MenuController,
  OrderController,
  WalletController,
  ReportController
} from "controllers";
import { ClientError, Constants } from "common";
import { ResponseHelper } from "helpers";
/**
 * Middlewares
 */
function checkAdmin(req, res, next) {
  if (!req.session.admin) {
    return ResponseHelper.error(
      res,
      new ClientError(Constants.ACCESS_RIGHT_ERROR)
    );
  }
  next();
}
function checkHawker(req, res, next) {
  if (!req.session.hawker) {
    return ResponseHelper.error(
      res,
      new ClientError(Constants.ACCESS_RIGHT_ERROR)
    );
  }
  next();
}
function checkCustomer(req, res, next) {
  if (!req.session.customer) {
    return ResponseHelper.error(
      res,
      new ClientError(Constants.ACCESS_RIGHT_ERROR)
    );
  }
  next();
}
function checkLoggedIn(req, res, next) {
  if (!req.session.customer && !req.session.admin && !req.session.hawker) {
    return ResponseHelper.error(
      res,
      new ClientError(Constants.ACCESS_RIGHT_ERROR)
    );
  }
  next();
}

export default (app) => {
  app.use(express.json());

  // shared
  app.post(
    "/user/uploadProfileImage/:userEmail",
    // checkLoggedIn,
    UserController.request.uploadProfileImage
  );
  app.get(
    "/user/downloadProfileImage/:userEmail",
    // checkLoggedIn,
    UserController.request.downloadProfileImage
  );

  // customer
  app.post("/user/createNewCustomer", UserController.request.createNewCustomer);
  app.put(
    "/user/profile/updateProfile/:id",
    UserController.request.updateAccountDetails
  );
  app.put(
    "/customer/profile/addCard/:id", UserController.request.addCard
  );
  app.put(
    "/customer/profile/addFavouriteCentre/:id", UserController.request.addFavouriteCentre
  );
  app.put(
    "/customer/profile/removeFavouriteCentre/:id", UserController.request.removeFavouriteCentre
  );
  app.put(
    "/customer/profile/addFavouriteStore/:id", UserController.request.addFavouriteStore
  );
  app.put(
    "/customer/profile/removeFavouriteStore/:id", UserController.request.removeFavouriteStore
  );
  app.post("/customer/customerLogin", UserController.request.customerLogin);
  app.put(
    "/customer/customerLogout/:customerId",
    //checkCustomer,
    UserController.request.customerLogout
  );
  app.post(
    "/customer/createNewCustomer",
    UserController.request.createNewCustomer
  );
  app.get("/customer/findAllOutlets", OutletController.request.findAllOutlets);

  // hawker
  app.post("/hawker/registerHawker", UserController.request.createNewHawker);
  app.post("/hawker/hawkerLogin", UserController.request.hawkerLogin);
  app.put(
    "/hawker/hawkerLogout/:hawkerId",
    // checkHawker,
    UserController.request.hawkerLogout
  );
  app.post(
    "/hawker/uploadHawkerDocuments/:userEmail",
    UserController.request.uploadHawkerDocuments
  );
  app.post(
    "/hawker/uploadHawkerDocumentForDeluxe/:userEmail",
    UserController.request.uploadHawkerDocumentForDeluxe
  );
  app.get(
    "/hawker/downloadAccountUpgradeDocumentsAsZip/:hawkerEmail",
    //checkAdmin,
    UserController.request.downloadAccountUpgradeDocumentsAsZip
  );
  app.post(
    "/hawker/updateAccountTier/:hawkerId",
    //checkAdmin,
    UserController.request.updateAccountTier
  );
  app.get(
    "/hawker/findSubscriptionFees",
    //checkAdmin,
    UserController.request.findSubscriptionFees
  );

  // admin
  app.post("/admin/adminLogin", UserController.request.adminLogin);
  app.get("/admin/adminLogout", checkAdmin, UserController.request.adminLogout);
  app.get(
    "/admin/hawkerAccountManagement/findAllPendingHawkerAccounts",
    //checkAdmin,
    UserController.request.findAllPendingHawkerAccounts
  );
  app.get(
    "/admin/hawkerAccountManagement/findAllApprovedHawkerAccounts",
    //checkAdmin,
    UserController.request.findAllApprovedHawkerAccounts
  );
  app.post(
    "/admin/hawkerAccountManagement/updateSubscriptionFees",
    //checkAdmin,
    UserController.request.updateSubscriptionFees
  );
  app.put(
    "/admin/hawkerAccountManagement/approveHawker/:hawkerId",
    //checkAdmin,
    UserController.request.approveHawker
  );
  app.put(
    "/admin/hawkerAccountManagement/rejectHawker/:hawkerId",
    //checkAdmin,
    UserController.request.rejectHawker
  );
  app.get(
    "/admin/hawkerAccountManagement/findHawkerAccount/:id",
    checkAdmin,
    UserController.request.findHawkerAccount
  );
  app.put(
    "/admin/hawkerAccountManagement/updateHawkerAccount/:id",
    //checkAdmin,
    UserController.request.updateHawkerAccount
  );
  app.get(
    "/admin/hawkerAccountManagement/downloadHawkerDocumentsAsZip/:hawkerEmail",
    //checkAdmin,
    UserController.request.downloadHawkerDocumentsAsZip
  );
  // admin - hawker account upgrade requests
  app.post(
    "/admin/hawkerAccountManagement/approveAccountTier/:hawkerId",
    //checkAdmin,
    UserController.request.approveAccountTier
  );
  app.post(
    "/admin/hawkerAccountManagement/rejectAccountTier/:hawkerId",
    //checkAdmin,
    UserController.request.rejectAccountTier
  );
  app.get(
    "/admin/hawkerAccountManagement/findAllPendingUpgradeHawkerAccounts",
    UserController.request.findAllPendingUpgradeHawkerAccounts
  );
  app.get(
    "/admin/hawkerAccountManagement/findAllApprovedUpgradeHawkerAccounts",
    UserController.request.findAllApprovedUpgradeHawkerAccounts
  );

  /**
   * Customer Account Management - Admin
   */
  app.get(
    "/admin/customerAccountManagement/findAllCustomerAccounts/",
    //checkAdmin,
    UserController.request.findAllCustomerAccounts
  );
  app.put(
    "/admin/customerAccountManagement/activateCustomerAccount/:customerId",
    //checkAdmin,
    UserController.request.activateCustomerAccount
  );
  app.put(
    "/admin/customerAccountManagement/suspendCustomerAccount/:customerId",
    //checkAdmin,
    UserController.request.suspendCustomerAccount
  );
  app.put(
    "/admin/customerAccountManagement/updateCustomerAccount/:customerId",
    UserController.request.updateCustomerAccount
  );

  /**
   * Outlet controller - Admin
   */
  app.post(
    "/admin/hawkerAccountManagement/createOutlet/:id",
    //checkAdmin,
    OutletController.request.createNewOutlet
  );
  app.get(
    "/admin/hawkerAccountManagement/deleteOutlet/:outletId",
    //checkAdmin,
    OutletController.request.deleteOutlet
  );
  app.put(
    "/admin/hawkerAccountManagement/updateOutlet/:outletId",
    OutletController.request.updateOutlet
  );
  app.get(
    "/admin/financeManagement/findOutletById/:outletId",
    OutletController.request.findOutletById
  );
  app.get(
    "/admin/hawkerAccountManagement/findMasterOutletsByHawkerId/:hawkerId",
    OutletController.request.findMasterOutletsByHawkerId
  );

  /**
   * Outlet controller - Hawker
   */
  app.get(
    "/hawker/profile/outlet/findOutletById/:outletId",
    OutletController.request.findOutletById
  );
  app.get(
    "/hawker/profile/outlet/findOutletsByHawkerId/:hawkerId",
    OutletController.request.findOutletsByHawkerId
  );
  app.put(
    "/hawker/profile/outlet/updateOutlet/:outletId",
    OutletController.request.updateOutlet
  );
  app.get(
    "/hawker/queueManagement/findQueueSettingByOutletId/:outletId",
    OutletController.request.findQueueSettingByOutletId
  );
  app.post(
    "/hawker/queueManagement/updateQueueSetting",
    OutletController.request.updateQueueSetting
  );
  app.post(
    "/hawker/cashback/updateOutletCashback/:outletId",
    OutletController.request.updateOutletCashback
  );

  /*
   * Menu controller
   */
  app.post("/hawker/menu/createMenu", MenuController.request.createNewMenu);
  app.get(
    "/hawker/menu/findMenusByOutletId/:outletId",
    MenuController.request.findMenusByOutletId
  );
  app.get(
    "/hawker/menu/findActiveMenuByOutletId/:outletId",
    MenuController.request.findActiveMenuByOutletId
  );
  app.delete(
    "/hawker/menu/deleteMenu/:menuId",
    MenuController.request.deleteMenu
  );
  app.get(
    "/hawker/menu/findMenuById/:menuId",
    MenuController.request.findMenuById
  );
  app.get("/hawker/menu/findAllMenus", MenuController.request.findAllMenus);
  app.put("/hawker/menu/updateMenu/:menuId", MenuController.request.updateMenu);

  /**
   * Food item controller
   */

  app.post(
    "/hawker/foodItem/createFoodItem",
    FoodItemController.request.createNewFoodItem
  );
  app.post(
    "/hawker/foodItem/uploadFoodItemImage/:foodItemId",
    FoodItemController.request.uploadFoodItemImage
  );
  app.post(
    "/hawker/foodItem/updateFoodItemDetails/",
    FoodItemController.request.updateFoodItemDetails
  );
  app.get(
    "/hawker/foodItem/viewAllFoodItemByOutlet/:outletId",
    FoodItemController.request.findAllFoodItemByOutletId
  );
  app.delete(
    "/hawker/foodItem/deleteFoodItem/:foodItemId",
    FoodItemController.request.deleteFoodItem
  );
  app.get(
    "/hawker/foodItem/findFoodItemById/:foodItemId",
    FoodItemController.request.findFoodItemById
  );
  app.get(
    "/hawker/foodItem/disableFoodItemById/:foodItemId",
    FoodItemController.request.disableFoodItemById
  );
  app.get(
    "/hawker/foodItem/enableFoodItemById/:foodItemId",
    FoodItemController.request.enableFoodItemById
  );
  app.get(
    "/hawker/menuManagement/retrieveAllUniqueFoodCategories/:outletId",
    FoodItemController.request.retrieveAllUniqueFoodCategories
  );
  app.post(
    "/hawker/menuManagement/updateCategoryName/:outletId",
    FoodItemController.request.updateCategoryName
  );
  app.post(
    "/hawker/menuManagement/updateCategory/",
    FoodItemController.request.updateCategory
  );
  app.post(
    "/hawker/menuManagement/updateCategory/",
    FoodItemController.request.updateCategory
  );

  /**
   * Order controller
   */
  app.get(
    "/customer/orderManagement/findCompletedOrdersByCustomerId/:customerId",
    OrderController.request.findCompletedOrdersByCustomerId
  );
  app.get(
    "/customer/orderManagement/findOngoingOrdersByCustomerId/:customerId",
    OrderController.request.findOngoingOrdersByCustomerId
  );
  app.get(
    "/customer/orderManagement/findAllHawkerCenters",
    OrderController.request.findAllHawkerCenters
  );
  app.get(
    "/customer/orderManagement/findAllHawkerOutletsByHawkerCentre/:hawkerCentreName",
    OrderController.request.findAllHawkerOutletsByHawkerCentre
  );
  app.get(
    "/hawker/orderManagement/findCompletedOrdersByOutletId/:outletId",
    OrderController.request.findCompletedOrdersByOutletId
  );
  app.get(
    "/hawker/orderManagement/findOrderByOrderId/:orderId",
    OrderController.request.findOrderByOrderId
  );
  app.put(
    "/hawker/orderManagement/findOrdersById",
    OrderController.request.findOrdersById
  );
  app.put(
    "/hawker/orderManagement/findOrdersByOrderId",
    OrderController.request.findOrdersByOrderId
  );
  app.get(
    "/hawker/orderManagement/findAllInProgressOrdersByOutletId/:outletId",
    OrderController.request.findAllInProgressOrdersByOutletId
  );
  app.get(
    "/hawker/orderManagement/cancelAllInProgressOrdersByOutletId/:outletId",
    OrderController.request.cancelAllInProgressOrdersByOutletId
  );
  app.get(
    "/hawker/orderManagement/retrieveCompletedOrdersByOutletId/:outletId/:startDate/:endDate",
    OrderController.request.retrieveCompletedOrdersByOutletId
  );
  app.get(
    "/hawker/orderManagement/retrieveCompletedOrdersByOutletId/:outletId/:startDate",
    OrderController.request.retrieveCompletedOrdersByOutletId
  );
  app.put(
    "/hawker/orderManagement/updateOrderFoodItemStatusForMultipleOrders/:foodItemId/:foodItemStatus",
    OrderController.request.updateOrderFoodItemStatusForMultipleOrders
  );
  app.put(
    "/hawker/orderManagement/updateOrderBundleItemStatusForMultipleOrders/:foodBundleId/:foodItemId/:foodBundleStatus",
    OrderController.request.updateOrderBundleItemStatusForMultipleOrders
  );
  app.post(
    "/hawker/orderManagement/updateOrderStatus/:newStatus",
    OrderController.request.updateOrderStatus
  );
  app.post(
    "/customer/orderManagement/cancelOrder",
    OrderController.request.cancelOrder
  );
  app.post(
    "/customer/orderManagement/updateOrder",
    OrderController.request.updateOrder
  );
  app.post(
    "/customer/orderManagement/createNewOrder",
    OrderController.request.createNewOrder
  );
  app.post(
    "/customer/orderManagement/createNewGuestHawkerOrder",
    OrderController.request.createNewGuestHawkerOrder
  );
  app.post(
    "/customer/orderManagement/createNewGuestCustomerOrder",
    OrderController.request.createNewGuestCustomerOrder
  );

  /**
   * LEADER BOARD
   */
  app.get(
    "/hawker/hawkerLeaderboardModule/findAllHawkerCentresAndCuisineTypes",
    OrderController.request.findAllHawkerCentresAndCuisineTypes
  );
  app.get(
    "/hawker/hawkerLeaderboardModule/findNumOfSalesForAllHawkers",
    OrderController.request.findNumOfSalesForAllHawkers
  );
  app.get(
    "/hawker/hawkerLeaderboardModule/findNumOfSalesForAllHawkersForPastDays/:numOfDays",
    OrderController.request.findNumOfSalesForAllHawkersForPastDays
  );
  app.get(
    "/hawker/hawkerLeaderboardModule/findNumOfSalesForAllFoodItem",
    OrderController.request.findNumOfSalesForAllFoodItem
  );
  app.get(
    "/hawker/hawkerLeaderboardModule/findNumOfSalesForAllFoodItemForPastDays/:numOfDays",
    OrderController.request.findNumOfSalesForAllFoodItemForPastDays
  );
  app.get(
    "/hawker/hawkerLeaderboardModule/findNumOfFavouritesForAllHawkers",
    UserController.request.findNumOfFavouritesForAllHawkers
  )
  app.get(
    "/hawker/hawkerLeaderboardModule/findNumOfFavouritesForAllHawkerCentres",
    UserController.request.findNumOfFavouritesForAllHawkerCentres
  )

  /**
  * ANALYTICS
  */
   app.post(
    "/hawker/analytics/generateHawkerAnalytics/:outletId",
    OrderController.request.generateHawkerAnalytics
  );

  app.post(
    "/hawker/analytics/generateHawkerAnalyticsEarnings/:outletId",
    OrderController.request.generateHawkerAnalyticsEarnings
  );

  /**
  * WALLET CONTROLLER
  */

  // shared
  app.get(
    "/wallet/findWalletByOwnerId/:ownerId",
    WalletController.request.findWalletByOwnerId
  );

  // admin
  app.post(
    "/admin/wallet/debitSubscriptionFeeByWalletId/:walletId",
    WalletController.request.debitSubscriptionFeeByWalletId
  );
  app.post(
    "/admin/wallet/refundForOrder",
    WalletController.request.refundForOrder
  );
  app.post(
    "/admin/wallet/generatePlatformEarningDashboard/:walletId",
    WalletController.request.generatePlatformEarningDashboard
  );

  //customer
  app.get(
    "/customer/wallet/createNewWalletForCustomer/:customerId",
    WalletController.request.createNewWalletForCustomer
  );
  app.post(
    "/customer/wallet/topUpFromCreditCardToWallet/:walletId",
    WalletController.request.topUpFromCreditCardToWallet
  );

  //hawker
  app.post(
    "/hawker/wallet/createNewWalletForOutlet/:outletId",
    WalletController.request.createNewWalletForOutlet
  );
  app.post(
    "/hawker/wallet/debitFromWalletToBankAccount/:walletId",
    WalletController.request.debitFromWalletToBankAccount
  );
  app.post(
    "/hawker/wallet/updateWithdrawalFrequency/:walletId",
    WalletController.request.updateWithdrawalFrequency
  );

  /**
  * Report controller
  */

  // shared
  app.post(
    "/report/createNewFeedback",
    ReportController.request.createNewFeedback
  );
  app.post(
    "/report/createNewComplaint",
    ReportController.request.createNewComplaint
  );
  app.post(
    "/report/updateReportDetailsById/:reportId",
    ReportController.request.updateReportDetailsById
  );
  app.get(
    "/report/deleteReportById/:reportId",
    ReportController.request.deleteReportById
  );

  //admin
  app.get(
    "/admin/report/findAllPendingComplaints",
    ReportController.request.findAllPendingComplaints
  );
  app.get(
    "/admin/report/findAllCompletedComplaints",
    ReportController.request.findAllCompletedComplaints
  );
  app.get(
    "/admin/report/findAllFeedbacks",
    ReportController.request.findAllFeedbacks
  );
  app.get(
    "/admin/report/findAllReports",
    ReportController.request.findAllReports
  );

  //customer
  app.get(
    "/customer/report/findReportsByCustomerId/:customerId",
    ReportController.request.findReportsByCustomerId
  );

  app.get(
    "/customer/report/findComplaintsByCustomerId/:customerId",
    ReportController.request.findComplaintsByCustomerId
  );

  //hawker
  app.get(
    "/hawker/report/findReportsByOutletId/:outletId",
    ReportController.request.findReportsByOutletId
  );

  app.get(
    "/hawker/report/findComplaintsByOutletId/:outletId",
    ReportController.request.findComplaintsByOutletId
  );

  /**
  * Delivery
  */
  app.get(
    "/customer/delivery/findAllDeliveryOrders",
    OrderController.request.findAllDeliveryOrders
  );
  app.get(
    "/customer/delivery/findAllDeliveryOrdersByHawkerCenter/:hawkerCenterName",
    OrderController.request.findAllDeliveryOrdersByHawkerCenter
  );
  app.get(
    "/customer/delivery/findAllCompletedDeliveryOrdersByDelivererId/:delivererId",
    OrderController.request.findAllCompletedDeliveryOrdersByDelivererId
  );

};
