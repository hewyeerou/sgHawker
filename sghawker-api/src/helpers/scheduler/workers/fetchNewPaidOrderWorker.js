import { Order } from 'models';
import { Logger } from 'common';

const DEBUG_ENV = "fetchNewPaidOrdersForTimeOut";

export default {
    run: function () {
        Logger.info('Update new paid order worker started', DEBUG_ENV);
        return Order.fetchNewPaidOrdersForTimeOut().then(
            response => {
                Logger.info(`Updated new paid order to received successfully`, DEBUG_ENV);
            },
            error => {
                Logger.error(`Error : ${error}`, DEBUG_ENV);
            }
        );
    }
};
