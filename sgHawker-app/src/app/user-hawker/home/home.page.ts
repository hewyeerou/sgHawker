/* eslint-disable no-underscore-dangle */
import { QueueService } from './../../services/queue.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  PopoverController,
  ToastController,
  ModalController,
} from '@ionic/angular';
import { SessionService } from 'src/app/services/session.service';
import { OrderService } from 'src/app/services/order.service';
import { Outlet } from 'src/app/models/outlet';
import { PopoverComponentComponent } from '../../shared/popover-component/popover-component.component';
import { WebsocketService } from 'src/app/services/websocket.service';
import { Order } from 'src/app/models/order';
import { SimilarGroup } from 'src/app/models/submodels/queueGeneration/similarGroup';
import { QueueInterface } from 'src/app/models/submodels/queueGeneration/queueInterface';
import { OrderStatusEnum } from 'src/app/models/enums/order-status-enum.enum';
import { OrderTypeEnum } from 'src/app/models/enums/order-type-enum.enum';
import { QueueConditionEnum } from 'src/app/models/enums/queue-condition-enum';
import { QueuePreferenceEnum } from 'src/app/models/enums/queue-preference-enum';
import { OrderTimeQueue } from 'src/app/models/submodels/queueGeneration/orderTimeQueue';
import { SimilarItemQueue } from 'src/app/models/submodels/queueGeneration/similarItemQueue';
import * as _ from 'lodash';
import { CashOrderModalPage } from './cash-order-modal/cash-order-modal.page';
import { MenuService } from 'src/app/services/menu.service';
import { Location } from '@angular/common';
import { TakeOrderModalComponent } from './take-order-modal/take-order-modal.component';
import { Menu } from 'src/app/models/menu';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  currentOutlet: Outlet;
  orderQueueArr: QueueInterface[];
  activeMenu: Menu;

  cashOrders: Order[] = [];

  constructor(
    private location: Location,
    public queueService: QueueService,
    private orderService: OrderService,
    private sessionService: SessionService,
    private menuService: MenuService,
    public popoverController: PopoverController,
    public router: Router,
    private websocketService: WebsocketService,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController
  ) {
    this.orderQueueArr = [];
  }

  ngOnInit() {
    this.currentOutlet = this.sessionService.getCurrentOutlet();
  }

  async showPopOver(ev) {
    const popoverItemProps = [];
    if (this.queueService.queueIsActive) {
      popoverItemProps.push(
        {
          label: 'Stop Queue',
          eventHandler: () => this.stopQueue(),
          type: 'STOP'
        }
      );
    }
    popoverItemProps.push(
      {
        label: 'Queue Settings',
        eventHandler: () => {
          this.router.navigate(['hawker/home/queue-setting']);
        },
        type: 'SET'
      }
    );
    this.popoverController
      .create({
        component: PopoverComponentComponent,
        cssClass: 'popover-class',
        componentProps: { items: popoverItemProps },
        translucent: true,
        event: ev,
      })
      .then((popOverElement) => {
        popOverElement.present();
      });
  }

  startQueue() {
    // console.log('[START QUEUE]');
    this.menuService
      .retrieveActiveMenuForOutlet(this.currentOutlet._id)
      .subscribe(
        activeMenu => {
          this.activeMenu = activeMenu;
          this.queueService.queueIsActive = true;
          this.queueService
            .findQueueSettingByOutletId(this.currentOutlet._id)
            .subscribe((queueSetting) => {
              // console.log('[QUEUE SETTING]: ', queueSetting);
              this.queueService.queueSetting = queueSetting;
              this._initQueues();

              this.websocketService.onNewOrderListener().subscribe((order: Order) => {
                if (order.outlet._id !== this.currentOutlet._id) {
                  return;
                }
                // console.log('[NEW ORDER]', order);

                this._addOrderHelper(order);
              });

              this.websocketService
                .onDeleteUnpaidCashOrderListener()
                .subscribe((deletedOrder) => {
                  const found = this.cashOrders.find(
                    (order) => deletedOrder._id === order._id
                  );
                  if (found) {
                    this.toastHelper(
                      'Order #' +
                      deletedOrder._id.substring(deletedOrder._id.length - 5) +
                      ' has been deleted due to idle payment'
                    );
                    this.cashOrders.splice(this.cashOrders.indexOf(found), 1);
                  }
                });

              this.websocketService
                .onNewUnpaidCashOrderListener()
                .subscribe((newOrder) => {
                  const found = this.cashOrders.find(
                    (order) => newOrder._id === order._id
                  );
                  if (!found && newOrder.outlet._id === this.currentOutlet._id) {
                    this.toastHelper(
                      'New Cash Order #' +
                      newOrder._id.substring(newOrder._id.length - 5)
                    );
                    this.cashOrders.push(newOrder);
                  }
                });

              this.websocketService
                .onUpdateOrderStatusListener()
                .subscribe((updatedOrder) => {
                  const found = this.cashOrders.find(
                    (order) => updatedOrder._id === order._id
                  );
                  if (found) {
                    this.cashOrders.splice(this.cashOrders.indexOf(found), 1);
                  }
                });
            });
        }, error => {
          this.alertController.create({
            header: 'Oops...Something went wrong',
            message: 'Unable to load menu: ' + error,
            buttons: [
              {
                text: 'Go Back',
                role: 'dismiss',
              }
            ]
          }).then(alertElement => {
            alertElement.present();
          });
        })
  }

  stopQueue() {
    // console.log('[STOP QUEUE]');

    this.orderService.findAllInProgressOrdersByOutletId(this.currentOutlet._id).subscribe(
      orderArr => {
        if (orderArr?.length > 0) {
          this.alertController
            .create({
              header:
                'You still have ' +
                orderArr.length +
                ' pending orders not yet completed!',
              message:
                'Are you sure you want to stop the queue? This will cancel all pending orders.',
              buttons: [
                {
                  text: 'Cancel',
                  role: 'cancel',
                },
                {
                  text: 'Confirm',
                  handler: () => {
                    this.orderService
                      .cancelAllInProgressOrdersByOutletId(
                        this.currentOutlet._id
                      )
                      .subscribe(
                        (success) => {
                          this.queueService.queueIsActive = false;
                          this.orderQueueArr = [];
                        },
                        (error) => {
                          this.toastController
                            .create({
                              header:
                                'Unable to stop queue due to failure cancelling orders',
                              message: 'Please try again',
                              duration: 3000,
                            })
                            .then((x) => x.present());
                        }
                      );
                  },
                },
              ],
            })
            .then((x) => x.present());
        } else {
          this.queueService.queueIsActive = false;
          this.orderQueueArr = [];
        }
      });
  }

  async presentTakeOrderModal() {
    const modal = await this.modalController.create({
      component: TakeOrderModalComponent,
      cssClass: 'modal-fullscreen',
      componentProps: {
        outlet: this.currentOutlet,
      },
    });
    return await modal.present();
  }

  async presentCashOrderModal() {
    const modal = await this.modalController.create({
      component: CashOrderModalPage,
      cssClass: '',
      componentProps: {
        cashOrders: this.cashOrders,
      },
    });
    return await modal.present();
  }

  async toastHelper(toastMessage: string) {
    const toast = this.toastController.create({
      message: toastMessage,
      duration: 3000,
      position: 'top',
    });
    (await toast).present();
  }

  private _addOrderHelper(order) {
    if (this.orderQueueArr.length > 1) {
      this.orderQueueArr.forEach((queue) => {
        if (
          queue.getQueueCondition() === QueueConditionEnum.BY_DELIVERY &&
          order.orderType === OrderTypeEnum.DELIVERY
        ) {
          queue.addOrderToQueue(order);
        } else if (
          queue.getQueueCondition() === QueueConditionEnum.BY_NOT_DELIVERY &&
          order.orderType !== OrderTypeEnum.DELIVERY
        ) {
          queue.addOrderToQueue(order);
        } else if (
          queue.getQueueCondition() === QueueConditionEnum.BY_DINE_IN &&
          order.orderType === OrderTypeEnum.DINE_IN
        ) {
          queue.addOrderToQueue(order);
        } else if (
          queue.getQueueCondition() === QueueConditionEnum.BY_NOT_DINE_IN &&
          order.orderType !== OrderTypeEnum.DINE_IN
        ) {
          queue.addOrderToQueue(order);
        }
      });
    } else {
      this.orderQueueArr[0].addOrderToQueue(order);
    }
  }

  private _initQueues() {
    if (
      this.queueService.queueSetting.defaultQueuePreference ===
      QueuePreferenceEnum.ORDER_TIME
    ) {
      // console.log('[QUEUE TYPE]: ORDER_TIME');

      if (this.queueService.queueSetting?.queueByOrderTimeSetting.length > 0) {
        this.queueService.queueSetting?.queueByOrderTimeSetting.forEach(
          (queueCondition) => {
            // console.log('[QUEUE CONDITION]: ', queueCondition.queueCondition);

            this.orderQueueArr.push(
              new OrderTimeQueue(queueCondition.queueCondition)
            );
          }
        );
      } else {
        this.orderQueueArr.push(new OrderTimeQueue());
      }
    } else {
      // console.log('[QUEUE TYPE]: SIMILAR_GROUP');

      if (
        this.queueService.queueSetting?.queueBySimilarOrderSetting
          ?.queueSegregationCondition?.length > 0
      ) {
        this.queueService.queueSetting?.queueBySimilarOrderSetting.queueSegregationCondition.forEach(
          (queueCondition) => {
            // console.log('[QUEUE CONDITION]: ', queueCondition.queueCondition);

            this.orderQueueArr.push(
              new SimilarItemQueue(
                this.queueService.queueSetting,
                queueCondition.queueCondition
              )
            );
          }
        );
      } else {
        this.orderQueueArr.push(
          new SimilarItemQueue(this.queueService.queueSetting)
        );
      }
    }
  }
}
