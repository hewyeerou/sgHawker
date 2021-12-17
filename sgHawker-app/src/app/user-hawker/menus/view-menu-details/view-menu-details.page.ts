/* eslint-disable arrow-body-style */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { Menu } from 'src/app/models/menu';
import { MenuService } from 'src/app/services/menu.service';
import { AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Outlet } from 'src/app/models/outlet';
import { MenuCategory } from 'src/app/models/submodels/menuCategory';
import { FoodItemService } from 'src/app/services/food-item.service';
import * as _ from 'lodash';
import { FoodItem } from 'src/app/models/foodItem';
import { FoodBundleItem } from 'src/app/models/submodels/foodBundleItem';
import { FoodBundle } from 'src/app/models/submodels/foodBundle';

@Component({
  selector: 'app-view-menu-details',
  templateUrl: './view-menu-details.page.html',
  styleUrls: ['./view-menu-details.page.scss'],
})
export class ViewMenuDetailsPage implements OnInit {
  baseUrl = '/api';

  menuId: string;
  menu: Menu;
  menuCatSegmentModel: string;
  foodCatSegmentModel: string;
  foodItemCategories: MenuCategory[] = [];

  // search bar
  originalMenu: Menu;
  originalMenuCategories: MenuCategory[] = [];
  originalFoodItems: FoodItem[] = [];
  originalFoodBundles: FoodBundle[] = [];
  foodBundlesFoodItemArr: any[] = [];

  // filtering and searching
  allCategories: string[];
  selectedCategories: string[];
  searchString: string;
  filterOriginalMenuCategories: MenuCategory[] = [];
  filterOriginalFoodItemCategories: MenuCategory[] = [];

  constructor(
    public route: ActivatedRoute,
    private menuService: MenuService,
    public alertController: AlertController,
    public router: Router,
    private foodItemService: FoodItemService,
    private toastCtrl: ToastController
  ) {
    this.menu = new Menu();
    this.originalMenu = new Menu();
    this.menu.outlet = new Outlet();
    this.menu.menuCategories = [];
    this.menu.foodItems = [];
    this.menu.foodBundles = [];
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.menuId = this.route.snapshot.paramMap.get('id');
    this.getMenuDetailsById(this.menuId);
  }

  getMenuDetailsById(id) {
    this.menuService.getMenuById(id)
      .subscribe(
        menu => {
          this.menu = menu;
          this.originalMenu = menu;
          this.originalMenuCategories = menu.menuCategories;
          this.originalFoodItems = menu.foodItems;
          this.originalFoodBundles = menu.foodBundles;
          this.groupFoodItemsByCategory(menu.foodItems);
          this.groupFoodBundles(menu.foodBundles);

          if (this.foodItemCategories.length !== 0) {
            this.foodCatSegmentModel = this.foodItemCategories[0].categoryName;
          }
          if (menu.menuCategories.length !== 0) {
            this.menuCatSegmentModel = menu.menuCategories[0].categoryName;
          }

          this.initAllCategories();
        }
      );
  }

  groupFoodItemsByCategory(foodItems) {
    const foods = foodItems.slice();
    const category = new Set(foodItems.map(item => item.itemCategory));
    const groupedFoodItems = [];
    let originalGroupFoodItems = [];
    category.forEach(cat => groupedFoodItems.push({
      categoryName: cat,
      foodItems: foods.filter(food => food.itemCategory === cat)
    }));
    originalGroupFoodItems = groupedFoodItems;
    this.foodItemCategories = originalGroupFoodItems;
  }

  groupFoodBundles(foodBundles) {
    for (const foodBundle of foodBundles) {
      const foodBundleItemArr = [];
      for (const foodItem of foodBundle.foodItems) {
        const foodBundleItem = new FoodBundleItem();
        if (foodBundleItemArr.some((fbi) => fbi.foodItem.itemName === foodItem.itemName)) {
          foodBundleItemArr.forEach((item) => {
            if (item.foodItem.itemName === foodItem.itemName) {
              item.qty++;
            }
          });
        } else {
          foodBundleItem.foodItem = foodItem;
          foodBundleItem.qty = 1;
          foodBundleItemArr.push(foodBundleItem);
        }
      }
      foodBundle.foodItems = foodBundleItemArr;
    }
  }

  deleteMenu() {
    this.menuService
      .deleteMenu(this.menuId)
      .subscribe(
        res => {
          this.alertSuccessPopUp('Menu has been deleted.');
        },
        error => {
          this.alertFailurePopUp('Unable to delete menu: ' + error);
        }
      );
  }

  alertDeleteConfirmPopUp() {
    this.alertController.create({
      message: 'Do you want to delete the menu?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.deleteMenu();
          }
        },
        {
          text: 'No',
          handler: () => { }
        }
      ]
    }).then(alertElement => {
      alertElement.present();
    });
  }


  async alertSuccessPopUp(msg) {
    this.alertController.create({
      header: 'Success',
      message: msg,
      buttons: [
        {
          text: 'OK',
          role: 'OK',
          handler: () => {
            this.router.navigate(['/hawker/menus']);
          }
        }
      ]
    }).then(alertElement => {
      alertElement.present();
    });
  }

  async alertFailurePopUp(msg) {
    this.alertController.create({
      header: 'Hmm..something went wrong',
      message: msg,
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel'
        }
      ]
    }).then(alertElement => {
      alertElement.present();
    });
  }

  editMenu() {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        operation: 'editMenu',
      }
    };
    this.router.navigate(['/hawker/menus/create-menu/' + this.menu._id], navigationExtras);
  }

  alertUpdateItemAvailability(foodItem) {
    this.alertController.create({
      message: 'Do you want to update food availability?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.updateItemAvailability(foodItem);
          }
        },
        {
          text: 'No',
          handler: () => {
            foodItem.itemAvailability = !foodItem.itemAvailability;
          }
        }
      ],
      backdropDismiss: false
    }).then(alertElement => {
      alertElement.present();
    });
  }

  updateItemAvailability(foodItem) {
    let itemAvailability = '';
    if (foodItem.itemAvailability === true) {
      itemAvailability = 'available';
      this.foodItemService.enableFoodItemById(foodItem._id).subscribe(
        updatedFoodItem => {
          this.alertController.create({
            header: 'Success',
            message: 'Food item is set to ' + itemAvailability,
            buttons: [
              {
                text: 'OK',
                role: 'OK',
                handler: () => {
                  this.getMenuDetailsById(this.menuId);
                  return;
                }
              }
            ]
          }).then(alertElement => {
            alertElement.present();
          });
        }
      );
    } else {
      itemAvailability = 'unavailable';
      this.foodItemService.disableFoodItemById(foodItem._id).subscribe(
        updatedFoodItem => {
          this.alertController.create({
            header: 'Success',
            message: 'Food item is set to ' + itemAvailability,
            buttons: [
              {
                text: 'OK',
                role: 'OK',
                handler: () => {
                  this.getMenuDetailsById(this.menuId);
                  return;
                }
              }
            ]
          }).then(alertElement => {
            alertElement.present();
          });
        }
      );

    }
  }

  filterMenuByFood() {
    // reset the menu
    this.menu = _.cloneDeep(this.originalMenu);
    this.menu.foodItems = _.cloneDeep(this.originalFoodItems);
    this.menu.menuCategories = _.cloneDeep(this.originalMenuCategories);
    this.menu.foodBundles = _.cloneDeep(this.originalFoodBundles);

    // filter food under menu categories
    this.menu.menuCategories = this.menu.menuCategories.map((mc, index) => {
      this.menu.menuCategories[index].foodItems = mc.foodItems
        .filter((fi) => {
          if (fi.itemName.toLowerCase().indexOf(this.searchString.toLowerCase()) > -1) {
            return true;
          }
          return false;
        });
      return mc;
    });

    // filter food under food categories
    this.menu.foodItems = this.menu.foodItems
      .filter((fi) => {
        if (fi.itemName.toLowerCase().indexOf(this.searchString.toLowerCase()) > -1) {
          return true;
        }
        return false;
      });
  }

  duplicateMenu(name) {
    const duplicatedMenu = _.cloneDeep(this.menu);
    duplicatedMenu.menuName = name;
    duplicatedMenu.activeMenu = false;
    _.unset(duplicatedMenu, '_id');
    this.processFoodBundle(duplicatedMenu);
    this.menuService.createNewMenu(duplicatedMenu).subscribe(
      response => {
        this.alertSuccessPopUp('Menu duplicated');
      },
      error => {
        this.alertFailurePopUp(error);
      }
    );
  }

  async duplicateMenuAlert() {
    const alert = await this.alertController.create({
      header: 'Name your duplicated menu',
      inputs: [
        {
          name: 'menuName',
          type: 'text',
          placeholder: 'Menu Name'
        }
      ],
      buttons: [
        {
          text: 'Confirm',
          handler: data => {
            if (data.menuName) {
              this.duplicateMenu(data.menuName);
            } else {
              this.presentToast('Please input a name for your menu');
            }
          }
        }, {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }

  async presentToast(msg) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
    });
    toast.present();
  }

// unpackage FoodBundleItem to an array of FoodItems in FoodBundle
  processFoodBundle(menu) {
    menu.foodBundles.forEach(fb => {
      const tempFoodItems = [];
      fb.foodItems.forEach(f => {
        for (let i = 0; i < f.qty; i++) {
          tempFoodItems.push(f.foodItem);
        }
      });
      fb.foodItems = tempFoodItems;
    });
  }

  initAllCategories() {
    this.allCategories = [];
    this.selectedCategories = [];
    this.allCategories.push('All categories');
    this.menu.menuCategories.forEach(category => {
      this.allCategories.push(category.categoryName);
    });
    this.foodItemCategories.forEach(category => {
      this.allCategories.push(category.categoryName);
    });

    this.filterOriginalMenuCategories = _.cloneDeep(this.menu.menuCategories);
    this.filterOriginalFoodItemCategories = _.cloneDeep(this.foodItemCategories);
  }

  resetMenu() {
    this.menu.menuCategories = _.cloneDeep(this.filterOriginalMenuCategories);
    this.foodItemCategories = _.cloneDeep(this.filterOriginalFoodItemCategories);
  }

  filterCategories() {
    if (!this.selectedCategories || this.selectedCategories.length === 0) {
      this.resetMenu();
      return;
    }
    this.foodItemCategories = [];
    this.menu.menuCategories = [];
    _.forEach(this.selectedCategories, category => {
      if (category === 'All categories') {
        this.resetMenu();
        return;
      } else {
        _.forEach(this.filterOriginalFoodItemCategories, foodCategory => {
          if (foodCategory.categoryName === category) {
            this.foodItemCategories.push(foodCategory);
            this.foodCatSegmentModel = this.foodItemCategories[0].categoryName;
          }
        });
        _.forEach(this.filterOriginalMenuCategories, menuCategory => {
          if (menuCategory.categoryName === category) {
            this.menu.menuCategories.push(menuCategory);
            this.menuCatSegmentModel = this.menu.menuCategories[0].categoryName;
          }
        });
      }
    });
  }
}
