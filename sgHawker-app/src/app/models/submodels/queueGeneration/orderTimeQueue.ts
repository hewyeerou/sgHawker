import { SimilarGroup } from './similarGroup';
import { QueuePreferenceEnum } from './../../enums/queue-preference-enum';
/* eslint-disable object-shorthand */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable max-len */
import { QueueConditionEnum } from './../../enums/queue-condition-enum';
import { QueueInterface } from './queueInterface';
import { Order } from '../../order';
import { createPriorityQueue } from '@algorithm.ts/priority-queue';
import * as moment from 'moment';
import { OrderStatusEnum } from '../../enums/order-status-enum.enum';

declare const require: any;
const Denque = require('denque');

/**
 * Utility class to represent a queue by order time
 */
export class OrderTimeQueue implements QueueInterface {
    private queueType: QueueConditionEnum;
    private orderQ = createPriorityQueue<Order>((orderA: Order, orderB: Order) => moment(orderA.orderCreationTime) < moment(orderB.orderCreationTime) ? 1 : -1);
    // denque will be in the same order as the PQ
    private denque: any;
    private currentItemInDenque;

    constructor(
        queueType?: QueueConditionEnum
    ) {
        this.queueType = queueType;
        this.denque = new Denque();
        this.currentItemInDenque = 0;
    }

    viewNextGroup() {
        return this.orderQ.top();
    }

    setNextGroupOrderStatus(status) {
        return this.orderQ.top().orderStatus = status;
    }

    getQueueCondition(): QueueConditionEnum {
        return this.queueType;
    }

    getQueueType(): QueuePreferenceEnum {
        return QueuePreferenceEnum.ORDER_TIME;
    }

    getQueueSize() {
        return this.orderQ.size();
    }

    addGroupToPreviousCompletedGroups(order: Order) {
        if (this.currentItemInDenque < 5) {
            this.currentItemInDenque = this.denque.push(order);
        } else {
            this.denque.shift(); // remove the least recent order item
            this.denque.push(order);
        }
    }

    getNextGroup(): Order {
        return this.orderQ.dequeue();
    }

    getPreviousCompletedGroup(): Order {
        const order = this.denque.pop(); // remove most recent order
        if (this.currentItemInDenque > 0) {
            this.currentItemInDenque--;
        }
        return order;
    }

    peekPreviousCompletedGroups(): Order[] {
        return this.denque.toArray();
    }

    addOrderToQueue(order: Order): void {
        this.orderQ.enqueue(order);
    }

    //FIX ME
    addOrderGroupToQueue(group: SimilarGroup): void {
      return;
    }
 }
