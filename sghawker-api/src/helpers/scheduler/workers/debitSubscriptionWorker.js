import { User } from 'models';
import { Logger } from 'common';
import moment from 'moment';

const DEBUG_ENV = 'debitSubscriptionFeeForTimeOut';

export default {
    run: function () {
        Logger.info('Debit subscription fee from outlet credit card started', DEBUG_ENV);
        const lastDayOfMonth = moment().daysInMonth().toString();
        const todayDate = moment().format('D');
        if (todayDate === lastDayOfMonth) {
            return User.debitSubscriptionFeeForTimeOut();
        }
    }
};
