/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable max-len */
/* eslint-disable arrow-body-style */
/* eslint-disable no-underscore-dangle */
import { AfterViewInit, Component, ElementRef, Input, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AlertController, GestureController, IonSlide, IonSlides, ModalController, Platform, ToastController } from '@ionic/angular';
import { OrderGroupItemStatusEnum } from 'src/app/models/enums/order-group-item-status-enum';
import { OrderStatusEnum } from 'src/app/models/enums/order-status-enum.enum';
import { Order } from 'src/app/models/order';
import { SessionService } from 'src/app/services/session.service';
import * as _ from 'lodash';
import { QueueInterface } from 'src/app/models/submodels/queueGeneration/queueInterface';
import { QueueSetting } from 'src/app/models/queueSetting';
import { SimilarGroup } from 'src/app/models/submodels/queueGeneration/similarGroup';
import { OrderService } from 'src/app/services/order.service';
import { QueuePreferenceEnum } from 'src/app/models/enums/queue-preference-enum';
import { OrderDetailModalComponent } from 'src/app/shared/order-detail-modal/order-detail-modal.component';
import { AccountTypeEnum } from 'src/app/models/enums/account-type-enum.enum';
import { FoodItemService } from 'src/app/services/food-item.service';
import { PeekQueueModalComponent } from './peek-queue-modal/peek-queue-modal.component';
import { FoodBundleItem } from 'src/app/models/submodels/foodBundleItem';

@Component({
  selector: 'order-queue-card',
  templateUrl: './order-queue-card.component.html',
  styleUrls: ['./order-queue-card.component.scss'],
})
export class OrderQueueCardComponent implements AfterViewInit {
  @Input() queue: QueueInterface;
  @Input() queueSetting: QueueSetting;

  @ViewChildren(IonSlide, { read: ElementRef }) cards: QueryList<ElementRef>;
  @ViewChild('orderSlide') private slider: IonSlides;

  currentFocusedOrder: Order | SimilarGroup;
  endOfQueue = true;
  exist = false;
  notCancelledOrder: Order;
  outletId: string;

  activeIndex = 0;
  slideOpts = {
    direction: 'horizontal',
    initialSlide: 0,
    speed: 400,
    slidesPerView: 5,
    spaceBetween: 5,
    centeredSlides: true
  };

  constructor(
    private sessionService: SessionService,
    private alertController: AlertController,
    private gestureCtrl: GestureController,
    private plt: Platform,
    private orderService: OrderService,
    private modalController: ModalController,
    private toastController: ToastController,
    private foodItemService: FoodItemService
  ) {
    this.outletId = this.sessionService.getCurrentOutlet()._id;
  }

  ngAfterViewInit() { }

  //swipe left; swipe to next order
  loadNext() {
    //if there is an order in the queue
    if (this.currentFocusedOrder !== undefined) {
      if (this.queue.getQueueType() === QueuePreferenceEnum.ORDER_TIME) {
        this.markOrderAsComplete();
      } else if (this.queue.getQueueType() === QueuePreferenceEnum.SIMILAR_ITEM) {
        this.markGroupOrderAsComplete();
      }
    }
    // slide to current focused order
    const active = this.queue.peekPreviousCompletedGroups().length + 1;

    this.slider.slideTo(active, 0, false);
    this.activeIndex = active;
    // if reached the end of queue card, set endOfQueue to true
    this.slider.isEnd().then((isTrue) => {
      this.endOfQueue = isTrue;
      if (this.queueSetting.defaultQueuePreference === QueuePreferenceEnum.SIMILAR_ITEM) {
        this.activeIndex -= 1;
      }
    });
  }

  // swipe right; swipe to previous order
  loadPrev() {
    this.slider.getActiveIndex().then(index => {
      if (!this.canSlideTo(index)) {
        this.slideToActive();
      } else {
        this.presentAlert(index);
      }
    });
  }

  async presentAlert(index) {
    const alert = await this.alertController.create({
      header: 'Are you sure you want to go back to the previous order?',
      message: 'This will set the order status to `PREPARING`',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',

          handler: () => {
            //slide back to initial order
            this.slideToActive();
          }
        }, {
          text: 'Okay',
          handler: () => {
            //slide to previous order
            this.slider.slideTo(index, 0, false);
            this.activeIndex = index;
            this.cards.toArray()[index].nativeElement.style.transition = '1s ease-out';
            this.cards.toArray()[index].nativeElement.style.opacity = 1;
            if (this.queue.getQueueType() === QueuePreferenceEnum.ORDER_TIME) {
              this.markOrderAsIncompleted();
            } else if (this.queue.getQueueType() === QueuePreferenceEnum.SIMILAR_ITEM) {
              this.markGroupOrderAsIncompleted();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  canSlideTo(index) {
    if (this.activeIndex - index === 1 || this.activeIndex - index === -1) {
      return true;
    } else {
      this.presentToast('You can only go back to one order one at a time.');
      return false;
    }
  }

  slideToActive() {
    this.slider.slideTo(this.activeIndex, 0, false);
  }

  //Check if current order exists
  checkCurrentOrderExist() {
    if (this.currentFocusedOrder === undefined) {
      if (this.queue.viewNextGroup() !== undefined) { //If there's item in the queue
        this.activeIndex += 1;
        this.currentFocusedOrder = this.queue.getNextGroup(); //Assign to focused
        if (this.queue.getQueueType() === QueuePreferenceEnum.ORDER_TIME) {
          this.findLatestOrderNotCancelled(this.currentFocusedOrder as Order); // Change status to prepare
        } else if (this.queue.getQueueType() === QueuePreferenceEnum.SIMILAR_ITEM) {
          this.prepareNextGroupOrder(this.currentFocusedOrder as SimilarGroup); // Change group status to prepare
        }
        return true; // True theres focused order
      } else {
        return false; // no focused order
      }
    } else {
      return true;
    }
  }

  findOrderQuantityForOrderInSimilarGroup(order, foodItemName, grpMaxQty) {
    let totalQuantity = 0;
    // let orderCast = order as Order;
    for (const o of order.individualOrderItems) {
      if (o.foodItem.itemName === foodItemName) {
        totalQuantity += o.itemQuantity;
      }
    }

    for (const o of order.foodBundleOrderItems) {
      for (const b of o.bundleItems) {
        if (b.foodItem.itemName === foodItemName && totalQuantity < grpMaxQty) {
          totalQuantity += 1;
        }
      }
    }
    return totalQuantity;
  }

  getCustomizationOptionsForOrderInSimilarGroup(order, foodItemName) {
    let customizationOptions = '';

    for (const o of order.individualOrderItems) {
      if (o.foodItem.itemName === foodItemName) {
        for (const co of o.selectedCustomizations) {
          customizationOptions += ' ' + co.selectedOption.optionName + ',';
        }
      }
    }

    for (const o of order.foodBundleOrderItems) {
      for (const b of o.bundleItems) {
        if (b.foodItem.itemName === foodItemName && o.selectedCustomizations !== undefined) {
          for (const co of o.selectedCustomizations) {
            customizationOptions += ' ' + co.selectedOption.optionName + ',';
          }
        }
      }
    }
    return customizationOptions;
  }

  async openOrderModal(orderItem) {
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

  async openPeekModal() {
    const modal = await this.modalController.create({
      component: PeekQueueModalComponent,
      componentProps: {
        orders: this.queue.peekPreviousCompletedGroups(),
        userType: AccountTypeEnum.HAWKER,
        queuePreference: this.queueSetting.defaultQueuePreference,
      },
      showBackdrop: true,
      backdropDismiss: false
    });
    return await modal.present();
  }

  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

  //Prepare order
  prepareNextOrder(order) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.orderService.updateOrderStatus(order, OrderStatusEnum.PREPARING).subscribe(
      updatedOrder => {
        this.currentFocusedOrder = updatedOrder;
      }
    ), (error) => {
    };
  }

  prepareNextGroupOrder(o) {
    const status = OrderStatusEnum.PREPARING;

    if (o.orders.size > 0) {
      const currentOrdersArr = [];
      o.orders.forEach((value, key) => {
        currentOrdersArr.push(value);
      });

      this.orderService.findOrdersById(currentOrdersArr).subscribe(
        retrievedOrders => {
          for (const rOrder of retrievedOrders) {
            if (rOrder.orderStatus === OrderStatusEnum.CANCELLED ||
              rOrder.orderStatus === OrderStatusEnum.REFUNDING ||
              rOrder.orderStatus === OrderStatusEnum.REFUNDED) {
              // remove order from food item group
              o.orders.delete(rOrder._id);

              // add up all the item quantity of the food item that is in the cancelled order
              let totalReduceQty = 0;
              for (const orderItem of rOrder.individualOrderItems) {
                if (orderItem.foodItem._id === o.foodItem._id) {
                  totalReduceQty += orderItem.itemQuantity;
                }
              }
              // reduce the item quantity from the food item group
              o.reduceCurrentItemQuantity(totalReduceQty);

              // if item qty of group becomes 0, proceed to next order
              if (o.currentItemQuantity === 0) {
                o = this.queue.getNextGroup() as SimilarGroup;
                // if reaches the end of queue
                if (o === undefined) {
                  this.currentFocusedOrder = undefined;
                  return;
                }
                this.currentFocusedOrder = o;
                this.prepareNextGroupOrder(this.currentFocusedOrder);
              }

            } else {
              this.currentFocusedOrder = o;
              // this.prepareNextGroupOrder(this.currentFocusedOrder);

              // FOOD ITEM
              // update all the food items status in all orders to PREPARING
              this.orderService.updateOrderFoodItemStatusForMultipleOrders(currentOrdersArr, o.foodItem._id, OrderGroupItemStatusEnum.PREPARING).subscribe(
                updatedOrders => {
                  // console.log('foodItems: preparing: success');
                  // once a food item in each order is set to PREPARING => order status in db will be set to PREPARING
                  for (const order of updatedOrders) {
                    if (order.orderStatus !== OrderStatusEnum.PREPARING) {
                      this.orderService.updateOrderStatus(order, status).subscribe(
                        updatedOrder => {
                          // console.log('order: preparing: success');
                          this.currentFocusedOrder = o as SimilarGroup;
                          this.currentFocusedOrder.orderGroupStatus = OrderStatusEnum.PREPARING;
                        },
                        error => {
                          console.log('order: preparing: error', error);
                        }
                      );
                    }
                  }
                },
                error => {
                  console.error('fooditem: preparing: error ', error);
                }
              );

              // FOOD BUNDLE
              for (const order of currentOrdersArr) {
                // if (order.foodBundleOrderItems !== undefined || order.foodBundleOrderItems.length > 0) {
                if (order.foodBundleOrderItems.length > 0) {
                  for (const foodBundle of order.foodBundleOrderItems) {
                    // update the food item status in each food bundle in all orders
                    this.orderService.updateOrderBundleItemStatusForMultipleOrders(
                      currentOrdersArr, foodBundle.bundle_id, o.foodItem._id, OrderGroupItemStatusEnum.PREPARING
                    ).subscribe(
                      updatedOrders => {
                        // console.log('foodBundle: preparing: success');
                        // once a food item in each order is set to PREPARING => order status in db will be set to PREPARING
                        if (order.orderStatus !== OrderStatusEnum.PREPARING) {
                          this.orderService.updateOrderStatus(order, status).subscribe(
                            updatedOrder => {
                              // console.log('order: preparing: success');
                              this.currentFocusedOrder = o as SimilarGroup;
                              this.currentFocusedOrder.orderGroupStatus = OrderStatusEnum.PREPARING;
                            },
                            error => {
                              // console.error('order: preparing: error', error);
                            }
                          );
                        }
                      },
                      error => {
                        console.error('foodBundle: preparing: error ', error);
                      }
                    );
                  }
                }
              }
            }
          }
        }
      );
    }
  }

  //Change order status to READY
  markOrderAsComplete() {
    this.orderService.updateOrderStatus(this.currentFocusedOrder as Order, OrderStatusEnum.READY).subscribe(
      completedOrder => {
        this.queue.addGroupToPreviousCompletedGroups(completedOrder); //Add completed to PrevGroup
        this.currentFocusedOrder = this.queue.getNextGroup(); //Get the nextGroup assign to focused
        if (this.currentFocusedOrder !== undefined) {
          this.findLatestOrderNotCancelled(this.currentFocusedOrder as Order);
        }
      }
    );
  }

  markGroupOrderAsComplete() {
    const currentOrder = this.currentFocusedOrder as SimilarGroup;
    const status = OrderStatusEnum.READY;

    if (currentOrder.orders.size > 0) {
      // FOOD ITEM
      // update food item status in all orders
      const currentOrdersArr = [];
      currentOrder.orders.forEach((value, key) => {
        currentOrdersArr.push(value);
      });
      this.orderService.updateOrderFoodItemStatusForMultipleOrders(currentOrdersArr, currentOrder.foodItem._id, OrderGroupItemStatusEnum.READY).subscribe(
        updatedOrders => {
          // console.log('[fooditem ready]: success');
          for (const order of updatedOrders) {
            if (order.orderStatus !== OrderStatusEnum.READY) {
              this.checkIfFoodItemsAndBundlesAreCompleted(order, status, currentOrder);
            }
          }
        },
        error => {
          console.error('[fooditem ready]: error ', error);
        }
      );

      // FOOD BUNDLE
      // update food bundle status in all orders
      for (const order of currentOrdersArr) {
        // check if there is food bundle in order
        if (order.foodBundleOrderItems.length > 0) {
          for (const foodBundle of order.foodBundleOrderItems) {
            this.orderService.updateOrderBundleItemStatusForMultipleOrders(currentOrdersArr, foodBundle.bundle_id, currentOrder.foodItem._id, OrderGroupItemStatusEnum.READY).subscribe(
              updatedOrders => {
                // console.log('[foodbundle ready]: success');
                for (const updatedOrder of updatedOrders) {
                  if (updatedOrder.orderStatus !== OrderStatusEnum.READY) {
                    this.checkIfFoodItemsAndBundlesAreCompleted(updatedOrder, status, currentOrder);
                  }
                }
              },
              error => {
                console.error('[foodbundle ready]: error ', error);
              }
            );
          }
        }
      }
      currentOrder.orderGroupStatus = OrderStatusEnum.READY;
      this.queue.addGroupToPreviousCompletedGroups(currentOrder);
      this.currentFocusedOrder = this.queue.getNextGroup();
      if (this.currentFocusedOrder !== undefined) {
        this.findLatestGroupOrderNotCancelled(this.currentFocusedOrder as SimilarGroup);
      }
    }
  }

  findLatestOrderNotCancelled(order: Order) {
    if (order === undefined) {
      this.currentFocusedOrder = undefined;
      this.endOfQueue = true;
    }

    this.orderService.findOrderByOrderId(order._id).subscribe(
      retrievedOrder => {
        if (retrievedOrder.orderStatus === OrderStatusEnum.CANCELLED ||
          retrievedOrder.orderStatus === OrderStatusEnum.REFUNDING ||
          retrievedOrder.orderStatus === OrderStatusEnum.REFUNDED) {
          this.findLatestOrderNotCancelled(this.queue.getNextGroup() as Order);
        }
        this.prepareNextOrder(order);
        return;
      }
    );
  }

  findLatestGroupOrderNotCancelled(o: SimilarGroup) {
    const currentOrdersArr = [];
    o.orders.forEach((value, key) => {
      currentOrdersArr.push(value);
    });

    this.orderService.findOrdersById(currentOrdersArr).subscribe(
      retrievedOrders => {
        for (const rOrder of retrievedOrders) {
          if (rOrder.orderStatus === OrderStatusEnum.CANCELLED ||
            rOrder.orderStatus === OrderStatusEnum.REFUNDING ||
            rOrder.orderStatus === OrderStatusEnum.REFUNDED) {
            // remove order from food item group
            o.orders.delete(rOrder._id);

            // add up all the item quantity of the food item that is in the cancelled order
            let totalReduceQty = 0;
            for (const orderItem of rOrder.individualOrderItems) {
              if (orderItem.foodItem._id === o.foodItem._id) {
                totalReduceQty += orderItem.itemQuantity;
              }
            }
            // reduce the item quantity from the food item group
            o.reduceCurrentItemQuantity(totalReduceQty);

            // if item qty of group becomes 0, proceed to next order
            if (o.currentItemQuantity === 0) {
              o = this.queue.getNextGroup() as SimilarGroup;
              // if reaches the end of queue
              if (o === undefined) {
                this.currentFocusedOrder = undefined;
                return;
              }
              this.currentFocusedOrder = o;
              this.prepareNextGroupOrder(this.currentFocusedOrder);
            }

          } else {
            this.currentFocusedOrder = o;
            this.prepareNextGroupOrder(this.currentFocusedOrder);
          }
        }
      }
    );
  }

  //Mark order as incompleted
  markOrderAsIncompleted() {
    if (this.currentFocusedOrder !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      this.orderService.updateOrderStatus(this.currentFocusedOrder as Order, OrderStatusEnum.RECEIVED).subscribe(
        updatedOrder => {
          this.queue.addOrderToQueue(updatedOrder);
          this.currentFocusedOrder = this.queue.getPreviousCompletedGroup();
          this.prepareNextOrder(this.currentFocusedOrder);
        }
      ), (error) => {
      };
    } else {
      this.currentFocusedOrder = this.queue.getPreviousCompletedGroup();
      this.prepareNextOrder(this.currentFocusedOrder);
    }
  }

  //Mark group order as incompleted
  markGroupOrderAsIncompleted() {
    let isFoodItem = true;
    let isFoodBundle = true;
    if (this.currentFocusedOrder !== undefined) {
      const currentOrder = this.currentFocusedOrder as SimilarGroup;
      currentOrder.orderGroupStatus = OrderStatusEnum.RECEIVED;

      const currentOrdersArr = [];
      currentOrder.orders.forEach((value, key) => {
        currentOrdersArr.push(value);
      });
      // preparing to received
      // FOOD ITEM
      this.orderService.updateOrderFoodItemStatusForMultipleOrders(currentOrdersArr, currentOrder.foodItem._id, OrderGroupItemStatusEnum.NEW).subscribe(
        updatedOrders => {
          // console.log("[fooditem new]: success");
          for (const ord of updatedOrders) {
            let allFoodItemsInOrder = [];
            if (ord.foodBundleOrderItems.length === 0) {
              allFoodItemsInOrder = ord.individualOrderItems.filter(item => item.orderItemStatus !== OrderGroupItemStatusEnum.NEW);
              if (allFoodItemsInOrder.length === 0) {
                this.orderService.updateOrderStatus(ord, OrderStatusEnum.RECEIVED).subscribe(
                  receivedOrder => {
                    console.log("[order new]: success");
                    // this.queue.addOrderToQueue(receivedOrder);
                  }
                );
              }
            }
          }

        },
        error => {
          isFoodItem = false;
          console.error(error);
        }
      );

      // preparing to received
      // FOOD BUNDLE
      for (const order of currentOrdersArr) {
        for (const foodBundle of order.foodBundleOrderItems) {
          this.orderService.updateOrderBundleItemStatusForMultipleOrders(currentOrdersArr, foodBundle.bundle_id, currentOrder.foodItem._id, OrderGroupItemStatusEnum.NEW).subscribe(
            updatedOrders => {
              // console.log("[foodBundle new]: success");

              let allFoodBundleItemInOrder = [];
              let allFoodItemsInOrder = [];
              for (const ord of updatedOrders) {
                allFoodBundleItemInOrder = ord.foodBundleOrderItems.filter(bundle => {
                  const opt = bundle.bundleItems.some(
                    ({ orderItemStatus }) => orderItemStatus !== OrderGroupItemStatusEnum.NEW);
                  return opt;
                });

                allFoodItemsInOrder = ord.individualOrderItems.filter(item => item.orderItemStatus !== OrderGroupItemStatusEnum.READY);

                if (allFoodBundleItemInOrder.length === 0 && allFoodItemsInOrder.length === 0) {
                  this.orderService.updateOrderStatus(ord, OrderStatusEnum.RECEIVED).subscribe(
                    receivedOrder => {
                      // console.log("[order new]: success");
                      //  this.queue.addOrderToQueue(receivedOrder);
                    }
                  );
                }
              }

            },
            error => {
              isFoodBundle = false;
              console.error(error);
            }
          );
        }
      }

      if (isFoodItem && isFoodBundle) {
        this.queue.addOrderGroupToQueue(currentOrder);
      }

      // ready to preparing
      this.currentFocusedOrder = this.queue.getPreviousCompletedGroup() as SimilarGroup;

      const currtFocusedOrdersArr = [];
      this.currentFocusedOrder.orders.forEach((value, key) => {
        currtFocusedOrdersArr.push(value);
      });

      // FOOD ITEM
      this.orderService.updateOrderFoodItemStatusForMultipleOrders(currtFocusedOrdersArr, this.currentFocusedOrder.foodItem._id, OrderGroupItemStatusEnum.PREPARING).subscribe(
        updatedOrders => {
          // console.log("fooditem: preparing: success");
          for (const ord of updatedOrders) {
            if (ord.foodBundleOrderItems.length === 0) {
              if (ord.orderStatus === OrderStatusEnum.READY) {
                this.orderService.updateOrderStatus(ord, OrderStatusEnum.PREPARING).subscribe(
                  preparingOrder => {
                    // console.log("[order preparing]: success");
                  }
                );
              }
            }
          }
        },
        error => {
          console.error(error);
        }
      );

      // FOOD BUNDLE
      for (const order of currtFocusedOrdersArr) {
        for (const foodBundle of order.foodBundleOrderItems) {
          this.orderService.updateOrderBundleItemStatusForMultipleOrders(currtFocusedOrdersArr, foodBundle.bundle_id, this.currentFocusedOrder.foodItem._id, OrderGroupItemStatusEnum.PREPARING).subscribe(
            updatedOrders => {
              // console.log("[foodBundle preparing]: success");

              for (const ord of updatedOrders) {
                if (ord.orderStatus === OrderStatusEnum.READY) {
                  this.orderService.updateOrderStatus(ord, OrderStatusEnum.PREPARING).subscribe(
                    preparingOrder => {
                      // console.log("[order preparing]: success");
                    }
                  );
                }
              }

            },
            error => {
              console.error(error);
            }
          );
        }
      }

      this.currentFocusedOrder.orderGroupStatus = OrderStatusEnum.PREPARING;


    } else { // when there is no current order & queue is empty
      // ready to preparing
      this.currentFocusedOrder = this.queue.getPreviousCompletedGroup() as SimilarGroup;

      const currtFocusedOrdersArr = [];
      this.currentFocusedOrder.orders.forEach((value, key) => {
        currtFocusedOrdersArr.push(value);
      });

      // FOOD ITEM
      this.orderService.updateOrderFoodItemStatusForMultipleOrders(currtFocusedOrdersArr, this.currentFocusedOrder.foodItem._id, OrderGroupItemStatusEnum.PREPARING).subscribe(
        updatedOrders => {
          // console.log("fooditem: preparing: success");
          for (const ord of updatedOrders) {
            if (ord.foodBundleOrderItems.length === 0) {
              if (ord.orderStatus === OrderStatusEnum.READY) {
                this.orderService.updateOrderStatus(ord, OrderStatusEnum.PREPARING).subscribe(
                  preparingOrder => {
                    // console.log("[order preparing]: success");
                  }
                );
              }
            }
          }
        },
        error => {
          console.error(error);
        }
      );

      // FOOD BUNDLE
      for (const order of currtFocusedOrdersArr) {
        for (const foodBundle of order.foodBundleOrderItems) {
          this.orderService.updateOrderBundleItemStatusForMultipleOrders(currtFocusedOrdersArr, foodBundle.bundle_id, this.currentFocusedOrder.foodItem._id, OrderGroupItemStatusEnum.PREPARING).subscribe(
            updatedOrders => {
              // console.log("[foodBundle preparing]: success");

              for (const ord of updatedOrders) {
                if (ord.orderStatus === OrderStatusEnum.READY) {
                  this.orderService.updateOrderStatus(ord, OrderStatusEnum.PREPARING).subscribe(
                    preparingOrder => {
                      // console.log("[order preparing]: success");
                    }
                  );
                }
              }

            },
            error => {
              console.error(error);
            }
          );
        }
      }
      this.currentFocusedOrder.orderGroupStatus = OrderStatusEnum.PREPARING;
    }
  }

  // check if the food items and bundles in order are completed
  checkIfFoodItemsAndBundlesAreCompleted(order, status, currentOrder) {
    this.orderService.findOrderByOrderId(order._id).subscribe(
      res => {
        let allFoodBundleItemInOrder = [];
        let allFoodItemsInOrder = [];

        // To get all the bundle order items that are not ready
        if (res.foodBundleOrderItems.length > 0) {
          allFoodBundleItemInOrder = res.foodBundleOrderItems.filter(bundle => {
            const opt = bundle.bundleItems.some((
              { orderItemStatus }) => orderItemStatus !== OrderGroupItemStatusEnum.READY);
            return opt;
          });
        }

        // To get all the items that are not ready
        if (res.individualOrderItems.length > 0) {
          allFoodItemsInOrder =
            res.individualOrderItems.filter(item => item.orderItemStatus !== OrderGroupItemStatusEnum.READY);
        }

        // if all food bundles and items are ready, update the order status
        if (allFoodBundleItemInOrder.length <= 0 && allFoodItemsInOrder.length <= 0) {
          this.orderService.updateOrderStatus(order, status).subscribe(
            updatedOrder => {
              // console.log('[order ready]: success');
            },
            error => {
              console.error(error);
            }
          );
        }
      },
      error => {
        console.error(error);
      }
    );
  }

  formatQueueCondition(): string {
    if (this.queue.getQueueCondition() !== undefined) {
      return this.queue.getQueueCondition().valueOf().replace(/_/g, ' ');
    } else {
      return "ALL";
    }
  }

  displayFoodBundleItems(bundleItems, divId) {
    const items = new Map();
    const cust = new Map();
    for (const fi of bundleItems) {
      if(!items.has(fi)) {
        items.set(fi, new FoodBundleItem(fi.foodItem, 1));
        if (fi.selectedCustomizations !== undefined) {
          cust.set(fi, fi.selectedCustomizations);
        }
      } else {
        const current = items.get(fi);
        current.qty += 1;
        items.set(fi, current);
      }
    }
    let result = '';
    for (const [key, value] of items) {
      const fb = value;
      result += '&nbsp;&nbsp;' + fb.foodItem.itemName;
      result += ' x' + fb.qty + '<br/>';

      if (cust.has(key)) {
        for (const option of cust.get(key)) {
          result += '&nbsp;&nbsp;&nbsp;' + option.selectedOption.optionName + '<br/>';
        }
      }
      document.getElementById(divId).innerHTML = result;
    }
  }

}
