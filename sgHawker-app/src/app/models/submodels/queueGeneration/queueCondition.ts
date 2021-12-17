import { QueueConditionEnum } from '../../enums/queue-condition-enum';

export class QueueCondition {

  _id?: string;
  queueCondition?: QueueConditionEnum;

  constructor(
    _id?: string,
    queueCondition?: QueueConditionEnum
  ) {
    this._id = _id;
    this.queueCondition = queueCondition;
  }
}
