import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { FoodItem } from 'src/app/models/foodItem';
import { User } from 'src/app/models/user';
import { FoodItemService } from 'src/app/services/food-item.service';
import { SessionService } from 'src/app/services/session.service';
import { ChangeDetectorRef } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { PopoverComponentComponent } from '../../../shared/popover-component/popover-component.component';
import { CategoryChangeModalPage } from '../category-change-modal/category-change-modal.page';
import { Outlet } from 'src/app/models/outlet';

@Component({
  selector: 'app-view-all-food-item',
  templateUrl: './view-all-food-item.page.html',
  styleUrls: ['./view-all-food-item.page.scss'],
})
export class ViewAllFoodItemPage implements OnInit {
  baseUrl = '/api';

  //Default
  foodItems: FoodItem[];
  outlet: Outlet;
  hawker: User;
  originalFoodItems: FoodItem[];

  //Search
  searchVal: string;
  searchedFoodItems: FoodItem[];

  //Category
  groupedFoodItems;
  originalGroupFoodItems;
  selectedCategory: string;
  specificCategory;

  //filter
  filter: string;
  sort: string;

  constructor(public foodItemService: FoodItemService,
    public sessionService: SessionService,
    public popoverController: PopoverController,
    public router: Router,
    public modalController: ModalController) {
  }

  ngOnInit() {
    this.searchVal = '';
    this.filter = 'default';
    this.sort = '';
    this.selectedCategory = '';
    this.foodItems = [];
    this.searchedFoodItems = [];
    this.hawker = this.sessionService.getCurrentUser();
    this.outlet = this.sessionService.getCurrentOutlet();
  }

  ionViewWillEnter() {
    this.searchVal = '';
    this.filter = 'default';
    this.sort = '';
    this.selectedCategory = '';
    this.foodItems = [];
    this.searchedFoodItems = [];
    this.originalFoodItems = [];
    this.retrieveAllFoodItems();
  }

  retrieveAllFoodItems() {
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    this.foodItemService.findAllFoodItemByOutletId(this.outlet._id).subscribe(
      retrievedFoodItems => {
        this.foodItems = retrievedFoodItems;
        this.originalFoodItems = this.foodItems;
        this.groupFoodItemsByCategory();
      }
    );
  }

  viewFoodItemDetails(food) {
    const navigationExtras: NavigationExtras = {
      state: {
        user: food
      }
    };
    this.router.navigate(['hawker/menus/view-food-item'], navigationExtras);
  }

  goToCreateFoodItem() {
    this.router.navigate(['hawker/menus/create-food-item']);
  }

  _ionSearchChange(event) {
    this.searchVal = event.detail.value;
    if (this.foodItems.length !== 0) {
      this.searchedFoodItems = this.foodItems;

      if (this.searchVal && this.searchVal.trim() !== '') {
        this.searchedFoodItems = this.searchedFoodItems.filter(
          (item: any) => (item.itemName.toLowerCase().indexOf(this.searchVal.toLowerCase()) > -1));
      }
    }
  }

  sortOnChange(evt) {
    if (evt.detail.value === 'A-Z') {
      this.sort = 'A-Z';
      this.sortByAZ();
    } else if (evt.detail.value === 'Price') {
      this.sort = 'Price';
      this.sortByPrice();
    }
  }

  filterOnChange(evt) {
    if (evt.detail.value === 'default') {
      this.foodItems = this.originalFoodItems;
      this.groupedFoodItems = this.groupedFoodItems;
    } else if (evt.detail.value === 'available') {
      this.filterAvailable();
    } else if (evt.detail.value === 'notAvailable') {
      this.filterNotAvailable();
    } else if (evt.detail.value === 'category') {
      this.sort = '';
    }
  }

  revertFilter() {
    this.foodItems = this.originalFoodItems;
  }

  filterAvailable() {
    this.foodItems = this.originalFoodItems;
    this.foodItems = this.foodItems.filter((item: any) => {
      if (item.itemAvailability === true) {
        return item;
      }
    });
  }

  filterNotAvailable() {
    this.foodItems = this.originalFoodItems;
    this.foodItems = this.foodItems.filter(item => item.itemAvailability === false);
  }

  sortByAZ() {
    this.foodItems = this.foodItems.sort((a, b) => a.itemName.localeCompare(b.itemName));
    this.groupedFoodItems = this.groupedFoodItems.sort((a, b) => a.category.localeCompare(b.category));
  }

  sortByPrice() {
    this.foodItems = this.foodItems.sort((a, b) => a.itemPrice - b.itemPrice);
  }

  selectCategory(evt) {
    this.specificCategory = this.groupedFoodItems[evt.detail.value];
  }

  revert() {
    this.specificCategory = [];
    this.selectedCategory = '';
  }

  groupFoodItemsByCategory() {
    const foods = this.foodItems.slice();
    foods.sort((a, b) => a.itemPrice - b.itemPrice);
    const category = new Set(this.foodItems.map(item => item.itemCategory));
    this.groupedFoodItems = [];
    this.originalGroupFoodItems = [];
    category.forEach(cat => this.groupedFoodItems.push({
      category: cat,
      values: foods.filter(food => food.itemCategory === cat)
    }));
    this.originalGroupFoodItems = this.groupedFoodItems;
    // const foodItemCategoryMap = new Map();
    // _.forEach(this.foodItems, item => {
    //   if(foodItemCategoryMap.get(item.itemCategory)) {
    //     const tempArr = foodItemCategoryMap.get(item.itemCategory);
    //     tempArr.push(item);
    //     foodItemCategoryMap.set(item.itemCategory, tempArr);
    //   } else {
    //     const tempArr = [];
    //     tempArr.push(item);
    //     foodItemCategoryMap.set(item.itemCategory, tempArr);
    //   }
    // });
  }

  async showPopOver(ev) {
    const popoverItemProps = [{
      label: 'New Food Item',
      eventHandler: () => {
        this.router.navigate(['hawker/menus/create-food-item']);
      },
    },
    {
      label: 'Manage Category',
      eventHandler: () => {
        this.presentCategoryChangeModal();
      },
      type: 'MANAGE'
    }
    ];
    this.popoverController.create({
      component: PopoverComponentComponent,
      componentProps: { items: popoverItemProps },
      translucent: true,
      event: ev
    }).then(popOverElement => {
      popOverElement.present();
    });
  }

  async presentCategoryChangeModal() {
    const modal = await this.modalController.create({
      component: CategoryChangeModalPage,
      cssClass: '',
      componentProps: {
        foodItems: this.originalFoodItems
      },
    });

    modal.onDidDismiss().then((data) => {
      const modalData = data.data;
      if (modalData !== undefined) {
        if (modalData.isSuccess) {
          this.retrieveAllFoodItems();
        }
      }
    });
    return await modal.present();
  }
}
