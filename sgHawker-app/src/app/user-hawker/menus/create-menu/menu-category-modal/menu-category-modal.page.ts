import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormGroup, FormBuilder } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { FoodItem } from 'src/app/models/foodItem';

@Component({
  selector: 'app-menu-category-modal',
  templateUrl: './menu-category-modal.page.html',
  styleUrls: ['./menu-category-modal.page.scss'],
})
export class MenuCategoryModalPage implements OnInit {
  @Input() menuCategoryFormGroup: FormGroup;
  @Input() foodItems: FoodItem[];
  @Input() isUpdate: boolean;
  @Input() isRecommended: boolean;
  formValid: boolean;
  formSubmitted: boolean;
  foodItemsCheckboxes: {
    foodItem: FoodItem;
    isSelected: boolean;
  }[];
  itemCategoriesCheckboxes: {
    itemCategoryName: string;
    isSelected: boolean;
  }[];



  baseUrl = '/api';

  constructor(public modalController: ModalController, public formBuilder: FormBuilder) { }

  ngOnInit() {
    this.checkFormValid();
    const currentlySelectedFoodItems =
      this.menuCategoryFormGroup.controls.foodItems.value;
    this.foodItemsCheckboxes = this.foodItems.map((foodItem) => {
      const isSelected = !!currentlySelectedFoodItems.find(
        (currentFoodItem) => foodItem?._id === currentFoodItem?._id
      );
      return {
        foodItem,
        isSelected,
      };
    });

    const itemCategories = [
      ...new Set(this.foodItems.map((foodItem) => foodItem.itemCategory)),
    ];

    this.itemCategoriesCheckboxes = itemCategories.map((itemCategory) => ({
      itemCategoryName: itemCategory,
      isSelected: this.checkIfCategorySelected(itemCategory),
    }));
  }

  checkIfCategorySelected(itemCategoryName): boolean {
    // finding any item of itemcategory that has not been selected
    // return false if found
    return !!!this.foodItemsCheckboxes.find(
      (checkbox) =>
        checkbox.foodItem.itemCategory === itemCategoryName &&
        !checkbox.isSelected
    );
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  submit() {
    this.formSubmitted = true;
    const selectedFoodItems = this.foodItemsCheckboxes
      .filter((checkbox) => checkbox.isSelected)
      .map((checkbox) => checkbox.foodItem);
    // for FormArray cannot just call setvalue, because structure is retained
    // simply do a recreation of the FormArray
    this.menuCategoryFormGroup.setControl('foodItems', this.formBuilder.array(selectedFoodItems));

    this.modalController.dismiss({
      formGroup: this.menuCategoryFormGroup,
      doDelete: false,
    });
  }

  submitDelete() {
    this.modalController.dismiss({
      formGroup: this.menuCategoryFormGroup,
      doDelete: true,
    });
  }

  checkFormValid() {
    this.formValid = true;
    const controls = this.menuCategoryFormGroup.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        this.formValid = false;
        return;
      }
    }
  }

  onItemCategorySelectChange(itemCategoryCheckbox) {
    const isSelected = itemCategoryCheckbox.isSelected;
    const { itemCategoryName } = itemCategoryCheckbox;
    this.foodItemsCheckboxes.forEach((fic) => {
      if (fic.foodItem.itemCategory === itemCategoryName) {
        fic.isSelected = isSelected;
      }
    });
  }

  onFoodItemSelectChange(itemCategoryName: string) {
    this.itemCategoriesCheckboxes.find(
      (checkbox) => checkbox.itemCategoryName === itemCategoryName
    ).isSelected = this.checkIfCategorySelected(itemCategoryName);
  }

  filteredCategoryItems = (itemCategoryName: string) =>
    this.foodItemsCheckboxes.filter(
      (fic) => fic.foodItem.itemCategory === itemCategoryName
    );
}
