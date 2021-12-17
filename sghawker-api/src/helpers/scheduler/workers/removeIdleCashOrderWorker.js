import { Order } from "models";
import { Logger } from "common";

const DEBUG_ENV = "removeUnpaidCashOrdersForTimeout";

export default {
  run: function () {
    Logger.info("Delete idle unpaid cash order worker started", DEBUG_ENV);
    return Order.removeUnpaidCashOrdersForTimeout().then(
      response => {
        Logger.info(`Delete idle unpaid cash order worker success`, DEBUG_ENV);
      },
      (error) => {
        Logger.error(`Error : ${error}`, DEBUG_ENV);
      }
    );
  },
};
