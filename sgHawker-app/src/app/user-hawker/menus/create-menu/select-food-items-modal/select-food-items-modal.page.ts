import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { FoodItem } from 'src/app/models/foodItem';
import { FoodBundleItem } from 'src/app/models/submodels/foodBundleItem';
import * as _ from 'lodash';

@Component({
  selector: 'app-select-food-items-modal',
  templateUrl: './select-food-items-modal.page.html',
  styleUrls: ['./select-food-items-modal.page.scss'],
})
export class SelectFoodItemsModalPage implements OnInit {

  @Input() type: string;
  @Input() foodItems: any[];
  @Input() selectedItems: any[];

  originalItems: any[];
  selectedFoodItems: any[] = [];
  categorisedAllFood: any[] = [];
  baseUrl = '/api';

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.checkForSelection();
    this.categoriseFoodItems();
    this.checkCategorySelection();
    this.originalItems = _.cloneDeep(this.selectedItems);
  }

  dismiss() {
    if (this.type === 'Select') {
      this.modalCtrl.dismiss();
    } else {
      let totalPrice = 0;
      for (const s of this.originalItems) {
        totalPrice += s.qty * s.foodItem.itemPrice;
      }
      this.modalCtrl.dismiss({
        selectedItems: this.originalItems,
        total: totalPrice
      });
    }
  }

  confirm() {
    let checkQty = true;
    // if (this.selectedFoodItems.length === 0) {
    //   this.presentToast('Please select at least one item');
    // } else {
    if (this.type === 'Select') { // select food items for menu
      this.modalCtrl.dismiss({
        selectedItems: this.selectedFoodItems,
      });
    } else { // select food items for food bundle
      for (const s of this.selectedFoodItems) {
        if (s.qty <= 0 || s.qty === undefined) {
          this.presentToast('Please input a valid quantity for selected items');
          checkQty = false;
          break;
        }
      }
      if (checkQty) {
        let totalPrice = 0;
        for (const s of this.selectedFoodItems) {
          totalPrice += s.qty * s.foodItem.itemPrice;
        }
        this.modalCtrl.dismiss({
          selectedItems: this.selectedFoodItems,
          total: totalPrice,
          confirm: true
        });
      }
    }
    // }
  }

  clear() {
    this.selectedFoodItems = [];
    for (const f of this.foodItems) {
      f.selected = false;
    }
    for (const c of this.categorisedAllFood) {
      c.selected = false;
    }
  }

  addToSelected(item, e) {
    // if (item.qty !== undefined || this.type === 'Select') {
    if (e.currentTarget.checked) {
      this.selectedFoodItems.push(this.type === 'Select' ? item : new FoodBundleItem(item, item.qty));
      for (const c of this.categorisedAllFood) {
        if (c.categoryName === item.itemCategory) {
          let count = 0;
          for (const f of c.foodItems) {
            // eslint-disable-next-line no-underscore-dangle
            if (f._id === item._id) {
              f.selected = true;
            }
            if (f.selected) {
              count++;
            }
          }
          if (count === c.foodItems.length) {
            c.selected = true;
          }
          break;
        }
      }
    } else { //if unchecked -- for selecting food items
      if (this.type !== 'Select') {
        this.selectedFoodItems.forEach((s, index, array) => {
          // eslint-disable-next-line no-underscore-dangle
          if (s.foodItem._id === item._id) {
            this.selectedFoodItems.splice(index, 1);
          }
        });
      } else {
        //uncheck category if one item deselected -- for selecting food items in food bundle
        for (const c of this.categorisedAllFood) {
          if (c.categoryName === item.itemCategory) {
            c.selected = false;
            for (const f of c.foodItems) {
              // eslint-disable-next-line no-underscore-dangle
              if (f._id === item._id) {
                f.selected = false;
              }
            }
            break;
          }
        }
        this.selectedFoodItems.forEach((s, index, array) => {
          // eslint-disable-next-line no-underscore-dangle
          if (s._id === item._id) {
            this.selectedFoodItems.splice(index, 1);
          }
        });
      }
    }
    // } else {
    //   e.currentTarget.checked = false;
    //   this.presentToast('Please input the quantity first before selecting');
    // }
  }

  changeQuantity(item, e) {
    if (e.currentTarget.value) {
      item.qty = e.currentTarget.value;
      this.selectedFoodItems.forEach(s => {
        // eslint-disable-next-line no-underscore-dangle
        if (s.foodItem._id === item._id) {
          s.qty = e.currentTarget.value;
        }
      });
    }
  }

  checkForSelection() {
    for (const f of this.foodItems) {
      f.selected = false;
      f.qty = undefined;
      for (const s of this.selectedItems) {
        // eslint-disable-next-line no-underscore-dangle
        if (this.type !== 'Select' && f._id === s.foodItem._id) {
          f.selected = true;
          f.qty = s.qty;
          this.selectedFoodItems.push(s);
          // eslint-disable-next-line no-underscore-dangle
        } else if (this.type === 'Select' && f._id === s._id) {
          f.selected = true;
          this.selectedFoodItems.push(s);
        }
      }
    }
  }

  async presentToast(msg) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
    });
    toast.present();
  }

  categoriseFoodItems() {
    const categories = new Set(this.foodItems.map(item => item.itemCategory));
    categories.forEach(c => {
      const categorisedFood = {
        categoryName: '',
        foodItems: [],
        selected: false
      };
      categorisedFood.categoryName = c;
      this.foodItems.forEach(f => {
        if (f.itemCategory === c) {
          categorisedFood.foodItems.push(f);
        }
      });
      this.categorisedAllFood.push(categorisedFood);
    });
  }

  selectCategory(c, e) {
    let checked = true;
    if (!c.selected) {
      checked = true;
    } else {
      checked = false;
    }
    this.categorisedAllFood.forEach(cat => {
      if (cat.categoryName === c.categoryName) {
        cat.foodItems.forEach(f => {
          f.selected = checked;
        });
      }
    });
  }

  checkCategorySelection() {
    for (const c of this.categorisedAllFood) {
      c.selected = true;
      for (const f of c.foodItems) {
        if (!f.selected) {
          c.selected = false;
          break;
        }
      }
    }
  }
}
