/* eslint-disable no-underscore-dangle */
import { WebsocketService } from './../../services/websocket.service';
import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Order } from 'src/app/models/order';
import { User } from 'src/app/models/user';
import { OrderService } from 'src/app/services/order.service';
import { SessionService } from 'src/app/services/session.service';
import { PopoverController } from '@ionic/angular';
import * as _ from 'lodash';
import { Outlet } from 'src/app/models/outlet';
import { OrderDetailModalComponent } from 'src/app/shared/order-detail-modal/order-detail-modal.component';
import { AccountTypeEnum } from 'src/app/models/enums/account-type-enum.enum';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit {
  hawker: User;
  segmentModel = 'completed';

  completedOrders: Order[] = [];
  outlet: Outlet;
  totalEarningsOfTheDay = 0;
  dateOfTheDay = new Date().toLocaleDateString();

  pendingOrders: Order[] = [];

  sortOption: any;

  constructor(
    private sessionService: SessionService,
    public alertController: AlertController,
    private router: Router,
    public popoverController: PopoverController,
    private websocket: WebsocketService,
    public toastController: ToastController,
    private orderService: OrderService,
    private modalController: ModalController
  ) {
    this.sortOption = {
      _id: false,
      orderType: false,
      completedTime: false,
      paymentType: false,
      totalPrice: false
    };
  }

  ngOnInit() { }

  ionViewDidEnter() {
    this.totalEarningsOfTheDay = 0;
    this.hawker = this.sessionService.getCurrentUser();
    this.outlet = this.sessionService.getCurrentOutlet();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.orderService
      .retrieveCompletedOrdersByOutletId(this.outlet._id, today)
      .subscribe((orders) => {
        this.completedOrders = orders;
        this.completedOrders.map(
          (order) => (this.totalEarningsOfTheDay += order.totalPrice)
        );
      });
  }

  viewAllPendingOrders() {
    this.router.navigate(['hawker/orders/view-all-pending-order']);
  }

  async openOrderModal(orderItem){
    const modal = await this.modalController.create({
      component: OrderDetailModalComponent,
      componentProps: {
        order: orderItem,
        userType: AccountTypeEnum.HAWKER
      },
      showBackdrop: true,
      backdropDismiss: false
    });
    return await modal.present();
  }

  sort(index) {
    if (!this.sortOption[index]) {
      this.completedOrders.sort((a,b) => (String(a[index]) > String(b[index])) ? 1 : (String(a[index]) < String(b[index])) ? -1 : 0);
    } else {
      this.completedOrders.sort((a,b) => (String(a[index]) < String(b[index])) ? 1 : (String(a[index]) > String(b[index])) ? -1 : 0);
    }
    this.sortOption[index] = !this.sortOption[index];
  }
}
