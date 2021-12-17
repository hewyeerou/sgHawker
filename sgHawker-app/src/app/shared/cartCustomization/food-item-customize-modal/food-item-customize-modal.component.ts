/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit, Input } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import * as _ from 'lodash';

import { OrderItem } from '../../../models/submodels/orderItem';
import { CustomizationOption } from '../../../models/submodels/customizationOption';
import { FoodBasketService } from '../../../services/food-basket.service';
import { FoodItem } from '../../../models/foodItem';
import { OutletService } from 'src/app/services/outlet.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-food-item-customize-modal',
  templateUrl: './food-item-customize-modal.component.html',
  styleUrls: ['./food-item-customize-modal.component.scss'],
})
export class FoodItemCustomizeModalComponent implements OnInit {


  @Input() order: OrderItem;
  @Input() editIndex: number;
  @Input() currentUser: User;

  @Input() foodItem: FoodItem;
  @Input() bundleQuantity: number;
  @Input() outletIsActive: boolean;
  orderItem: OrderItem;
  optionMap: Map<string, CustomizationOption>;

  editingFoodItem = false;

  // food bundle food items
  partOfFoodBundle: boolean;

  constructor(
    private alertController: AlertController,
    private foodBasketService: FoodBasketService,
    private modalController: ModalController,
    private outletService: OutletService
  ) {
    this.orderItem = new OrderItem();
    this.orderItem.selectedCustomizations = [];
    this.optionMap = new Map();
    this.orderItem.itemQuantity = 1;
  }

  ngOnInit() {
    if (this.order) {
      this.orderItem = this.order;
      this.foodItem = this.order.foodItem;
      this.editingFoodItem = true;

      if (this.orderItem.selectedCustomizations) {
        for (const selectedCustomization of this.orderItem.selectedCustomizations) {
          this.optionMap.set(selectedCustomization.customizationName, { ...selectedCustomization.selectedOption });
        }
      }
      this.orderItem.selectedCustomizations = []; //will throw an error in console log, but only in development mode, will still work.

      this.orderItem.itemSubtotal = this.order.itemSubtotal;
    } else {
      this.orderItem.foodItem = this.foodItem;
      if (this.partOfFoodBundle) {
        this.orderItem.itemSubtotal = 0;
      } else {
        this.orderItem.itemSubtotal = this.orderItem.foodItem.itemPrice;
      }
    }
  }

  ionViewWillEnter() {
    if (this.order) {
      this.outletService.getOutletDetails(this.order.foodItem.outlet.toString()).subscribe(outletRes => {
        this.outletIsActive = this.outletService.checkOutletIsActive(outletRes);
      });
    } else {
      this.outletService.getOutletDetails(this.foodItem.outlet.toString()).subscribe(outletRes => {
        this.outletIsActive = this.outletService.checkOutletIsActive(outletRes);
      });
    }
  }


  getSelection(customizationName) {
    if (this.optionMap.has(customizationName)) {
      return this.optionMap.get(customizationName).optionName;
    } else {
      return false;
    }
  }

  selectCustomizationHandler(event, customizationGroupName) {
    if (!event.detail.value) {
      this.orderItem.itemSubtotal -= this.optionMap.get(customizationGroupName).optionCharge;
      this.optionMap.delete(customizationGroupName);
    } else {
      if (event.detail.value !== 'false') { //prevents error due to running the method twice
        const option = this.orderItem.foodItem.itemCustomizations.filter(customization =>
          customization.customizationName === customizationGroupName)[0].customizationOptions.filter(customizationOption =>
            customizationOption.optionName === event.detail.value)[0];

        if (this.optionMap.has(customizationGroupName)) {
          this.orderItem.itemSubtotal -= this.optionMap.get(customizationGroupName).optionCharge;
        }
        this.optionMap.set(customizationGroupName, option);
        this.orderItem.itemSubtotal += option.optionCharge;
      }
    }
  }

  private async showAlert() {
    const alert = await this.alertController.create({
      header: 'Please select all mandatory options',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
        }
      ]
    });
    await alert.present();
  }

  dismissModal(data?) {
    const bundleData = {
      orderItem: data,
      outlet: this.foodItem.outlet
    };
    this.modalController.dismiss(bundleData);
  }

  increaseItemQuantity() {
    const priceOfOne = this.orderItem.itemSubtotal / this.orderItem.itemQuantity;
    this.orderItem.itemQuantity++;
    this.orderItem.itemSubtotal += priceOfOne;
  }

  decreaseItemQuantity() {
    if (this.orderItem.itemQuantity === 1) {
      return;
    }
    const priceOfOne = this.orderItem.itemSubtotal / this.orderItem.itemQuantity;
    this.orderItem.itemQuantity--;
    this.orderItem.itemSubtotal -= priceOfOne;
  }

  addOrderItemToBasket() {
    for (const customization of this.orderItem.foodItem.itemCustomizations) {
      if (customization.mandatory && !this.optionMap.has(customization.customizationName)) {
        this.showAlert();
        // clear previously added customizations
        this.orderItem.selectedCustomizations = [];
        return;
      } else if (this.optionMap.has(customization.customizationName)) {
        // add option to the order item
        this.orderItem.selectedCustomizations.push(
          {
            _id: customization._id,
            customizationName: customization.customizationName,
            selectedOption: {
              ...this.optionMap.get(customization.customizationName)
            },
          }
        );
      }
    }
    if (this.partOfFoodBundle) {
      this.dismissModal(this.orderItem);
    } else {
      //directly add order item to basket
      if (this.editingFoodItem) {
        this.foodBasketService.editOrderItem(this.orderItem, this.editIndex);
      } else {
        this.foodBasketService.addOrderItem(this.orderItem, this.foodItem.outlet);
      }
      this.dismissModal();
    }
  }
}
