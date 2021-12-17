import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FoodItem } from 'src/app/models/foodItem';
import { OrderItem } from 'src/app/models/submodels/orderItem';
import { User } from 'src/app/models/user';
import { FoodBasketService } from 'src/app/services/food-basket.service';
import { FoodItemCustomizeModalComponent } from '../food-item-customize-modal/food-item-customize-modal.component';
import { Location } from '@angular/common';
import * as _ from 'lodash';

@Component({
  selector: 'app-cart-individual-order-item',
  templateUrl: './cart-individual-order-item.component.html',
  styleUrls: ['./cart-individual-order-item.component.scss'],
})
export class CartIndividualOrderItemComponent implements OnInit {

  @Input() foodItem: FoodItem;
  @Input() user: User;
  @Input() id: number;

  constructor(
    private location: Location,
    private modalController: ModalController,
    private foodBasketService: FoodBasketService,
  ) { }

  ngOnInit() {}

  async showFoodItemModal(foodItem: OrderItem) {
    const modal = await this.modalController.create({
      component: FoodItemCustomizeModalComponent,
      componentProps: {
        order: _.cloneDeep(foodItem),
        editIndex: this.id,
        currentUser: this.user,
      }
    });
    await modal.present();
  }

  removeIndividualFoodItem(foodItem) {
    this.foodBasketService.removeOrderItem(foodItem, this.id);
    if (this.user) {
      this.exitCartIfEmpty();
    }
  }

  exitCartIfEmpty() {
    if (this.foodBasketService.getTotalItems() === 0) {
      this.location.back();
    }
  }

}
