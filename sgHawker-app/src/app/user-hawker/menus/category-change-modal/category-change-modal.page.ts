import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { FoodItem } from 'src/app/models/foodItem';
import { MenuService } from 'src/app/services/menu.service';

@Component({
  selector: 'app-category-change-modal',
  templateUrl: './category-change-modal.page.html',
  styleUrls: ['./category-change-modal.page.scss'],
})
export class CategoryChangeModalPage implements OnInit {
  @Input() foodItems: FoodItem[];

  itemCategories: string[];
  itemCategoriesNotSelected: string[];
  fromCategoryName: string;
  toCategoryName: string;
  foodItemsCheckboxes: {
    foodItem: FoodItem;
    isSelected: boolean;
  }[];
  formValid = false;
  noAddTagAllowed = false;

  constructor(
    public modalController: ModalController,
    public menuService: MenuService,
    public alertController: AlertController
  ) { }

  ngOnInit() {
    this.itemCategories = [
      ...new Set(this.foodItems.map((foodItem) => foodItem.itemCategory)),
    ];
  }

  selectCategory() {
    this.itemCategoriesNotSelected = this.itemCategories.filter(
      (cat) => cat !== this.fromCategoryName
    );
    this.foodItemsCheckboxes = this.foodItems
      .filter((foodItem) => foodItem.itemCategory === this.fromCategoryName)
      .map((foodItem) => ({
        foodItem,
        isSelected: false,
      }));
    this.checkFormValid();
  }

  toCategory() {
    this.checkFormValid();
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  onSubmit() {
    const foodItemsIds = this.foodItemsCheckboxes
      .filter((item) => item.isSelected)
      .map((fic) => fic.foodItem._id);
    this.menuService
      .updateCategory(foodItemsIds, this.toCategoryName)
      .subscribe(
        (success) => {
          this.modalController.dismiss({ isSuccess: true });
        },
        (error) => {
          this.alertController
            .create({
              header: 'Hmm..something went wrong',
              message: 'Unable to make changes: ' + error,
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
      );
  }

  checkFormValid() {
    if (
      this.toCategoryName === this.fromCategoryName ||
      this.foodItemsCheckboxes.filter((item) => item.isSelected).length === 0
    ) {
      this.formValid = false;
    } else {
      this.formValid = true;
    }
  }
}
