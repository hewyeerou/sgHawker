/* eslint-disable arrow-body-style */
import { OrderStatusEnum } from 'src/app/models/enums/order-status-enum.enum';
import { QueueInterface } from './queueInterface';
/* eslint-disable no-underscore-dangle */
import { QueueSetting } from '../../queueSetting';
import { SimilarGroup } from './similarGroup';
import { Order } from '../../order';
import { FoodItem } from '../../foodItem';
import * as _ from 'lodash';
import { QueueConditionEnum } from '../../enums/queue-condition-enum';
import { QueuePreferenceEnum } from '../../enums/queue-preference-enum';

declare const require: any;
const Denque = require('denque');

export class SimilarItemQueue implements QueueInterface {

    private queueType: QueueConditionEnum;
    private orderQ: SimilarGroup[];
    private serial_number: number;
    private queueSetting: QueueSetting;  // ensure that queueSetting is the transformed queue setting
    private denque: any;
    private currentItemInDenque: number;

    constructor(
        queueSetting: QueueSetting,
        queueType?: QueueConditionEnum,
    ) {
        this.serial_number = 0;
        this.orderQ = [];
        this.queueSetting = queueSetting;
        this.queueType = queueType;
        this.denque = new Denque();
        this.currentItemInDenque = 0;
    }

    viewNextGroup(): SimilarGroup {
        return this.orderQ[0];
    }

    addGroupToPreviousCompletedGroups(order: SimilarGroup) {
        if (this.currentItemInDenque < 5) {
            this.currentItemInDenque = this.denque.push(order);
        } else {
            this.denque.shift(); // remove the least recent order item
            this.denque.push(order);
        }
    }

    getNextGroup(): SimilarGroup {
        const order = this.orderQ[0];
        this.orderQ.splice(0, 1); // remove the first element from array
        return order;
    }

    getPreviousCompletedGroup(): SimilarGroup {
        const order = this.denque.pop(); // remove most recent order
        if (this.currentItemInDenque > 0) {
            this.currentItemInDenque--;
        }
        this.serial_number--;
        return order;
    }

    peekPreviousCompletedGroups(): SimilarGroup[] {
        return this.denque.toArray();
    }

    addOrderGroupToQueue(group: SimilarGroup): void {
        this.orderQ = [group].concat(this.orderQ);
    }

    addOrderToQueue(order: Order): void {
        const map: Map<string, FoodItem> = new Map();

        _.forEach(order.individualOrderItems, orderItem => {
            if (!map.get(orderItem.foodItem._id)) {
                map.set(orderItem.foodItem._id, orderItem.foodItem);
            }
        });

        _.forEach(order.foodBundleOrderItems, bundleOrder => {
            _.forEach(bundleOrder.bundleItems, orderItem => {
                if (!map.get(orderItem.foodItem._id)) {
                    map.set(orderItem.foodItem._id, orderItem.foodItem);
                }
            });
        });

        for (const group of this.orderQ) {
            if (group.hasSpace() && group.canAddOrder(order)) {
                group.addOrder(order);
                map.delete(group.foodItem._id);
            }
        }

        this._addNewSimilarItemToQ(order, map);
    }

    getQueueCondition(): QueueConditionEnum {
        return this.queueType;
    }

    getQueueType(): QueuePreferenceEnum {
        return QueuePreferenceEnum.SIMILAR_ITEM;
    }

    getQueueSize() {
        return this.orderQ.length;
    }

    private _addNewSimilarItemToQ(order: Order, map: Map<string, FoodItem>) {
        for (const [key, value] of map) {
            this.serial_number++;
            const maxItemQuantity = this.queueSetting.queueBySimilarOrderSetting.orderItemGroupQuantityMap.get(value._id);
            const similarItem = new SimilarGroup(maxItemQuantity, this.serial_number);
            similarItem.foodItem = _.cloneDeep(value);
            similarItem.addOrder(order);
            this.orderQ.push(similarItem);
        }
    }
}
