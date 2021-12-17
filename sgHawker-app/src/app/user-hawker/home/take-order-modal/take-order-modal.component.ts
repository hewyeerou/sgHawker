/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { FoodItem } from 'src/app/models/foodItem';
import { Menu } from 'src/app/models/menu';
import { Outlet } from 'src/app/models/outlet';
import { FoodBundle } from 'src/app/models/submodels/foodBundle';
import { MenuCategory } from 'src/app/models/submodels/menuCategory';
import { FoodBasketService } from 'src/app/services/food-basket.service';
import { MenuService } from 'src/app/services/menu.service';
import { FoodBundleDetailModalComponent } from 'src/app/shared/cartCustomization/food-bundle-detail-modal/food-bundle-detail-modal.component';
import { FoodItemCustomizeModalComponent } from 'src/app/shared/cartCustomization/food-item-customize-modal/food-item-customize-modal.component';
import * as _ from 'lodash';
import { Location } from '@angular/common';
import { Order } from 'src/app/models/order';
import { OrderItem } from 'src/app/models/submodels/orderItem';
import { BundleOrderItem } from 'src/app/models/submodels/bundleOrderItem';
import { OrderTypeEnum } from 'src/app/models/enums/order-type-enum.enum';
@Component({
  selector: 'app-take-order-modal',
  templateUrl: './take-order-modal.component.html',
  styleUrls: ['./take-order-modal.component.scss'],
})
export class TakeOrderModalComponent implements OnInit {

  @Input() outlet: Outlet;
  activeMenu: Menu;

  title = 'Filter By&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;';

  menuCategories: MenuCategory[];
  foodItemCategories: MenuCategory[]; // dynamically create menu category base on food items
  foodBundles: FoodBundle[];
  recommendedFoodItems: FoodItem[];

  // filtering and searching
  allCategories: string[];
  selectedCategories: string[];
  searchString: string;
  originalMenuCategories: MenuCategory[];
  originalFoodItemCategories: MenuCategory[];

  originalFoodBundles: FoodBundle[];
  originalRecommendedItems: FoodItem[];

  order: Order;
  diningOptions: OrderTypeEnum;

  constructor(
    private location: Location,
    private alertController: AlertController,
    public toastController: ToastController,
    public modalController: ModalController,
    private menuService: MenuService,
    private foodBasketService: FoodBasketService,
  ) { }

  ngOnInit() {
    this.menuService
      .retrieveActiveMenuForOutlet(this.outlet._id)
      .subscribe(
        activeMenu => {
          this.activeMenu = activeMenu;
          this.foodBundles = this.activeMenu.foodBundles;
          this.foodBasketService.activeMenu = this.activeMenu;

          this.menuCategories = _.filter(this.activeMenu.menuCategories, menuCategory => {
            if (menuCategory.categoryName === 'Recommended') {
              // retrieve and assign recommended categories
              this.recommendedFoodItems = menuCategory.foodItems;
              return false;
            } else {
              return true;
            }
          });
          this.originalMenuCategories = _.cloneDeep(this.menuCategories);

          // generate food categories
          const foodItemCategoryMap = new Map();
          _.forEach(this.activeMenu.foodItems, item => {
            if (foodItemCategoryMap.get(item.itemCategory)) {
              const tempArr = foodItemCategoryMap.get(item.itemCategory);
              tempArr.push(item);
              foodItemCategoryMap.set(item.itemCategory, tempArr);
            } else {
              const tempArr = [];
              tempArr.push(item);
              foodItemCategoryMap.set(item.itemCategory, tempArr);
            }
          });

          this.foodItemCategories = [];
          for (const [key, value] of foodItemCategoryMap.entries()) {
            this.foodItemCategories.push(new MenuCategory(undefined, key, value));
          };
          this.originalFoodItemCategories = _.cloneDeep(this.foodItemCategories);

          this.initAllCategories();
        },
        error => {
          this.alertController.create({
            header: 'Oops...Something went wrong',
            message: 'Unable to load menu: ' + error,
            buttons: [
              {
                text: 'Go Back',
                role: 'OK',
                handler: () => {
                  this.location.back();
                }
              }
            ]
          }).then(alertElement => {
            alertElement.present();
          });
        }
      );
    this.order = this.foodBasketService.getOrder();
  }

  filterFoodByName() {
    if (!this.searchString || this.searchString.length === 0) {
      this.resetMenu();
      return;
    } else {
      this.menuCategories = [];
      this.foodItemCategories = [];
      this.filterCategory(this.menuCategories, this.originalMenuCategories);
      this.filterCategory(this.foodItemCategories, this.originalFoodItemCategories);
      this.foodBundles = _.filter(this.originalFoodBundles, foodBundle =>
        _.filter(foodBundle?.foodItems, foodItem => {
          let valid = false;
          if (foodItem.itemName?.toUpperCase().includes(this.searchString.toUpperCase())) {
            valid = true;
          }
          return valid;
        }).length > 0
      );
      this.recommendedFoodItems = _.filter(this.recommendedFoodItems, item => item.itemName.includes(this.searchString));
    }
  }

  filterCategories() {
    if (!this.selectedCategories || this.selectedCategories.length === 0) {
      this.resetMenu();
      return;
    }
    this.menuCategories = [];
    this.foodItemCategories = [];
    _.forEach(this.selectedCategories, category => {
      if (category === 'All categories') {
        this.resetMenu();
        return;
      } else {
        _.forEach(this.originalFoodItemCategories, foodCategory => {
          if (foodCategory.categoryName === category) {
            this.foodItemCategories.push(foodCategory);
          }
        });
        _.forEach(this.originalMenuCategories, menuCategory => {
          if (menuCategory.categoryName === category) {
            this.menuCategories.push(menuCategory);
          }
        });
      }
    });
  }

  async clearCart() {
    const alert = await this.alertController.create({
      message: 'All items in the cart currently will be removed.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Clear cart',
          handler: () => {
            this.foodBasketService.clearBasket();
            this.diningOptions = undefined;
            this.order = this.foodBasketService.order;
          }
        }
      ]
    });
    await alert.present();
  }

  async showAlert(msg) {
    const alert = await this.alertController.create({
      message: msg,
      buttons: [
        {
          text: 'Okay',
          role: 'cancel'
        }
      ]
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
      },
    });

    await modal.present();
  }

  async showFoodItemModal(foodItem: FoodItem) {
    if (foodItem.itemAvailability === false) {
      this.showAlert('Food item is not available!');
      return;
    };

    const modal = await this.modalController.create({
      component: FoodItemCustomizeModalComponent,
      componentProps: {
        foodItem: _.cloneDeep(foodItem),
      }
    });

    await modal.present();
  }

  async showFoodItemModalFromCart(foodItem: OrderItem, id: number) {
    const modal = await this.modalController.create({
      component: FoodItemCustomizeModalComponent,
      componentProps: {
        order: _.cloneDeep(foodItem),
        editIndex: id,
      },
    });

    await modal.present();
  }

  async showFoodBundleModalFromCart(foodBundle: BundleOrderItem, id: number) {
    const modal = await this.modalController.create({
      component: FoodBundleDetailModalComponent,
      componentProps: {
        currentBundleOrderItem: _.cloneDeep(foodBundle),
        editIndex: id,
      }
    });

    await modal.present();
  }

  removeIndividualFoodItem(foodItem, index) {
    this.foodBasketService.removeOrderItem(foodItem, index);
  }

  removeBundleItem(bundleItem, index) {
    this.foodBasketService.removeBundleOrderItem(bundleItem, index);
  }

  async placeOrder() {
    if (this.diningOptions === undefined) {
      this.showAlert('Please select a dining option.');
    } else {
      const amount = this.order.totalPrice;
      const alert = await this.alertController.create({
        message: 'Confirm cash payment of $' + amount,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Confirm',
            handler: () => {
              this.foodBasketService.hawkerCheckOut(this.diningOptions).subscribe(async (createdOrder: Order) => {
                this.diningOptions = undefined;
                this.order = this.foodBasketService.order;
                const toast = await this.toastController.create({
                  message:
                    'Order #' +
                    createdOrder._id.substring(createdOrder._id.length - 5) +
                    ' has been created successfully',
                  duration: 2000,
                });
                toast.present();
              }, async error => {
                const toast = await this.toastController.create({
                  message: 'Unable to create order:' + error,
                  duration: 2000,
                });
                toast.present();
              });
            }
          }
        ]
      });
      await alert.present();
    }
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  private initAllCategories() {
    this.allCategories = [];
    this.selectedCategories = [];
    this.allCategories.push('All categories');
    this.menuCategories.forEach(category => {
      this.allCategories.push(category.categoryName);
    });
    this.foodItemCategories.forEach(category => {
      this.allCategories.push(category.categoryName);
    });
    // clone for filtering
    this.originalMenuCategories = _.cloneDeep(this.menuCategories);
    this.originalFoodItemCategories = _.cloneDeep(this.foodItemCategories);
    this.originalFoodBundles = _.cloneDeep(this.foodBundles);
    this.originalRecommendedItems = _.cloneDeep(this.recommendedFoodItems);
  }

  private filterCategory(targetArr, sourceArr) {
    _.forEach(sourceArr, menuCategory => {
      const tempMenuCategory = new MenuCategory();
      tempMenuCategory.categoryName = menuCategory.categoryName;
      tempMenuCategory.foodItems = [];
      _.forEach(menuCategory.foodItems, foodItem => {
        if (foodItem.itemName.toLowerCase().trim().includes(this.searchString.toLowerCase().trim())) {
          tempMenuCategory.foodItems.push(foodItem);
        }
      });
      if (tempMenuCategory.foodItems.length > 0) {
        targetArr.push(tempMenuCategory);
      }
    });
  }

  private resetMenu() {
    this.menuCategories = _.cloneDeep(this.originalMenuCategories);
    this.foodItemCategories = _.cloneDeep(this.originalFoodItemCategories);
    this.foodBundles = _.cloneDeep(this.originalFoodBundles);
    this.recommendedFoodItems = _.cloneDeep(this.originalRecommendedItems);
  }

}
