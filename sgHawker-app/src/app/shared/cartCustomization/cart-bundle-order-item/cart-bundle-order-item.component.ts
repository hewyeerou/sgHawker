/* eslint-disable max-len */
import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BundleOrderItem } from 'src/app/models/submodels/bundleOrderItem';
import { User } from 'src/app/models/user';
import { FoodBasketService } from 'src/app/services/food-basket.service';
import { FoodBundleDetailModalComponent } from 'src/app/shared/cartCustomization/food-bundle-detail-modal/food-bundle-detail-modal.component';
import { Location } from '@angular/common';
import * as _ from 'lodash';

@Component({
  selector: 'app-cart-bundle-order-item',
  templateUrl: './cart-bundle-order-item.component.html',
  styleUrls: ['./cart-bundle-order-item.component.scss'],
})
export class CartBundleOrderItemComponent implements OnInit {

  @Input() bundleItem: BundleOrderItem;
  @Input() user: User;
  @Input() id: number;

  constructor(
    private foodBasketService: FoodBasketService,
    private modalController: ModalController,
    private location: Location,
  ) { }

  ngOnInit() {}

  removeBundleItem(bundleItem) {
    this.foodBasketService.removeBundleOrderItem(bundleItem, this.id);
    if (this.user) {
      this.exitCartIfEmpty();
    }
  }

  async showFoodBundleModal(foodBundle: BundleOrderItem) {
    const modal = await this.modalController.create({
      component: FoodBundleDetailModalComponent,
      componentProps: {
        currentBundleOrderItem: _.cloneDeep(foodBundle),
        editIndex: this.id,
        currentUser: this.user,
      }
    });
    await modal.present();
  }

  exitCartIfEmpty() {
    if (this.foodBasketService.getTotalItems() === 0) {
      this.location.back();
    }
  }
}
