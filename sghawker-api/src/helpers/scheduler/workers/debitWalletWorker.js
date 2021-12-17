import { User } from 'models';
import { Logger } from 'common';

const DEBUG_ENV = 'debitFromWalletToBankAccountForTimeOut';

export default {
    run: function () {
        Logger.info('Debit outlet digital wallet to bank account started', DEBUG_ENV);
        return User.debitFromWalletToBankAccountForTimeOut();
    }
};
