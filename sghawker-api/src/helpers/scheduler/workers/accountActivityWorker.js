import { User } from 'models';
import { Logger } from 'common';

const DEBUG_ENV = 'updateHawkerAccountStatusForTimeout';

export default {
  run: function () {
    Logger.info('Deactivate idle hawker accounts worker started', DEBUG_ENV);
    return User.updateHawkerAccountStatusForTimeout().then(
      data => {
        if (data) {
          Logger.info(`Deactivated idle hawker accounts success`, DEBUG_ENV);
        }
      },
      error => {
        Logger.error(`Error : ${error}`, DEBUG_ENV);
      }
    );
  }
};
