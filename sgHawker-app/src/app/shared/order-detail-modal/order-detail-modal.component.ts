/* eslint-disable guard-for-in */
/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
import { OrderService } from './../../services/order.service';
import { PaymentTypeEnum } from './../../models/enums/payment-type-enum.enum';
import { WebsocketService } from './../../services/websocket.service';
import {
  ModalController,
  ToastController,
  AlertController,
} from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';
import { Order } from 'src/app/models/order';
import { Outlet } from 'src/app/models/outlet';
import { Menu } from 'src/app/models/menu';
import { FoodItem } from 'src/app/models/foodItem';
import { FoodBundle } from 'src/app/models/submodels/foodBundle';
import { OrderStatusEnum } from 'src/app/models/enums/order-status-enum.enum';
import * as moment from 'moment';
import * as _ from 'lodash';
import { AccountTypeEnum } from 'src/app/models/enums/account-type-enum.enum';
import { CreateReportModalComponent } from '../create-report-modal/create-report-modal.component';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { MenuService } from './../../services/menu.service';
import { SessionService } from './../../services/session.service';
import { FoodBasketService } from './../../services/food-basket.service';
import { OutletService } from './../../services/outlet.service';
import { FoodBundleDetailModalComponent } from './../../shared/cartCustomization/food-bundle-detail-modal/food-bundle-detail-modal.component';
import { FoodItemCustomizeModalComponent } from './../../shared/cartCustomization/food-item-customize-modal/food-item-customize-modal.component';
import { ChangeOrderTypeComponent } from '../change-order-type/change-order-type.component';

@Component({
  selector: 'app-order-detail-modal',
  templateUrl: './order-detail-modal.component.html',
  styleUrls: ['./order-detail-modal.component.scss'],
})
export class OrderDetailModalComponent implements OnInit {
  @Input() order: Order;
  @Input() userType: AccountTypeEnum;
  tempOrder: Order;
  user: User;
  activeFoodItems: FoodItem[];
  activeFoodBundles: FoodBundle[];

  canReport: boolean;
  numberOfHoursAfterOrder: number;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private orderService: OrderService,
    private websocket: WebsocketService,
    private sessionService: SessionService,
    private menuService: MenuService,
    private outletService: OutletService,
    private foodBasketService: FoodBasketService,
    private router: Router
  ) { }

  ngOnInit() {
    this.numberOfHoursAfterOrder = Math.abs(moment.duration(moment(this.order.completedTime).diff(moment(new Date()))).asHours());
    this.canReport = (this.order.orderStatus === 'COMPLETED' ||
      this.order.orderStatus === 'CANCELLED') &&
      this.numberOfHoursAfterOrder < 120; //5 days

    this.websocket.onDeleteUnpaidCashOrderListener().subscribe(deletedOrder => {
      if (deletedOrder._id === this.order._id) {
        this.alertController.create({
          header: 'Current order is deleted!',
          message: 'This order has been deleted due to failure of making payment within 15 minutes',
          buttons: [
            {
              text: 'Go back',
              handler: () => this.closeModal()
            }
          ]
        });
      }
    });

    this.websocket.onCancelOrderListener().subscribe((cancelledOrder) => {
      if (cancelledOrder._id === this.order._id) {
        this.order = cancelledOrder;
      }
    });

    this.websocket.onUpdateOrderStatusListener().subscribe((updatedOrder) => {
      if (updatedOrder._id === this.order._id) {
        this.order = updatedOrder;
      }
    });
  }

  closeModal() {
    this.modalController.dismiss();
  }

  canChangeOrderType(): boolean {
    if (this.userType === AccountTypeEnum.HAWKER) {
      return false;
    }
    const limitTime = moment().subtract(2, 'minutes');
    if (moment(this.order.orderCreationTime).isBefore(limitTime)) {
      return false;
    }
    if (this.order.orderStatus !== OrderStatusEnum.UNPAID
      && this.order.orderStatus !== OrderStatusEnum.PAID) {
      return false;
    }
    return true;
  }

  changeOrderType(order: Order) {
    this.modalController
      .create({
        component: ChangeOrderTypeComponent,
        componentProps: {
          order,
        },
      })
      .then((x) => x.present());
  }

  canCancelOrder(): boolean {
    if (this.userType === AccountTypeEnum.HAWKER) {
      return false;
    }

    if (this.order.orderStatus === OrderStatusEnum.CANCELLED) {
      return false;
    }
    const limitTime = moment().subtract(15, 'minutes');
    if (moment(this.order.orderCreationTime).isBefore(limitTime)) {
      return false;
    }
    if (this.order.paymentType === PaymentTypeEnum.CASH && this.order.orderStatus !== OrderStatusEnum.UNPAID) {
      return false;
    }
    if (
      this.order.orderStatus !== OrderStatusEnum.UNPAID &&
      this.order.orderStatus !== OrderStatusEnum.PAID &&
      this.order.orderStatus !== OrderStatusEnum.RECEIVED
    ) {
      return false;
    }
    return true;
  }

  cancelOrder() {
    this.orderService.cancelOrder(this.order).subscribe((cancelledOrder) => {
      this.order = cancelledOrder;
    });
  }

  confirmOrder() {
    this.orderService
      .updateOrderStatus(this.order, OrderStatusEnum.COMPLETED)
      .subscribe((completedOrder) => {
        this.order = completedOrder;
      });
  }

  repeatOrder() {
    this.user = this.sessionService.getCurrentUser();
    const outletId = this.order.outlet._id;
    if (!this.isActive()) {
      this.showAlert('Sorry! Outlet is Closed!');
    } else {
      this.menuService.retrieveActiveMenuForOutlet(outletId).subscribe(
        (activeMenu) => {
          this.activeFoodItems = activeMenu.foodItems;
          this.activeFoodBundles = activeMenu.foodBundles;
          this.foodBasketService.activeMenu = activeMenu;
          //check if the individual order food items are active
          for (const item in this.order.individualOrderItems) {
            let counter = 0;
            for (const num in this.activeFoodItems) {
              if (
                this.activeFoodItems[num]._id ===
                this.order.individualOrderItems[item].foodItem._id
              ) {
                this.showFoodItemModal(
                  this.order.individualOrderItems[item].foodItem
                );
              } else {
                counter += 1;
                if (counter === this.activeFoodItems.length) {
                  this.showAlert(
                    'Food Item ' +
                    this.order.individualOrderItems[item].foodItem.itemName +
                    ' is not available!'
                  );
                }
              }
            }
          }

          // check if the order food bundle items are active
          for (const foodBundle in this.order.foodBundleOrderItems) {
            let counter = 0;
            //check if id can be found (active one is id, order one is bundle id)
            for (const num in this.activeFoodBundles) {
              if (
                this.activeFoodBundles[num]._id ===
                this.order.foodBundleOrderItems[foodBundle].bundle_id
              ) {
                //this.showAlert('Food Bundle in Order not Available!');
                this.showFoodBundleModal(this.activeFoodBundles[num]);
              } else {
                counter += 1;
                if (counter === this.activeFoodBundles.length) {
                  this.showAlert(
                    'Food Bundle ' +
                    this.order.foodBundleOrderItems[foodBundle].bundleName +
                    ' is not available!'
                  );
                }
              }
            }
          }
        },
        (error) => {
          this.alertController
            .create({
              header: 'Oops! Something Went Wrong!',
              message: error,
              buttons: [
                {
                  text: 'Go Back',
                  role: 'OK',
                  handler: () => {
                    this.router.navigate(['/customer/home']);
                  },
                },
              ],
            })
            .then((alertElement) => {
              alertElement.present();
            });
        }
      );
    }
  }

  isActive(): boolean {
    return this.outletService.checkOutletIsActive(this.order.outlet);
  }

  navigateToCart() {
    this.router.navigate(['/customer/activity/cart']);
  }

  async showAlert(msg) {
    const alert = await this.alertController.create({
      message: msg,
      buttons: [
        {
          text: 'Okay',
          role: 'cancel',
        },
      ],
    });
    await alert.present();
  }

  async showFoodBundleModal(foodBundle: FoodBundle) {
    for (const item of foodBundle.foodItems) {
      if (item.itemAvailability === false) {
        this.showAlert('Food bundle is not available!');
        return;
      }
    }

    const modal = await this.modalController.create({
      component: FoodBundleDetailModalComponent,
      componentProps: {
        foodBundle: _.cloneDeep(foodBundle),
        currentUser: this.user,
      },
    });

    await modal.present();
  }

  async showFoodItemModal(foodItem: FoodItem) {
    if (foodItem.itemAvailability === false) {
      this.showAlert('Food item is not available!');
      return;
    }

    const modal = await this.modalController.create({
      component: FoodItemCustomizeModalComponent,
      componentProps: {
        foodItem: _.cloneDeep(foodItem),
        currentUser: this.user,
        // 'outletIsActive': this.outletIsActive
      },
    });

    await modal.present();
  }

  getTotalOrderItems(): number {
    const foodBundleItems = this.order.foodBundleOrderItems
      ? this.order.foodBundleOrderItems.length
      : 0;
    const indiOrderItems = this.order.individualOrderItems
      ? this.order.individualOrderItems.length
      : 0;
    return foodBundleItems + indiOrderItems;
  }

  openReportModal() {
    this.modalController.create({
      component: CreateReportModalComponent,
      componentProps: {
        order: _.cloneDeep(this.order),
        userType: this.userType,
        numberOfHoursAfterOrder: this.numberOfHoursAfterOrder,
      }
    }).then(x => x.present());
  }

}
