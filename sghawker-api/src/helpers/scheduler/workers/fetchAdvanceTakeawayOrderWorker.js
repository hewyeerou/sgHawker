import { Order } from 'models';
import { Logger } from 'common';

const DEBUG_ENV = 'updateAdvanceTakeawayOrderForTimeOut';

export default {
    run: function () {
        Logger.info('Update advance takeaway paid order worker started', DEBUG_ENV);
        return Order.updateAdvanceTakeawayOrderForTimeOut().then(
            response => {
                Logger.info(`Updated advance takeaway paid order to received successfully`, DEBUG_ENV);
            },
            error => {
                Logger.error(`Error : ${error}`, DEBUG_ENV);
            }
        );
    }
};
