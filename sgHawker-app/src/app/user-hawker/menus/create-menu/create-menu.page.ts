/* eslint-disable radix */
/* eslint-disable no-underscore-dangle */
import { Component, OnInit } from '@angular/core';
import { OutletService } from 'src/app/services/outlet.service';
import { SessionService } from 'src/app/services/session.service';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormArray,
} from '@angular/forms';
import * as _ from 'lodash';
import { Menu } from 'src/app/models/menu';
import { Outlet } from 'src/app/models/outlet';
import { FoodItem } from 'src/app/models/foodItem';
import { MenuService } from 'src/app/services/menu.service';
import { AlertController, ModalController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { CreateFoodBundlePage } from './create-food-bundle/create-food-bundle.page';
import { FoodItemService } from 'src/app/services/food-item.service';
import { MenuCategory } from 'src/app/models/submodels/menuCategory';
import { MenuCategoryModalPage } from './menu-category-modal/menu-category-modal.page';
import { SelectFoodItemsModalPage } from './select-food-items-modal/select-food-items-modal.page';
import { FoodBundle } from 'src/app/models/submodels/foodBundle';
import { FoodBundleItem } from 'src/app/models/submodels/foodBundleItem';

@Component({
  selector: 'app-create-menu',
  templateUrl: './create-menu.page.html',
  styleUrls: ['./create-menu.page.scss'],
})
export class CreateMenuPage implements OnInit {
  hawker: any;
  outlets: Outlet[] = [];
  outlet: Outlet;

  // create menu form
  createMenuForm: FormGroup;
  formValid: boolean;
  formSubmitted: boolean;
  newMenu: Menu;
  foodBundles: any[] = [];
  foodItems: FoodItem[] = [];

  // to check if there is active menu
  allMenus: Menu[] = [];
  activeMenus: Menu[] = [];

  // edit menu operation
  operation: string;
  selectedMenuIdToUpdate: string;

  constructor(
    private outletService: OutletService,
    private sessionService: SessionService,
    public formBuilder: FormBuilder,
    public menuService: MenuService,
    public alertController: AlertController,
    public router: Router,
    public modalController: ModalController,
    private foodItemService: FoodItemService,
    private route: ActivatedRoute
  ) {
    this.newMenu = new Menu();
    this.outlet = new Outlet();

    this.createMenuForm = this.formBuilder.group({
      // outlet: ['', Validators.required], //for future enhancement
      menuName: ['', Validators.required],
      activeMenu: [false, Validators.required],
      recommendedMenuCategory: this.createCategoryGroup(
        new MenuCategory(null, 'Recommended', [])
      ),
      menuCategories: this.formBuilder.array([]),
      foodItems: [[]],
    });
  }

  ngOnInit() {
    // get hawker
    this.hawker = this.sessionService.getCurrentUser();
    this.route.queryParams.subscribe((params) => {
      this.operation = params.operation;
      // this.selectedMenuIdToUpdate = params.menuId;
    });

    this.selectedMenuIdToUpdate = this.route.snapshot.paramMap.get('id');

    // get hawker outlets
    this.getHawkerOutlets(this.hawker._id);

    // get all menus
    this.menuService.getAllMenus().subscribe((res) => {
      this.allMenus = res;
    });
  }

  ionViewWillEnter() {
    // Edit menu: set all fields to menu details
    if (this.operation === 'editMenu') {
      this.menuService
        .getMenuById(this.selectedMenuIdToUpdate)
        .subscribe((res) => {
          const allMenuCategories = res.menuCategories;
          const recommendedMC = allMenuCategories.find(
            (mc) => mc.categoryName === 'Recommended'
          );
          if (recommendedMC) {
            this.createMenuForm.setControl(
              'recommendedMenuCategory',
              this.createCategoryGroup(recommendedMC)
            );
          }
          const allMCwithoutRecommended = allMenuCategories.filter(
            (mc) => mc.categoryName !== 'Recommended'
          );
          allMCwithoutRecommended.forEach((mc) => {
            this.menuCategories.push(this.createCategoryGroup(mc));
          });
          this.createMenuForm.patchValue({
            menuName: res.menuName,
            activeMenu: res.activeMenu,
            foodItems: res.foodItems,
          });

          // the other menu category
          const menuCatArray = res.menuCategories.filter(
            (cat) => cat.categoryName !== 'Recommended'
          );
          const menuCategoryFormGroups = menuCatArray.map((cat) =>
            this.formBuilder.group({
              categoryName: cat.categoryName,
              foodItems: this.formBuilder.array(cat.foodItems),
            })
          );
          const menuCategoryArray = this.formBuilder.array(
            menuCategoryFormGroups
          );
          this.createMenuForm.setControl('menuCategories', menuCategoryArray);
          this.foodBundles = res.foodBundles;
          this.prepareFoodBundle();
        });
    }
  }

  //Get Form Error
  get errorControl() {
    return this.createMenuForm.controls;
  }

  //Check for form validation
  checkFormValid() {
    this.formValid = true;
    const controls = this.createMenuForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        this.formValid = false;
        return;
      }
    }
  }

  getHawkerOutlets(id) {
    this.outlet = this.sessionService.getCurrentOutlet();
    this.retrieveFoodItems(this.outlet._id);
    // this.outletService.getHawkerOutlets(id).subscribe((res) => {
    //   this.outlets = res;

    //   this.retrieveFoodItems(res[0]._id);
    // });
  }

  // Create Menu: check if there is an active menu for this outlet
  checkActiveForMenusCreate(outletId) {
    this.activeMenus = this.allMenus.filter(
      (menus) => menus.activeMenu === true && menus.outlet === outletId
    );
    if (this.activeMenus.length > 0) {
      return true;
    } else if (this.activeMenus.length === 0) {
      return false;
    }
  }

  // Edit Menu: check if there is an active menu for this outlet
  checkActiveForMenusEdit(outletId, menuId) {
    this.activeMenus = this.allMenus.filter(
      (menus) =>
        menus.activeMenu === true &&
        menus.outlet === outletId &&
        menus._id !== menuId
    );
    if (this.activeMenus.length > 0) {
      return true;
    } else if (this.activeMenus.length === 0) {
      return false;
    }
  }

  createMenu() {
    this.formSubmitted = true;
    // this.newMenu.outlet = this.createMenuForm.value.outlet; //for future enhancement
    this.newMenu.outlet = this.outlet;
    this.newMenu.foodItems = this.createMenuForm.value.foodItems;
    this.newMenu.menuName = this.createMenuForm.value.menuName;

    // menu categories
    const recommendedArray: MenuCategory[] = [];
    recommendedArray.push(this.createMenuForm.value.recommendedMenuCategory);
    const menuCategoriesConsolidated = recommendedArray.concat(
      this.createMenuForm.value.menuCategories
    );
    this.newMenu.menuCategories = menuCategoriesConsolidated;

    // food bundles
    if (this.createMenuForm.value.foodBundles === null) {
      this.newMenu.foodBundles = [];
    } else {
      this.newMenu.foodBundles = this.foodBundles;
    }

    // if this is create menu operation
    if (this.operation === 'createMenu') {
      // check if there is an active menu
      const activeStatus = this.checkActiveForMenusCreate(this.outlet._id);
      if (activeStatus && this.createMenuForm.value.activeMenu === true) {
        this.alertFailurePopUp(
          'You can only have one active menu. To change it, edit the menu details.'
        );
        return;
      } else {
        this.processFoodBundle();
        this.newMenu.activeMenu = this.createMenuForm.value.activeMenu;
      }

      this.menuService.createNewMenu(this.newMenu).subscribe(
        (createdMenu) => {
          this.alertSuccessPopUp('Menu has been created.');
          this.resetMenuAfterCreate();
        },
        (error) => {
          this.alertFailurePopUp('Unable to create menu: ' + error);
        }
      );
    }
    // if this is edit menu operation
    else {
      // check if there is an active menu
      const activeStatus = this.checkActiveForMenusEdit(
        this.outlet._id,
        this.selectedMenuIdToUpdate
      );
      if (activeStatus && this.createMenuForm.value.activeMenu === true) {
        this.alertFailurePopUp(
          'You can only have one active menu. To change it, edit the menu details.'
        );
        return;
      } else {
        this.processFoodBundle();
        this.newMenu.activeMenu = this.createMenuForm.value.activeMenu;
      }

      this.menuService
        .updateMenuDetails(this.newMenu, this.selectedMenuIdToUpdate)
        .subscribe(
          (updatedMenu) => {
            this.alertController
              .create({
                header: 'Success',
                message: 'Menu has been updated.',
                buttons: [
                  {
                    text: 'OK',
                    role: 'OK',
                    handler: () => {
                      this.createMenuForm.reset();
                      this.router.navigate(['/hawker/menus/view-menu-details/' + this.selectedMenuIdToUpdate]);
                    },
                  },
                ],
              })
              .then((alertElement) => {
                alertElement.present();
              });
            this.resetMenuAfterCreate();
          },
          (error) => {
            this.alertFailurePopUp('Unable to create menu: ' + error);
          }
        );
    }
  }

  // package array of FoodItems in FoodBundle into a new model FoodBundleItem
  prepareFoodBundle() {
    this.foodBundles.forEach((fb) => {
      const tempFoodItems = [];
      fb.foodItems.forEach((f, index) => {
        if (tempFoodItems.find((x) => x.foodItem._id === f._id)) {
          const tempIndex = tempFoodItems.findIndex(
            (x) => x.foodItem._id === f._id
          );
          const qty = tempFoodItems[tempIndex].qty;
          tempFoodItems[tempIndex] = new FoodBundleItem(f, qty + 1);
        } else {
          tempFoodItems.push(new FoodBundleItem(f, 1));
        }
      });
      fb.foodItems = tempFoodItems;
    });
  }

  // unpackage FoodBundleItem to an array of FoodItems in FoodBundle
  processFoodBundle() {
    this.foodBundles.forEach((fb) => {
      const tempFoodItems = [];
      fb.foodItems.forEach((f) => {
        for (let i = 0; i < f.qty; i++) {
          tempFoodItems.push(f.foodItem);
        }
      });
      fb.foodItems = tempFoodItems;
    });
  }

  resetMenuAfterCreate() {
    this.newMenu = new Menu();
    this.foodBundles = [];
    this.activeMenus = [];
  }

  alertSuccessPopUp(msg) {
    this.alertController
      .create({
        header: 'Success',
        message: msg,
        buttons: [
          {
            text: 'OK',
            role: 'OK',
            handler: () => {
              this.createMenuForm.reset();
              this.router.navigate(['/hawker/menus']);
            },
          },
        ],
      })
      .then((alertElement) => {
        alertElement.present();
      });
  }

  alertFailurePopUp(msg) {
    this.alertController
      .create({
        header: 'Hmm..something went wrong',
        message: msg,
        buttons: [
          {
            text: 'Dismiss',
            role: 'cancel',
          },
        ],
      })
      .then((alertElement) => {
        alertElement.present();
      });
  }

  async alertDeletePopUp(foodItems: FoodItem[]) {
    const radios = this.menuCategories.value.map((menuCategory) => ({
      name: menuCategory.categoryName,
      type: 'radio',
      label: menuCategory.categoryName,
      value: menuCategory.categoryName,
    }));
    radios.unshift({
      name: this.createMenuForm.value.recommendedMenuCategory.categoryName,
      type: 'radio',
      label: this.createMenuForm.value.recommendedMenuCategory.categoryName,
      value: this.createMenuForm.value.recommendedMenuCategory.categoryName,
    });
    this.alertController
      .create({
        header: 'Port over food items?',
        message:
          'Select Menu Category to port over ' +
          foodItems.length +
          ' items, if not dismiss',
        inputs: radios,
        buttons: [
          {
            text: 'Dismiss',
            role: 'cancel',
          },
          {
            text: 'Confirm',
            role: 'OK',
            handler: (selectedMenuCategory) => {
              if (!selectedMenuCategory) {
                return false;
              }
              if (
                selectedMenuCategory ===
                this.createMenuForm.value.recommendedMenuCategory.categoryName
              ) {
                const oldFoodItems =
                  this.createMenuForm.value.recommendedMenuCategory.foodItems;

                const allFoodItems = oldFoodItems.concat(foodItems);
                // .filter((v, i, aolf) => a.indexOf(v) === i);
                const allUniqueFoodItems = _.uniqBy(
                  allFoodItems,
                  (foodItem) => foodItem._id
                );
                this.createMenuForm.controls.recommendedMenuCategory.patchValue(
                  {
                    categoryName:
                      this.createMenuForm.value.recommendedMenuCategory
                        .categoryName,
                  }
                );
                (
                  this.createMenuForm.controls
                    .recommendedMenuCategory as FormGroup
                ).setControl(
                  'foodItems',
                  this.formBuilder.array(allUniqueFoodItems)
                );
              } else {
                const selectedFormGroup = this.menuCategories.controls.find(
                  (mc) => mc.value.categoryName === selectedMenuCategory
                );
                const oldFoodItems = selectedFormGroup.value.foodItems;
                const allFoodItems = oldFoodItems.concat(foodItems);
                const allUniqueFoodItems = _.uniqBy(
                  allFoodItems,
                  (foodItem) => foodItem._id
                );
                selectedFormGroup.patchValue({
                  categoryName: selectedMenuCategory,
                });

                (selectedFormGroup as FormGroup).setControl(
                  'foodItems',
                  this.formBuilder.array(allUniqueFoodItems)
                );
              }
            },
          },
        ],
      })
      .then((alertElement) => {
        alertElement.present();
      });
  }

  async presentMenuCategoryModal(
    menuCategoryFormGroup: FormGroup,
    isRecommended: boolean,
    isUpdate: boolean,
    formGroupIdx: number | null
  ) {
    const modal = await this.modalController.create({
      component: MenuCategoryModalPage,
      cssClass: '',
      componentProps: {
        menuCategoryFormGroup,
        foodItems: this.createMenuForm.controls.foodItems.value,
        isRecommended,
        isUpdate,
      },
      showBackdrop: true,
      backdropDismiss: false,
    });

    modal.onDidDismiss().then((data) => {
      const modalData = data.data;
      if (modalData !== undefined) {
        if (modalData.doDelete) {
          const removedFoodItems = modalData.formGroup.value.foodItems;
          this.menuCategories.removeAt(formGroupIdx);
          if (removedFoodItems.length > 0) {
            this.alertDeletePopUp(removedFoodItems);
          }
        } else if (!isRecommended && !isUpdate) {
          // If adding new menu category
          this.menuCategories.push(modalData.formGroup);
        }
      }
    });
    return await modal.present();
  }

  checkIfFoodItemsRemoved(newFoodItems: FoodItem[]) {
    const oldFoodItems = this.createMenuForm.controls.foodItems.value;
    const removedFoodItems = oldFoodItems.filter(
      (foodItem) => !newFoodItems.find((fi) => fi._id === foodItem._id)
    );
    (
      this.createMenuForm.controls.recommendedMenuCategory as FormGroup
    ).setControl(
      'foodItems',
      this.formBuilder.array(
        this.createMenuForm.controls.recommendedMenuCategory.value.foodItems.filter(
          (fi) => !removedFoodItems.find((rfi) => rfi._id === fi._id)
        )
      )
    );
    this.menuCategories.controls.forEach((menuCategoryFormGroup) => {
      const mcItems = menuCategoryFormGroup.value.foodItems;
      (menuCategoryFormGroup as FormGroup).setControl(
        'foodItems',
        this.formBuilder.array(
          mcItems.filter(
            (fi) => !removedFoodItems.find((rfi) => rfi._id === fi._id)
          )
        )
      );
    });
  }

  createCategoryGroup(menuCategory: MenuCategory): FormGroup {
    return this.formBuilder.group({
      categoryName: [menuCategory.categoryName, Validators.required],
      foodItems: [menuCategory.foodItems],
    });
  }

  retrieveFoodItems(outletId) {
    // eslint-disable-next-line no-underscore-dangle
    this.foodItemService
      .findAllFoodItemByOutletId(outletId)
      .subscribe((response) => {
        this.foodItems = response;
      });
  }

  addFoodBundle() {
    this.presentAddFoodBundle();
  }

  updateFoodBundle(f) {
    this.presentUpdateFoodBundle(f);
  }

  async presentAddFoodBundle() {
    const modal = await this.modalController.create({
      component: CreateFoodBundlePage,
      componentProps: {
        type: 'Create',
        foodItems: this.foodItems,
      },
      showBackdrop: true,
      backdropDismiss: false,
    });
    modal.onDidDismiss().then((data) => {
      if (data.data.dismiss !== true) {
        const newFB = data.data.foodBundle;
        this.foodBundles.push(newFB);
      }
    });
    return await modal.present();
  }

  async presentUpdateFoodBundle(f) {
    const modal = await this.modalController.create({
      component: CreateFoodBundlePage,
      componentProps: {
        type: 'Update',
        foodBundle: f,
        selectedFoodItems: f.foodItems,
        foodBundleName: f.bundleName,
        foodBundlePrice: f.bundlePrice,
        foodBundlePromotion: f.isPromotion,
        foodItems: this.foodItems,
        foodBundleImg: f.bundleImgSrc,
      },
      showBackdrop: true,
      backdropDismiss: false,
    });
    modal.onDidDismiss().then((data) => {
      if (data.data !== undefined) {
        if (data.data.type === 'Delete') {
          const index = this.foodBundles.indexOf(data.data.foodBundle);
          this.foodBundles.splice(index, 1);
        }
        else if (data.data.dismiss === true) {
          const index = this.foodBundles.indexOf(data.data.foodBundle);
          this.foodBundles[index] = data.data.foodBundle
          // this.foodBundles.splice(index, 1);
        } else {
          f = data.data.foodBundle;
        }
      }
    });
    return await modal.present();
  }

  addMenuCategory() {
    this.presentMenuCategoryModal(
      this.createCategoryGroup(new MenuCategory(null, '', [])),
      false,
      false,
      null
    );
  }

  get menuCategories() {
    return this.createMenuForm.get('menuCategories') as FormArray;
  }

  presentAlert(hd, msg) {
    this.alertController
      .create({
        header: hd,
        message: msg,
        buttons: [
          {
            text: 'Dismiss',
            role: 'cancel',
          },
        ],
      })
      .then((alertElement) => {
        alertElement.present();
      });
  }

  selectFoodItems() {
    this.presentMenuModal();
  }

  async presentMenuModal() {
    const modal = await this.modalController.create({
      component: SelectFoodItemsModalPage,
      componentProps: {
        type: 'Select',
        foodItems: this.foodItems,
        selectedItems: this.createMenuForm.value.foodItems,
      },
      showBackdrop: true,
      backdropDismiss: false,
    });
    modal.onDidDismiss().then((data) => {
      if (data.data !== undefined) {
        this.checkIfFoodItemsRemoved(data.data.selectedItems);
        this.createMenuForm.setControl(
          'foodItems',
          this.formBuilder.array(data.data.selectedItems)
        );
        this.checkFormValid();
      }
    });
    return await modal.present();
  }
}
