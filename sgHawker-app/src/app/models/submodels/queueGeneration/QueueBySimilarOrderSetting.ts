import { FoodItem } from '../../foodItem';
import { OrderItemGroupQuantity } from './orderItemGroupQuantity';
import { QueueCondition } from './queueCondition';

export class QueueBySimilarOrderSetting {

  _id?: string;
  orderItemGroupQuantity?: OrderItemGroupQuantity[];
  orderItemGroupQuantityMap?: Map<string, number>;
  queueSegregationCondition?: QueueCondition[];

  constructor(
    _id?: string,
    orderItemGroupQuantity?: OrderItemGroupQuantity[],
    orderItemGroupQuantityMap?: Map<string, number>,
    queueSegregationCondition?: QueueCondition[]
  ) {
    this._id = _id;
    this.orderItemGroupQuantity = orderItemGroupQuantity;
    this.orderItemGroupQuantityMap = orderItemGroupQuantityMap;
    this.queueSegregationCondition = queueSegregationCondition;
  }
}
