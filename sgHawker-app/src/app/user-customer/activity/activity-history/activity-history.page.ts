/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable no-underscore-dangle */
import { OrderService } from '../../../services/order.service';
import { Component, OnInit } from '@angular/core';
import { Order } from '../../../models/order';
import * as _ from 'lodash';
import { SessionService } from '../../../services/session.service';
import { AlertController, ModalController } from '@ionic/angular';
import { User } from '../../../models/user';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { OrderDetailModalComponent } from 'src/app/shared/order-detail-modal/order-detail-modal.component';
import * as moment from 'moment';
import { AccountTypeEnum } from 'src/app/models/enums/account-type-enum.enum';
import { isWithinInterval } from 'date-fns';

@Component({
  selector: 'app-activity-history',
  templateUrl: './activity-history.page.html',
  styleUrls: ['./activity-history.page.scss'],
})
export class ActivityHistoryPage {

  completedOrders: Order[] = [];
  tempOrders: Order[] = [];
  filteredDateOrders: Order[];
  user: User;
  segmentModel: string;
  tempModel: string;
  allOutlets: string[];
  filteredOutlets: string[];
  tempOutlets: string[];
  selectedOutlet: string[];
  filterStartDate;
  filterEndDate;

  constructor(
    private orderService: OrderService,
    private sessionService: SessionService,
    private alertController: AlertController,
    private location: Location,
    private router: Router,
    private modalController: ModalController
  ) {
  }

  ionViewWillEnter() {
    this.user = this.sessionService.getCurrentUser();
    const storage = new Set();
    this.orderService.findCompletedOrdersByCustomerId(this.user._id).subscribe(
      completedOrders => {
        this.completedOrders = completedOrders.sort(
          (orderA: Order, orderB: Order) => moment(orderA.orderCreationTime) > moment(orderB.orderCreationTime) ? -1 : 1);
        _.forEach(this.completedOrders, order => {
          storage.add(order.outlet.outletName);
        });
        this.allOutlets = <string[]>Array.from(storage);
        this.filteredOutlets = this.allOutlets;
        this.tempOutlets = [];
        this.tempOrders = this.completedOrders;
        this.filteredDateOrders = this.completedOrders;
      },
      error => {
        this.alertController.create({
          header: 'Something went wrong!',
          message: 'Unable to retrieve orders',
          buttons: [
            {
              text: 'Go back',
              handler: () => {
                this.location.back();
              }
            }
          ]
        }).then(x => x.present());
      });
    if (this.tempModel !== undefined) {
      this.segmentModel = this.tempModel;
    } else {
      this.segmentModel = 'orders';
    }
  }

  showOrderDetails(order: Order) {
    this.modalController.create({
      component: OrderDetailModalComponent,
      componentProps: {
        order,
        userType: AccountTypeEnum.CUSTOMER,
        user: this.user,
      }
    }).then(x => x.present());
  }

  redirectToOngoingOrders() {
    this.router.navigate(['customer/activity']);
  }

  filterOutlet() {
    if (!this.selectedOutlet || this.selectedOutlet.length <= 0) {
      this.completedOrders = this.tempOrders;
      return;
    }
    this.completedOrders = this.filterOutletName(this.tempOrders);
  }

  private filterOutletName(source: Order[]) {
    if (!this.selectedOutlet || this.selectedOutlet.length === 0) {
      return source;
    }
    return _.filter(source, order => {
      let name = false;
      if (this.selectedOutlet.includes(order.outlet.outletName)) {

        name = true;
      }
      return name;
    });
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  filterResults() {
    if (this.filterStartDate !== undefined && this.filterEndDate !== undefined) {
      const startDate = new Date(this.filterStartDate).setHours(0, 0, 0, 0);
      const endDate = new Date(this.filterEndDate).setHours(24, 0, 0, 0);
      if (endDate < startDate) {
        this.presentAlert('Error', 'Please select a later end date');
      } else {
        //const lastDate = endDate.setDate(endDate.getDate()+1);

        this.completedOrders = this.filteredDateOrders.filter(order => {
          return isWithinInterval(new Date(order.orderCreationTime), { start: startDate, end: endDate });
        });
        this.tempOutlets = [];
        for (let i = 0; i < this.completedOrders.length; i++) {
          this.tempOutlets.push(this.completedOrders[i].outlet.outletName);
        }
        this.filteredOutlets = this.tempOutlets;
      }
    }
  }

  resetResults() {
    this.completedOrders = this.filteredDateOrders;
    this.filterStartDate = undefined;
    this.filterEndDate = undefined;
    this.filteredOutlets = this.allOutlets;
  }

  noOutletAlert() {
    this.presentAlert('Oops', 'There are no outlets!');
  }

  async presentAlert(header, message) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
        },
      ],
    });
    await alert.present();
  }
}
