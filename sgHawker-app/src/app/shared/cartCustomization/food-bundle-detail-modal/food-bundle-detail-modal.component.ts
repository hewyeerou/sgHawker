/* eslint-disable no-underscore-dangle */
import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { BundleOrderItem } from '../../../models/submodels/bundleOrderItem';
import { FoodBasketService } from '../../../services/food-basket.service';
import { FoodBundle } from '../../../models/submodels/foodBundle';
import { FoodItemCustomizeModalComponent } from '../food-item-customize-modal/food-item-customize-modal.component';
import { FoodItem } from '../../../models/foodItem';
import { OrderItem } from '../../../models/submodels/orderItem';
import * as _ from 'lodash';
import { Outlet } from '../../../models/outlet';
import { MenuService } from '../../../services/menu.service';
import { OutletService } from 'src/app/services/outlet.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-food-bundle-detail-modal',
  templateUrl: './food-bundle-detail-modal.component.html',
  styleUrls: ['./food-bundle-detail-modal.component.scss'],
})
export class FoodBundleDetailModalComponent implements OnInit {

  @Input() foodBundle: FoodBundle;
  @Input() currentBundleOrderItem: BundleOrderItem;
  @Input() editIndex: number;
  @Input() currentUser: User;

  outletIsActive: boolean;
  bundleOrderItem: BundleOrderItem;
  outlet: Outlet;

  firstTimeCustomizing = [];

  editingBundleItem = false;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private foodBasketService: FoodBasketService,
    private menuService: MenuService,
    private outletService: OutletService,
  ) { }

  ngOnInit(): void {
    this.bundleOrderItem = new BundleOrderItem();
    if (this.currentBundleOrderItem) {
      this.bundleOrderItem.bundleSubtotal = this.currentBundleOrderItem.bundleSubtotal;
      this.bundleOrderItem.bundleName = this.currentBundleOrderItem.bundleName;
      this.bundleOrderItem.bundleItems = this.currentBundleOrderItem.bundleItems;
      this.firstTimeCustomizing = _.cloneDeep(this.currentBundleOrderItem.bundleItems);
      this.bundleOrderItem.bundleQuantity = this.currentBundleOrderItem.bundleQuantity;
      this.bundleOrderItem.bundle_id = this.currentBundleOrderItem.bundle_id;

      this.foodBundle = this.foodBasketService.activeMenu.foodBundles.filter(bundle =>
        bundle._id === this.currentBundleOrderItem.bundle_id)[0];

      this.editingBundleItem = true;
    } else {
      this.bundleOrderItem.bundleSubtotal = this.foodBundle.bundlePrice;
      this.bundleOrderItem.bundleName = this.foodBundle.bundleName;
      this.bundleOrderItem.bundleItems = [];
      _.forEach(this.foodBundle.foodItems, foodItem => {
        const orderItem = new OrderItem();
        orderItem.itemSubtotal = 0;
        orderItem.foodItem = foodItem;
        this.bundleOrderItem.bundleItems.push(orderItem);
      });
      this.bundleOrderItem.bundleQuantity = 1;
      this.bundleOrderItem.bundle_id = this.foodBundle._id;
    }
  }

  ionViewWillEnter() {
    if (this.currentBundleOrderItem) {
      this.outletService.getOutletDetails(this.currentBundleOrderItem.bundleItems[0].foodItem.outlet.toString()).subscribe(outletRes => {
        this.outletIsActive = this.outletService.checkOutletIsActive(outletRes);
      });
    } else {
      this.outletService.getOutletDetails(this.foodBundle.foodItems[0].outlet).subscribe(outletRes => {
        this.outletIsActive = this.outletService.checkOutletIsActive(outletRes);
      });
    }
  }

  increaseItemQuantity() {
    const priceOfOne = this.bundleOrderItem.bundleSubtotal / this.bundleOrderItem.bundleQuantity;
    this.bundleOrderItem.bundleQuantity++;
    this.bundleOrderItem.bundleSubtotal += priceOfOne;
  }

  decreaseItemQuantity() {
    if (this.bundleOrderItem.bundleQuantity === 1) {
      return;
    }
    const priceOfOne = this.bundleOrderItem.bundleSubtotal / this.bundleOrderItem.bundleQuantity;
    this.bundleOrderItem.bundleQuantity--;
    this.bundleOrderItem.bundleSubtotal -= priceOfOne;
  }

  async showFoodItemModal(foodItem: FoodItem, id: number) {
    let modal;
    if (this.firstTimeCustomizing[id] !== undefined) {
      modal = await this.modalController.create({
        component: FoodItemCustomizeModalComponent,
        componentProps: {
          order: _.cloneDeep(this.bundleOrderItem.bundleItems[id]),
          partOfFoodBundle: true,
          bundleQuantity: this.bundleOrderItem.bundleQuantity,
          outletIsActive: this.outletIsActive,
          currentUser: this.currentUser
        }
      });
    } else {
      modal = await this.modalController.create({
        component: FoodItemCustomizeModalComponent,
        componentProps: {
          foodItem: _.cloneDeep(foodItem),
          partOfFoodBundle: true,
          bundleQuantity: this.bundleOrderItem.bundleQuantity,
          outletIsActive: this.outletIsActive,
          currentUser: this.currentUser
        }
      });
    }

    modal.onDidDismiss().then(data => {
      if (!data.data.orderItem) {
        return;
      }

      const orderItem = data.data.orderItem as OrderItem;
      this.outlet = data.data.outlet as Outlet;

      if (this.firstTimeCustomizing[id] !== undefined) {
        const itemSubtotal = this.bundleOrderItem.bundleItems[id].itemSubtotal;
        this.bundleOrderItem.bundleSubtotal -= (itemSubtotal * this.bundleOrderItem.bundleQuantity);
      }

      // reset item subtotal to show only additional charges
      // add new/updated order item into array at the same index
      this.bundleOrderItem.bundleItems[id] = _.cloneDeep(orderItem);
      this.firstTimeCustomizing[id] = _.cloneDeep(orderItem);
      this.bundleOrderItem.bundleSubtotal += (orderItem.itemSubtotal * this.bundleOrderItem.bundleQuantity);
    });

    await modal.present();
  }

  async showAlert() {
    const alert = await this.alertController.create({
      header: 'Please select all necessary customizations for items in bundle!',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
        }
      ]
    });
    await alert.present();
    return;
  }
  async addOrderBundleToBasket() {
    let valid = true;
    _.forEach(this.foodBundle.foodItems, foodItem => {
      _.forEach(foodItem.itemCustomizations, customization => {
        if (customization.mandatory) {
          _.forEach(this.bundleOrderItem.bundleItems, bundleItem => {
            if (bundleItem.foodItem._id === foodItem._id) {
              if ((!bundleItem.selectedCustomizations || bundleItem.selectedCustomizations.length <= 0) ||
                (_.filter(bundleItem.selectedCustomizations, selectedCustom =>
                  selectedCustom.customizationName === customization.customizationName).length <= 0)) {
                valid = false;
              }
            }
          });
        }
      });
    });

    if (!valid) {
      this.showAlert();
      return;
    }

    if (this.editingBundleItem) {
      this.foodBasketService.editBundleOrderItem(this.bundleOrderItem, this.editIndex);
    } else {
      this.foodBasketService.addBundleOrderItem(this.bundleOrderItem, this.outlet);
    }
    this.dismissModal();
  }

  dismissModal() {
    this.modalController.dismiss();
  }
}
