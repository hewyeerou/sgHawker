import { QueuePreferenceEnum } from './enums/queue-preference-enum';
import { Outlet } from './outlet';
import { QueueCondition } from './submodels/queueGeneration/queueCondition';
import { QueueBySimilarOrderSetting } from './submodels/queueGeneration/QueueBySimilarOrderSetting';

export class QueueSetting {
  _id: string | undefined;
  outlet: Outlet | undefined;
  defaultQueuePreference: QueuePreferenceEnum | undefined;
  queueByOrderTimeSetting: QueueCondition[] | undefined;
  queueBySimilarOrderSetting: QueueBySimilarOrderSetting | undefined;

  constructor(
    _id?: string,
    outlet?: Outlet,
    defaultQueuePreference?: QueuePreferenceEnum,
    queueByOrderTimeSetting?: QueueCondition[],
    queueBySimilarOrderSetting?: QueueBySimilarOrderSetting,
    ) {
      this._id = _id;
      this.outlet = outlet;
      this.defaultQueuePreference = defaultQueuePreference;
      this.queueByOrderTimeSetting = queueByOrderTimeSetting;
      this.queueBySimilarOrderSetting = queueBySimilarOrderSetting;
    }
}
