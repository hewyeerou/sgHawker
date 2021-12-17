/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable no-underscore-dangle */
import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { QueuePreferenceEnum } from 'src/app/models/enums/queue-preference-enum';
import { FoodItem } from 'src/app/models/foodItem';
import { Outlet } from 'src/app/models/outlet';
import { User } from 'src/app/models/user';
import { FoodItemService } from 'src/app/services/food-item.service';
import { MenuService } from 'src/app/services/menu.service';
import { OutletService } from 'src/app/services/outlet.service';
import { SessionService } from 'src/app/services/session.service';
import { SelectFoodItemsModalPage } from '../../menus/create-menu/select-food-items-modal/select-food-items-modal.page';
import * as _ from 'lodash';
import { QueueCondition } from 'src/app/models/submodels/queueGeneration/queueCondition';
import { QueueConditionEnum } from 'src/app/models/enums/queue-condition-enum';
import { QueueBySimilarOrderSetting } from 'src/app/models/submodels/queueGeneration/QueueBySimilarOrderSetting';
import { OrderItemGroupQuantity } from 'src/app/models/submodels/queueGeneration/orderItemGroupQuantity';
import { QueueService } from 'src/app/services/queue.service';
import { QueueSetting } from 'src/app/models/queueSetting';
import { Router } from '@angular/router';


@Component({
  selector: 'app-queue-setting',
  templateUrl: './queue-setting.page.html',
  styleUrls: ['./queue-setting.page.scss'],
})
export class QueueSettingPage implements OnInit {

  outlet: Outlet;
  queueSetting: QueueSetting;
  allQueuePreferenceEnum: QueuePreferenceEnum;

  selectedQueuePreference: QueuePreferenceEnum;
  selectedNumberOfQueueForOrderTime: string;
  selectedNumberOfQueueForSimilarItem: string;
  selectedTypeOfQueueForOrderTime: string;
  selectedTypeOfQueueForSimilarItem: string;

  allFoodItemsFromOutlet: FoodItem[];
  // orderItemGroupQuantity: Map<FoodItem, number>;
  orderItemGroupQuantityArray: OrderItemGroupQuantity[];

  editingPreference = false;

  constructor(
    private router: Router,
    public modalController: ModalController,
    private alertController: AlertController,
    public toastController: ToastController,
    private sessionService: SessionService,
    private foodItemService: FoodItemService,
    private queueService: QueueService,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.outlet = this.sessionService.getCurrentOutlet();
    if (!this.queueService.queueSetting) {
      this.queueService.findQueueSettingByOutletId(this.outlet._id).subscribe(queueSetting => {
        this.queueService.queueSetting = queueSetting;
        this.retrieveSettings();
      });
    } else {
      this.retrieveSettings();
    }
  }

  retrieveSettings() {
    this.queueSetting = _.cloneDeep(this.queueService.queueSetting);
    this.selectedQueuePreference = this.queueSetting.defaultQueuePreference;

    this.foodItemService
      .findAllFoodItemByOutletId(this.outlet._id)
      .subscribe((response) => {
        this.allFoodItemsFromOutlet = response;
        this.orderItemGroupQuantityArray = [];
        for (let i = 0; i < this.allFoodItemsFromOutlet.length; i++) {
          const foodItemFromOutlet = this.allFoodItemsFromOutlet[i];
          let containsFoodItem = false;
          for (let j = 0; j < this.queueSetting.queueBySimilarOrderSetting.orderItemGroupQuantity.length; j++) {
            const foodItemInQueueSetting = this.queueSetting.queueBySimilarOrderSetting.orderItemGroupQuantity[j];
            if (foodItemFromOutlet._id === foodItemInQueueSetting.foodItem._id) {
              this.orderItemGroupQuantityArray.push({ foodItem: foodItemFromOutlet, quantity: foodItemInQueueSetting.quantity });
              containsFoodItem = true;
              break;
            }
          }
          if (!containsFoodItem) {
            this.orderItemGroupQuantityArray.push({ foodItem: foodItemFromOutlet, quantity: 1 });
          }
        }
      });

    if (this.queueSetting.queueByOrderTimeSetting.length === 0) {
      this.selectedNumberOfQueueForOrderTime = '1';
    } else {
      this.selectedNumberOfQueueForOrderTime = '2';

      this.selectedTypeOfQueueForOrderTime = '1';
      _.forEach(this.queueSetting.queueByOrderTimeSetting, value => {
        if (value.queueCondition === QueueConditionEnum.BY_NOT_DELIVERY) {
          this.selectedTypeOfQueueForOrderTime = '2';
        }
      });
    }
    if (this.queueSetting.queueBySimilarOrderSetting.queueSegregationCondition.length === 0) {
      this.selectedNumberOfQueueForSimilarItem = '1';
    } else if (this.queueSetting.queueBySimilarOrderSetting.queueSegregationCondition.length === 2) {
      this.selectedNumberOfQueueForSimilarItem = '2';

      this.selectedTypeOfQueueForSimilarItem = '1';
      _.forEach(this.queueSetting.queueBySimilarOrderSetting.queueSegregationCondition, value => {
        if (value.queueCondition === QueueConditionEnum.BY_NOT_DELIVERY) {
          this.selectedTypeOfQueueForSimilarItem = '2';
        }
      });
    }
  }

  userClickOnEdit() {
    if (this.queueService.queueIsActive) {
      this.showAlert();
    } else {
      this.editingPreference = true;
    }
  }

  async showAlert() {
    const alert = await this.alertController.create({
      header: 'You cannot edit the queue when the queue is active.',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
        }
      ]
    });

    await alert.present();
  }

  setTypeOfQueue(event) {
    if (this.selectedQueuePreference === QueuePreferenceEnum.ORDER_TIME) {
      this.selectedTypeOfQueueForOrderTime = event.detail.value;
    } else {
      this.selectedTypeOfQueueForSimilarItem = event.detail.value;
    }
  }

  increaseItemQuantity(index) {
    this.orderItemGroupQuantityArray[index].quantity++;
  }

  decreaseItemQuantity(index) {
    if (this.orderItemGroupQuantityArray[index].quantity > 1) {
      this.orderItemGroupQuantityArray[index].quantity--;
    }
  }

  updateQueueSettings() {
    let queueConditions = [];
    if ((this.selectedQueuePreference === QueuePreferenceEnum.ORDER_TIME && this.selectedNumberOfQueueForOrderTime === '2') ||
      (this.selectedQueuePreference === QueuePreferenceEnum.SIMILAR_ITEM && this.selectedNumberOfQueueForSimilarItem === '2')) {
      switch (this.selectedQueuePreference === QueuePreferenceEnum.ORDER_TIME ?
        this.selectedTypeOfQueueForOrderTime :
        this.selectedTypeOfQueueForSimilarItem) {
        case ('1'):
          queueConditions = [
            {
              queueCondition: QueueConditionEnum.BY_DINE_IN
            },
            {
              queueCondition: QueueConditionEnum.BY_NOT_DINE_IN
            },
          ];
          break;
        case ('2'):
          queueConditions = [
            {
              queueCondition: QueueConditionEnum.BY_DELIVERY
            },
            {
              queueCondition: QueueConditionEnum.BY_NOT_DELIVERY
            },
          ];
          break;
      }
    }

    this.queueSetting.defaultQueuePreference = this.selectedQueuePreference;
    if (this.selectedQueuePreference === QueuePreferenceEnum.ORDER_TIME) {
      this.queueSetting.queueByOrderTimeSetting = queueConditions;
    } else {
      const queueBySimilarOrderSetting: QueueBySimilarOrderSetting = {
        orderItemGroupQuantity: this.orderItemGroupQuantityArray,
        queueSegregationCondition: queueConditions
      };
      this.queueSetting.queueBySimilarOrderSetting = queueBySimilarOrderSetting;
    }

    this.queueService.updateQueueSettings(this.queueSetting).subscribe(updatedQueueSetting => {
      this.presentToast('Queue settings have been updated.');
      this.queueService.queueSetting = updatedQueueSetting;
      this.editingPreference = false;
      this.retrieveSettings();
    }, error => {
      this.showErrorMessage();
    });
  }

  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
    });
    toast.present();
  }

  async showErrorMessage() {
    const alert = await this.alertController.create({
      header: 'There was an error updating the queue setting. Try again later',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
        }
      ]
    });

    alert.onDidDismiss().then(data => {
      this.editingPreference = false;
      this.retrieveSettings();
    });

    await alert.present();
  }

  convertMapToArray(convertMap: Map<FoodItem, number>) {
    const orderItemGroupQuantity: OrderItemGroupQuantity[] = [];
    convertMap.forEach((value, key) => {
      orderItemGroupQuantity.push({
        foodItem: key,
        quantity: value
      });
    });
    return orderItemGroupQuantity;
  }
}
