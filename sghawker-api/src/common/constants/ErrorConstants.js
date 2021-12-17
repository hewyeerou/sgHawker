const FieldRanges = {
  // User Range
  USER_EMAIL_MIN_LENGTH: 1,
  USER_NAME_MIN_LENGTH: 1,
  USER_PW_MIN_LENGTH: 6,
  USER_PW_MAX_LENGTH: 30,

  // food item
  ITEM_MIN_PRICE: 0,
  ITEM_MAX_PRICE: 1000
};

const ErrorConstants = {
  ERROR_POLL_EXCEEDED_MAX_ATTEMPTS: "Exceeded number of poll attempts.",

  // Mongoose Errors
  ERROR_MONGOOSE_DID_EXIST: "MongoDB object did exist",
  ERROR_MONGOOSE_DID_NOT_EXIST: "MongoDB object did not exist",
  ERROR_NOT_MONGOOSE_OBJECT: "Not MongoDB object",
  ERROR_SELECT_OPTION_INCLUSION_EXCLUSION:
    "Not able to include and exclude fields for select options at the same time",

  // User Errors
  ERROR_USER_ID_REQUIRED: "User ID is required",
  ERROR_USER_EMAIL_NOT_FOUND: "There is no user with the email",
  ERROR_USER_LOGIN_INCORRECT: "User email or password is incorrect",
  ERROR_USER_UPDATE_INFO_FAIL: "Fail to update user info. Please try again",
  ERROR_USER_EMAIL_REQUIRED: "User email is required",
  ERROR_USER_EMAIL_IN_USE: "Account with this email already exists",
  ERROR_USER_EMAIL_NOT_IN_USE: "Account with this email does not exist",
  ERROR_USER_EMAIL_INVALID: "User email is invalid",
  ERROR_USER_EMAIL_MIN_LENGTH: `User email length should be at least ${FieldRanges.USER_EMAIL_MIN_LENGTH}`,
  ERROR_USER_NAME_REQUIRED: "User name is required",
  ERROR_USER_NAME_MIN_LENGTH: `User name length should be at least ${FieldRanges.USER_NAME_MIN_LENGTH}`,
  ERROR_USER_PW_REQUIRED: "Please fill up all password fields",
  ERROR_USER_PW_NOT_STRONG: "Password does not meet requirement",
  ERROR_USER_PW_MIN_LENGTH: `Password length should be at least ${FieldRanges.USER_PW_MIN_LENGTH}`,
  ERROR_USER_PW_MAX_LENGTH: `Password length should be at most ${FieldRanges.USER_PW_MAX_LENGTH}`,
  ERROR_USER_PW_INCORRECT: "The old password you entered is incorrect",
  ERROR_USER_CONFIRMED_PW_MISMATCH:
    "The new passwords you entered do not match",
  ERROR_USER_PHONE_REQUIRED: "User phone number is required",
  ERROR_USER_PHONE_NUMERIC_REQUIRED:
    "User phone number must contain only numeric characters",
  ERROR_USER_PW_CHANGE_DISABLED_NUS:
    "Password change is not applicable for NUS user login",
  ERROR_USER_ACCOUNT_TYPE_NOT_FOUND: "User account requires an account type",
  ERROR_USER_ACCOUNT_TIER_NOT_FOUND: "User account requires an account tier",
  ERROR_USER_ACCOUNT_TIER_STATUS_NOT_FOUND: "User account requires an account tier status",
  ERROR_USER_SUBSCRIPTION_FEES_NOT_FOUND: "There are no subscription fees",
  ERROR_USER_PROFILE_IMAGE_NOT_FOUND: "User does not have profile image",
  ERROR_USER_ADDRESSES_NOT_FOUND: "User does not have any address",
  ERROR_USER_CARDS_NOT_FOUND: "User does not have any card",
  ERROR_USER_FAVOURITE_CENTRES_NOT_FOUND: "User does not have any favourited hawker centres",
  ERROR_USER_FAVOURITE_STORES_NOT_FOUND: "User does not have any favourited hawker stores",

  ERROR_MULTIPLE_LOGIN: "Account does not allow login from multiple devices",

  // admin
  NO_ADMIN_ACCOUNTS: 'No admin accounts in system',
  NO_WRITTEN_INSTRUCTIONS_FOUND: 'Please provide a written instruction',
  ACCESS_RIGHT_ERROR: "Restricted access for user",

  // HAWKER
  NO_PENDING_HAWKER_ACCOUNTS: "No hawker accounts pending approval",
  ERROR_HAWKER_ACCOUNT_ID_NOT_FOUND: "Hawker account id is required",
  ERROR_INVALID_HAWKER_ID: "Hawker account id is invalid",

  // CUSTOMER
  ERROR_CUSTOMER_ACCOUNT_ID_NOT_FOUND: "Customer account id is required",

  // HAWKER ACCOUNT STATUS
  ERROR_HAWKER_ACCOUNT_DEACTIVATED: "Hawker account has been deactivated. Please contact the administrator",
  ERROR_HAWKER_ACCOUNT_REJECTED: "Hawker account has been rejected. Please contact the administrator",
  ERROR_HAWKER_ACCOUNT_PENDING: "Hawker account is pending approval",
  ERROR_HAWKER_ACCOUNT_DELETED: "Hawker account has been deleted. Please contact the administrator",
  ERROR_HAWKER_ACCOUNT_SUSPENDING: "Hawker account has been suspended. Please contact the administrator",
  ERROR_HAWKER_ACCOUNT_APPROVED: "Hawker account has been approved, Please wait while the system add your outlet profiles.",

  // OUTLET
  ERROR_OUTLET_NAME_REQUIRED: "Outlet name is required",
  ERROR_OUTLET_ADDRESS_REQUIRED: "Outlet address is required",
  ERROR_OUTLET_HAWKER_CENTRE_REQUIRED: "Hawker centre is required",
  ERROR_OUTLET_ID_NOT_FOUND: "Outlet id is required",
  ERROR_OUTLET_HAWKER_REQUIRED: "Hawker is required",
  ERROR_OUTLET_INVALID_ID_PROVIDED: "Outlet Id provided is invalid",
  ERROR_OUTLET_CONTACT_NUMBER_REQUIRED: "Outlet contact number is required",
  ERROR_OUTLET_CONTACT_NUMBER_NUMERIC_REQUIRED: "Outlet contact number must contain only numeric characters",
  ERROR_OUTLET_CUISINE_TYPE_REQUIRED: "Outlet cuisine type is required",
  ERROR_OUTLET_CASHBACK_RATE_REQUIRED: "Outlet cashback rate is required",
  ERROR_CASHBACK_RATE_OUT_OF_RANGE: "Outlet cashback rate must between 0 and 1",

  // FOOD ITEM
  ERROR_FOOD_ITEM_ID_NOT_FOUND: "Food Item id is required",
  ERROR_FOOD_NAME_REQUIRED: "Food item name is required",
  ERROR_FOOD_OUTLET_REQUIRED: 'Food item requires an outlet',
  ERROR_ITEM_DESCRIPTION_REQUIRED: "Food item description is required",
  ERROR_ITEM_PRICE_REQUIRED: "Food item price is required",
  ERROR_NEGATIVE_ITEM_PRICE: "Food item price is negative",
  ERROR_ITEM_PRICE_EXCEED_LIMIT: `Food item price exceed limit of ${FieldRanges.ITEM_MAX_PRICE}`,
  ERROR_ITEM_IMAGE_SOURCE_REQUIRED: "Image is required for food item",
  ERROR_ITEM_AVAILABILITY_REQUIRED: "Food item availability is required",
  ERROR_ITEM_CATEGORIES_REQUIRED: "Food item requires one category",
  ERROR_ITEM_CUSTOMIZATIONS_REQUIRED: "Food item requires at least one customization",
  ERROR_ITEM_CUSTOMIZATION_NAME_REQUIRED: "Food item customization requires name",
  ERROR_ITEM_CUSTOMIZATION_OPTIONS_REQUIRED: "Food item customization requires options",
  ERROR_ITEM_CUSTOMIZATION_OPTION_PRICE_REQUIRED: "Food item customization option requires price",
  ERROR_ITEM_CUSTOMIZATION_OPTION_NAME_REQUIRED: "Food item customization option requires name",
  ERROR_ITEM_CUSTOMIZATION_OPTION_PRICE_EXCEED_LIMIT: `Food item customization option price exceed limit of ${FieldRanges.ITEM_MAX_PRICE}`,
  ERROR_NEGATIVE_CUSTOMIZATION_OPTION_PRICE: `Food item customization option price is negative`,
  ERROR_ITEM_MENU_MISSING: 'Food item requires at least one menu',
  ERROR_FOOD_ITEM_NOT_FOUND: 'Food item not found',


  // MENU
  ERROR_MENU_NAME_REQUIRED: 'Menu name is required',
  ERROR_MENU_ID_NOT_FOUND: "Outlet id is required",
  ERROR_MENU_CATEGORIES_REQUIRED: 'Menu requires at least one category',
  ERROR_MENU_CATEGORY_NAME_REQUIRED: 'Menu category name is required',
  ERROR_MENU_CATEGORY_FOOD_ITEMS_REQUIRED: 'Menu category requires at least one food item',
  ERROR_MENU_BUNDLE_REQUIRED: 'Menu requires at least one food bundle',
  ERROR_MENU_BUNDLE_FOOD_ITEMS_REQUIRED: 'Menu bundle requires at least one food item',
  ERROR_MENU_BUNDLE_NAME_REQUIRED: 'Menu bundle name is required',
  ERROR_MENU_BUNDLE_PRICE_REQUIRED: 'Menu bundle price is required',
  ERROR_NEGATIVE_BUNDLE_PRICE: "Bundle price is negative",
  ERROR_BUNDLE_PRICE_EXCEED_LIMIT: `Bundle price exceed limit of ${FieldRanges.ITEM_MAX_PRICE}`,
  ERROR_OUTLET_REQUIRED: 'Menu requires an outlet',
  ERROR_MENU_FOOD_ITEM_REQUIRED: 'Menu requires at least one food item',

  // ORDER
  ERROR_ORDER_ID_NOT_FOUND: 'Order not found.',
  ERROR_ORDER_COMPLETION_TIME_REQUIRED: 'Order requires completion time',
  ERROR_ORDER_ESTIMATED_TIME_REQUIRED: 'Order requires estimated time till completion',
  ERROR_ORDER_CUSTOMER_REQUIRED: 'Order requires a customer',
  ERROR_ORDER_OUTLET_REQUIRED: 'Order requires an outlet',
  ERROR_ORDER_TOTAL_PRICE_REQUIRED: "Order requires total price",
  ERROR_ORDER_TYPE_REQUIRED: "Order requires order type",
  ERROR_ORDER_STATUS_REQUIRED: "Order requires order status",
  ERROR_ORDER_SPECIAL_NOTE_REQUIRED: "Order requires special note",
  ERROR_ORDER_FOOD_BUNDLE_REQUIRED: "Order requires at least one food bundle",
  ERROR_ORDER_FOOD_BUNDLE_UUID_REQUIRED: "Food bundle in order has missing UUID",
  ERROR_ORDER_FOOD_BUNDLE_NAME_REQUIRED: "Food bundle in order has missing bundle name",
  ERROR_ORDER_FOOD_BUNDLE_SUBTOTAL_REQUIRED: "Food bundle in order has missing subtotal",
  ERROR_ORDER_FOOD_BUNDLE_ITEMS_REQUIRED: "Food bundle in order requires at least one food item",
  ERROR_ORDER_FOOD_ITEMS_REQUIRED: "Order requires at least one order item",
  ERROR_ORDER_FOOD_ITEM_REQUIRED: "Order item has missing food item",
  ERROR_ORDER_FOOD_ITEM_SUBTOTAL_REQUIRED: "Order item has missing subtotal",
  ERROR_EMPTY_ORDER: "Order has no items",
  ERROR_CUSTOMER_ID_REQUIRED: "Valid customer id is required",
  ERROR_OUTLET_ID_REQUIRED: "Valid outlet id is required",
  ERROR_ORDER_PAYMENT_TYPE_REQUIRED: 'Order requires payment type',
  ERROR_ADVANCE_ORDER_REQUIRE_PICK_UP_TIME: "Order pick up time is required for advance order",
  ERROR_WRONG_NEXT_STATUS_FOR_ORDER: "Order has incorrect next status",
  ERROR_CANNOT_CANCEL_PREPARING_ORDER: "Order is currently being prepared",
  ERROR_CANNOT_CANCEL_OVERDUE_ORDER: "Order is has exceeded 15 minutes",
  ERROR_CANNOT_CANCEL_PAID_CASH_ORDER: "Cannot cancel paid cash orders",
  ERROR_INCORRECT_INPUT_OF_DATE: "Incorrect input of date",

  //Leaderboard (ORDER)
  ERROR_INCORRECT_INPUT_OF_NUMBER_OF_DAYS: "Incorrect input on number of days",
  // wallet
  ERROR_WALLET_BALANCE_REQUIRED: "Wallet balance not found",
  ERROR_WALLET_WITHDRAWAL_FREQUENCY_REQUIRED: "Wallet withdrawal frequency not found",
  ERROR_TOP_UP_AMOUNT_MUST_BE_POSITIVE: "Wallet top up amount must be positive",
  ERROR_REFUND_REQUIRE_AMOUNT: "Refunding requires amount to refund",
  ERROR_REFUND_REQUIRE_TO_WALLET: "Refunding requires a target wallet",
  ERROR_REFUND_REQUIRE_FROM_WALLET: "Refunding requires a source wallet",
  ERROR_REFUND_REQUIRE_ORDER: "Refunding requires the associated order",
  
  // transaction
  ERROR_TRANSACTION_TYPE_REQUIRED: "Wallet transaction type is required",
  ERROR_PAID_CASHBACK_AMOUNT_REQUIRED: "Wallet transaction paid cashback amount is required",
  ERROR_PAID_NONCASHBACK_AMOUNT_REQUIRED: "Wallet transaction paid non-cashback amount is required",
  ERROR_RECEIVED_CASHBACK_AMOUNT_REQUIRED: "Wallet transaction received cash back amount is required",
  ERROR_TOP_UP_AMOUNT_REQUIRED: "Wallet transaction top up amount is required",
  ERROR_WITHDRAWAL_AMOUNT_REQUIRED: "Wallet transaction withdrawal amount is required",
  ERROR_INCOMPLETE_CREDIT_CARD_INFO: "Incomplete credit card information is provided",
  ERROR_INCOMPLETE_BANK_ACCOUNT_INFO: "Incomplete bank account information is provided",

  // report
  ERROR_REPORT_TYPE_REQUIRED: "Report type is required",
  ERROR_REPORT_DESCRIPTION_REQUIRED: "Report description is required",
  ERROR_REPORT_STATUS_REQUIRED: "Report status is required",
  ERROR_REPORT_UNABLE_TO_DELETE: "The complaint is currently being attended to by the admin team",
  ERROR_INVALID_REPORT_STATUS: "Next report status cannot be new"
};

export default {
  ...FieldRanges,
  ...ErrorConstants
};
