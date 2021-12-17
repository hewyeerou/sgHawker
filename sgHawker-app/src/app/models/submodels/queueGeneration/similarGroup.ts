import { BundleOrderItem } from '../bundleOrderItem';
/* eslint-disable no-underscore-dangle */
import { OrderItem } from '../orderItem';
import { FoodItem } from '../../foodItem';
import { Order } from '../../order';
import * as _ from 'lodash';
import { OrderStatusEnum } from '../../enums/order-status-enum.enum';

export class SimilarGroup {
    serial_number: number;
    orders: Map<string, Order>;
    foodItem: FoodItem;
    currentItemQuantity: number;
    orderGroupStatus: OrderStatusEnum;
    private maxItemQuantity: number;

    constructor(
        maxItemQuantity: number,
        serial_number: number,
        foodItem?: FoodItem,
    ) {
        this.serial_number = serial_number;
        this.foodItem = foodItem;
        this.currentItemQuantity = 0;
        this.maxItemQuantity = maxItemQuantity;
        this.orders = new Map();
    }

    canAddOrder(order: Order): boolean {
        let check = false;

        _.forEach(order.individualOrderItems, orderItem => {
            if (orderItem.foodItem._id === this.foodItem._id && this.hasSpace()) {
                check = true;
                return true;
            }
        });

        _.forEach(order.foodBundleOrderItems, bundleOrderItem => {
            _.forEach(bundleOrderItem.bundleItems, orderItem => {
                if (orderItem.foodItem._id === this.foodItem._id && this.hasSpace()) {
                    check = true;
                    return true;
                }
            });
        });

        return check;
    }

    hasSpace(): boolean {
        return this.currentItemQuantity < this.maxItemQuantity;
    }

    addOrder(order: Order) {
        if (this.orders.get(order._id) === undefined) {
            this.orders.set(order._id, order);
        }

        // track the quantity of food items in order
        let itemQuantity = 0;

        _.forEach(order.individualOrderItems, orderItem => {
            if (orderItem.foodItem._id === this.foodItem._id) {
                itemQuantity += orderItem.itemQuantity;
            }
        });

        _.forEach(order.foodBundleOrderItems, bundleOrderItem => {
            let tempCount = 0;
            _.forEach(bundleOrderItem.bundleItems, orderItem => {
                if (orderItem.foodItem._id === this.foodItem._id) {
                    tempCount++;
                }
            });
            tempCount *= bundleOrderItem.bundleQuantity;
            itemQuantity += tempCount;
        });

        this.currentItemQuantity += itemQuantity;
        if (this.currentItemQuantity > this.maxItemQuantity) {
            this.currentItemQuantity = this.maxItemQuantity;
        }
    }

    reduceCurrentItemQuantity(rdcQty) {
        this.currentItemQuantity = this.currentItemQuantity - rdcQty;
    }
};
