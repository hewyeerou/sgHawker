import { Order } from "models";
import { Logger } from "common";

const DEBUG_ENV = "fetchNewUnpaidOrdersForTimeOut";

export default {
  run: function () {
    Logger.info("fetch new unpaid cash order worker started", DEBUG_ENV);
    return Order.fetchNewUnpaidOrdersForTimeOut().then(
      response => {
        Logger.info(`fetch new unpaid cash order worker success`, DEBUG_ENV);
      },
      (error) => {
        Logger.error(`Error : ${error}`, DEBUG_ENV);
      }
    );
  },
};
