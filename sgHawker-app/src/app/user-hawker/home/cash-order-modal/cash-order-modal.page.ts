/* eslint-disable no-underscore-dangle */
import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { OrderStatusEnum } from 'src/app/models/enums/order-status-enum.enum';
import { OrderTypeEnum } from 'src/app/models/enums/order-type-enum.enum';
import { QueueConditionEnum } from 'src/app/models/enums/queue-condition-enum';
import { Order } from 'src/app/models/order';
import { QueueInterface } from 'src/app/models/submodels/queueGeneration/queueInterface';
import { OrderService } from 'src/app/services/order.service';
@Component({
  selector: 'app-cash-order-modal',
  templateUrl: './cash-order-modal.page.html',
  styleUrls: ['./cash-order-modal.page.scss'],
})
export class CashOrderModalPage implements OnInit {
  @Input() cashOrders: Order[] = [];

  title = 'Sort By&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;';
  searchVal = '';
  sort = 'Latest';
  constructor(
    private orderService: OrderService,
    public toastController: ToastController,
    public modalController: ModalController
  ) { }

  ngOnInit() { }

  markCashOrderPaidCB = (order: Order) => {
    this.orderService
      .updateOrderStatus(order, OrderStatusEnum.PAID)
      .subscribe(
        async (success) => {
          const toast = await this.toastController.create({
            message:
              'Order #' +
              success._id.substring(success._id.length - 5) +
              ' has been marked as paid successfully',
            duration: 2000,
          });
          toast.present();
        },
        async (error) => {
          const toast = await this.toastController.create({
            message: 'Unable to mark paid:' + error,
            duration: 2000,
          });
          toast.present();
        }
      );
  };

  get cashOrdersToDisplay() {
    let cashOrdersDisplay = [...this.cashOrders];
    if (this.sort === 'A-Z') {
      cashOrdersDisplay.sort(this.sortByAZ);
    } else if (this.sort === 'Latest') {
      cashOrdersDisplay.sort(this.sortByLatest);
    } else if (this.sort === 'OrderA-Z') {
      cashOrdersDisplay.sort(this.sortByOrderAZ);
    } else if (this.sort === 'OrderZ-A') {
      cashOrdersDisplay.sort(this.sortByOrderZA);
    }

    if (this.searchVal && this.searchVal.trim() !== '') {
      cashOrdersDisplay = cashOrdersDisplay.filter((order: any) => {
        const idFound =
          order._id
            .toLowerCase()
            .substring(order._id.length - 5)
            .indexOf(this.searchVal.toLowerCase()) > -1;
        const nameFound =
          order.customer.name
            .toLowerCase()
            .indexOf(this.searchVal.toLowerCase()) > -1;
        return idFound || nameFound;
      });
    }

    return cashOrdersDisplay;
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  sortByAZ = (a: Order, b: Order) =>
    a.customer.name.localeCompare(b.customer.name);

  sortByLatest = (a: Order, b: Order) =>
    new Date(b.orderCreationTime).getTime() -
    new Date(a.orderCreationTime).getTime();

  sortByOrderAZ = (a: Order, b: Order) =>
    a._id
      .substring(a._id.length - 5)
      .localeCompare(b._id.substring(b._id.length - 5));

  sortByOrderZA = (a: Order, b: Order) =>
    b._id
      .substring(b._id.length - 5)
      .localeCompare(a._id.substring(a._id.length - 5));
}
