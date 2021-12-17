/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { FoodItem } from '../models/foodItem';
import * as _ from 'lodash';
import { FoodBundle } from '../models/submodels/foodBundle';
import { OrderItem } from '../models/submodels/orderItem';
import { Order } from '../models/order';
import { Outlet } from '../models/outlet';
import { BundleOrderItem } from '../models/submodels/bundleOrderItem';
import { OrderService } from './order.service';
import { Router } from '@angular/router';
import { Menu } from '../models/menu';
import { OrderTypeEnum } from '../models/enums/order-type-enum.enum';
import { Address } from '../models/submodels/address';
import { SessionService } from './session.service';
import { PaymentTypeEnum } from '../models/enums/payment-type-enum.enum';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FoodBasketService {

  order: Order;
  loading: boolean;

  activeMenu: Menu;
  totalPayable: number;
  creditedCashback: number;
  debitedCashback: number;

  constructor(
    private orderService: OrderService,
    private sessionService: SessionService,
    private router: Router
  ) {
    this.initBasket();
  }

  getOrder() {
    return this.order;
  }

  clearBasket() {
    this.initBasket();
  }

  getTotalItems() {
    return this.order.foodBundleOrderItems.length + this.order.individualOrderItems.length;
  }

  getTotalPrice() {
    return this.order.totalPrice;
  }

  getFoodItems() {
    return this.order.individualOrderItems;
  }

  getFoodBundles() {
    return this.order.foodBundleOrderItems;
  }

  addOrderItem(orderItem: OrderItem, outlet: Outlet) {
    this.order.outlet = outlet;
    this.order.individualOrderItems.push(orderItem);
    this.order.totalPrice += orderItem.itemSubtotal;

    const orderTotalPrice = this.order.totalPrice;
    this.totalPayable = orderTotalPrice - this.debitedCashback;
  }

  editOrderItem(orderItem: OrderItem, index: number) {
    const originalItemSubtotal = this.order.individualOrderItems[index].itemSubtotal;
    this.order.individualOrderItems[index] = orderItem;
    this.order.totalPrice = this.order.totalPrice - originalItemSubtotal + orderItem.itemSubtotal;

    const orderTotalPrice = this.order.totalPrice;
    this.totalPayable = orderTotalPrice - this.debitedCashback;
  }

  addBundleOrderItem(bundleOrderItem: BundleOrderItem, outlet: Outlet) {
    this.order.outlet = outlet;
    this.order.foodBundleOrderItems.push(bundleOrderItem);
    this.order.totalPrice += bundleOrderItem.bundleSubtotal;

    const orderTotalPrice = this.order.totalPrice;
    this.totalPayable = orderTotalPrice - this.debitedCashback;
  }

  editBundleOrderItem(bundleOrderItem: BundleOrderItem, id: number) {
    const originalSubtotal = this.order.foodBundleOrderItems[id].bundleSubtotal;
    this.order.foodBundleOrderItems[id] = bundleOrderItem;
    this.order.totalPrice = this.order.totalPrice - originalSubtotal + bundleOrderItem.bundleSubtotal;

    const orderTotalPrice = this.order.totalPrice;
    this.totalPayable = orderTotalPrice - this.debitedCashback;
  }

  removeOrderItem(orderItem, index) {
    this.order.totalPrice -= orderItem.itemSubtotal;
    this.order.individualOrderItems.splice(index, 1);

    const orderTotalPrice = this.order.totalPrice;
    this.totalPayable = orderTotalPrice - this.debitedCashback;
  }

  removeBundleOrderItem(bundleOrderItem, index) {
    this.order.totalPrice -= bundleOrderItem.bundleSubtotal;
    this.order.foodBundleOrderItems.splice(index, 1);

    const orderTotalPrice = this.order.totalPrice;
    this.totalPayable = orderTotalPrice - this.debitedCashback;
  }

  computeTotalPayable(availableCashback, selectedPaymentType) {
    const orderTotalPrice = this.order.totalPrice;
    this.totalPayable = orderTotalPrice;

    if (selectedPaymentType === PaymentTypeEnum.DIGITAL) {
      if (availableCashback !== undefined) {
        this.totalPayable = orderTotalPrice - availableCashback.cashbackBalance;
      } else {
        this.totalPayable = orderTotalPrice;
      }
    } else if (selectedPaymentType === PaymentTypeEnum.CASH) {
      this.totalPayable = orderTotalPrice;
    }
    return this.totalPayable;
  }

  computeCreditedCashback(cashbackRate, cashbackIsActive) {
    if (cashbackRate !== 0 && cashbackIsActive === true) {
      this.creditedCashback = cashbackRate * this.totalPayable;
    } else {
      this.creditedCashback = 0;
    }

    return this.creditedCashback;
  }

  setDebitedCashback(availableCashback) {
    if (availableCashback) {
      this.debitedCashback = availableCashback.cashbackBalance;
      return this.debitedCashback;
    }
  }

  getTotalPayable() {
    return this.totalPayable;
  }

  /**
   * error: keeps the order in cart and returns the error
   * success: route to activity page
   */
  checkOut(selectedPaymentType: PaymentTypeEnum, orderType: OrderTypeEnum, pickUpTime?: Date, deliveryAddress?: Address) {
    this.loading = true;
    this.order.totalPrice = this.totalPayable;
    this.order.paymentType = selectedPaymentType;

    if (selectedPaymentType === PaymentTypeEnum.DIGITAL) {
      this.order.creditedCashback = this.creditedCashback;
      this.order.debitedCashback = this.debitedCashback;
    } else if (selectedPaymentType === PaymentTypeEnum.CASH) {
      this.order.creditedCashback = 0;
      this.order.debitedCashback = 0;
    }

    this.order.orderType = orderType;
    if (pickUpTime) {
      this.order.orderPickUpTime = pickUpTime;
    }
    this.order.customer = this.sessionService.getCurrentUser();
    this.orderService.createNewOrder(this.order).subscribe(
      createdOrder => {
        this.initBasket();
        this.router.navigate(['/customer/activity']);
      },
      error => {
        this.loading = false;
        return error;
      }
    );
  }

  hawkerCheckOut(orderType: OrderTypeEnum) {
    this.loading = true;
    this.order.paymentType = PaymentTypeEnum.CASH;
    this.order.orderType = orderType;
    return new Observable(subscriber => {
      this.orderService.createNewGuestHawkerOrder(this.order).subscribe(
        createdOrder => {
          this.initBasket();
          subscriber.next(createdOrder);
        },
        error => {
          this.loading = false;
          subscriber.error(error);
          // return error;
        }
      );
    });
  }

  customerGuestCheckOut(orderType: OrderTypeEnum) {
    this.loading = true;
    this.order.paymentType = PaymentTypeEnum.CASH;
    this.order.orderType = orderType;
    return new Observable(subscriber => {
      this.orderService.createNewGuestCustomerOrder(this.order).subscribe(
        createdOrder => {
          this.initBasket();
          subscriber.next(createdOrder);
          this.sessionService.addGuestOrderId(createdOrder._id);
        },
        error => {
          this.loading = false;
          subscriber.error(error);
          // return error;
        }
      );
    });
  }

  private initBasket() {
    this.order = new Order();
    this.loading = false;
    this.order.individualOrderItems = [];
    this.order.foodBundleOrderItems = [];
    this.order.totalPrice = 0;
    this.creditedCashback = 0;
    this.debitedCashback = 0;
    this.totalPayable = 0;
  }
}
