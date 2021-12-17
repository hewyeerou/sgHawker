import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { FoodItem } from 'src/app/models/foodItem';
import { FoodBundle } from 'src/app/models/submodels/foodBundle';
import { FoodBundleItem } from 'src/app/models/submodels/foodBundleItem';
import { FoodItemService } from 'src/app/services/food-item.service';
import * as _ from 'lodash';
import { SelectFoodItemsModalPage } from '../select-food-items-modal/select-food-items-modal.page';

@Component({
  selector: 'app-create-food-bundle',
  templateUrl: './create-food-bundle.page.html',
  styleUrls: ['./create-food-bundle.page.scss'],
})
export class CreateFoodBundlePage implements OnInit {
  @Input() type: string;
  @Input() selectedFoodItems: any[] = [];
  @Input() foodBundleName: string;
  @Input() foodBundlePrice: number;
  @Input() foodBundlePromotion = false;
  @Input() foodBundleImg: any;
  @Input() foodBundle: FoodBundle;
  @Input() foodItems: any[] = [];

  file: any;
  totalPrice: number;
  baseUrl = '/api';
  originalFoodBundle: FoodBundle;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private foodItemService: FoodItemService
  ) { }

  ngOnInit() {
    if (this.selectedFoodItems.length > 0) {
      this.calculateOriginalTotalPrice();
      this.originalFoodBundle = _.cloneDeep(this.foodBundle);
    }
  }

  async retrieveFoodItems() {
    const tempArray: any[] = [];
    return new Promise((resolve, reject) => {
      this.selectedFoodItems.forEach(async (s, index, array) => {
        this.foodItemService.findFoodItemById(s.foodItem).subscribe(
          response => {
            s.foodItem = response;
          },
          error => {
            this.presentToast('Something went wrong: ' + error + '\nPlease try again later');
            this.dismiss();
          }
        );
        if (index === array.length - 1) {
          resolve(this.selectedFoodItems);
        }
      });
    });
  }

  async presentMenuModal() {
    const modal = await this.modalCtrl.create({
      component: SelectFoodItemsModalPage,
      componentProps: {
        foodItems: this.foodItems,
        selectedItems: this.selectedFoodItems
      },
      showBackdrop: true,
      backdropDismiss: false
    });
    modal.onDidDismiss()
      .then((data) => {
        if (data.data !== undefined) {
          this.selectedFoodItems = data.data.selectedItems;
          this.totalPrice = data.data.total;
          if (data.data.confirm && !this.foodBundlePromotion) {
            this.foodBundlePrice = data.data.total;
          }
        }
      });
    return await modal.present();
  }

  validate() {
    if (!this.foodBundleName || this.foodBundleName === '' || !this.foodBundlePrice
      || this.foodBundlePrice === undefined || !this.selectedFoodItems || this.selectedFoodItems.length === 0) {
      this.presentToast('Please fill in bundle name, a valid bundle price, and select at least one food');
      return false;
    }
    else {
      return true;
    }
  }

  createFoodBundle() {
    if (this.validate()) {
      this.foodBundleImg = 'public/static/default-fooditem.jpeg';
      this.modalCtrl.dismiss({
        // eslint-disable-next-line max-len
        foodBundle: new FoodBundle(this.foodBundleImg, this.foodBundleName, this.foodBundlePrice, this.foodBundlePromotion, this.selectedFoodItems)
      });
    }
  }

  updateFoodBundle() {
    if (this.validate()) {
      this.foodBundle.bundleName = this.foodBundleName;
      this.foodBundle.bundlePrice = this.foodBundlePrice;
      this.foodBundle.foodItems = this.selectedFoodItems;
      this.foodBundle.isPromotion = this.foodBundlePromotion;
      this.modalCtrl.dismiss({
        foodBundle: this.foodBundle
      });
    }
  }

  deleteFoodBundle(f) {
    this.foodBundle.bundleName = this.foodBundleName;
    this.foodBundle.bundlePrice = this.foodBundlePrice;
    this.foodBundle.foodItems = this.selectedFoodItems;
    this.foodBundle.isPromotion = this.foodBundlePromotion;
    this.modalCtrl.dismiss({
      foodBundle: this.foodBundle,
      type: 'Delete'
    });
  }

  changePromotion() {
    if (!this.foodBundlePromotion) {
      this.foodBundlePrice = this.totalPrice;
    }
  }

  dismiss() {
    if (this.originalFoodBundle === null) { //for update, if there already exists a originalfooddbundle, remove changes
      this.foodBundle.foodItems = this.originalFoodBundle.foodItems;
    }
    this.modalCtrl.dismiss({
      dismiss: true,
      foodBundle: this.originalFoodBundle
    });
  }

  calculateOriginalTotalPrice() {
    let sum = 0;
    for (const s of this.selectedFoodItems) {
      sum += Number(s.qty) * s.foodItem.itemPrice;
    }
    this.totalPrice = sum;
  }

  async presentToast(msg) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
    });
    toast.present();
  }

  setImage(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (_event) => {
      this.foodBundleImg = reader.result;
    };
  }
}
