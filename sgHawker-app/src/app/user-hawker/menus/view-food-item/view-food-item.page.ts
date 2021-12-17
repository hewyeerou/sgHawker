import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { FoodItem } from 'src/app/models/foodItem';
import { Customization } from 'src/app/models/submodels/customization';
import { FoodItemService } from 'src/app/services/food-item.service';
import { MenuService } from 'src/app/services/menu.service';
import { OutletService } from 'src/app/services/outlet.service';
import { CustomizationPage } from '../customization/customization.page';
import { EditCustomizationPage } from '../edit-customization/edit-customization.page';

@Component({
  selector: 'app-view-food-item',
  templateUrl: './view-food-item.page.html',
  styleUrls: ['./view-food-item.page.scss'],
})
export class ViewFoodItemPage implements OnInit {
  baseUrl = '/api';
  food: FoodItem;

  isEditing: boolean;
  formValid: boolean;

  segmentModel: string;

  fileImage: File;
  fileURL: string | ArrayBuffer;
  imageChanged: boolean = false;

  allCategories: string[];

  currentCustomization: Customization[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public foodItemService: FoodItemService,
    public alertController: AlertController,
    public modalController: ModalController,
    public outletService: OutletService,
    public menuService: MenuService,
    public toastController: ToastController
  ) {
    this.route.queryParams.subscribe((params) => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.food = this.router.getCurrentNavigation().extras.state.user;
        this.fileURL = '' + this.baseUrl + '/' + this.food.itemImageSrc;
        this.currentCustomization = this.food.itemCustomizations;
      } else {
        this.router.navigate(['hawker/menus/view-all-food-item']);
      }
    });
    this.segmentModel = 'itemDetails';
  }

  ngOnInit() {
    this.getAllCategories();
  }

  getAllCategories() {
    const outletId = (this.food.outlet as unknown) as string;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.menuService
      .retrieveAllUniqueFoodCategories(outletId)
      .subscribe((allUniqueCategories) => {
        this.allCategories = allUniqueCategories;
      }),
      async (error) => {
        const toast = await this.toastController.create({
          message: 'Could not retrieve all categories: ' + error,
          duration: 2000,
        });
        toast.present();
      };
  }

  changeToEdit(bool) {
    this.isEditing = bool;
  }

  segmentChanged(ev: any) {
    this.segmentModel = ev.detail.value;
  }

  checkFormValid() {
    return this.food.itemDescription === '' ||
      this.food.itemName === '' ||
      this.food.itemPrice <= 0
      ? (this.formValid = false)
      : (this.formValid = true);
  }

  updateFoodItem() {
    this.checkFormValid();
    if (this.formValid) {
      this.foodItemService.updateFoodItemDetails(this.food).subscribe(
        updatedFoodItem => {
          this.imgUpload(updatedFoodItem._id,  this.fileImage);
          this.food = updatedFoodItem;
          this.alertController
          .create({
            header: 'Success',
            message: 'Food Item details has been successfully updated.',
            buttons: [
              {
                text: 'Dismiss',
                role: 'cancel',
              },
            ],
          })
          .then((alertElement) => {
            alertElement.present();
            this.isEditing = false;
            this.fileImage = null;
            this.imageChanged = false;
          });
        }, async (error) => {
          const toast = await this.toastController.create({
            message: 'Could not update Food Item: ' + error,
            duration: 2000,
          });
          toast.present();
        }
      );
    } else {
      this.alertController
        .create({
          header: 'Unable to update',
          message: 'Please input the form correctly.',
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
  }

  onFileChange(event) {
    this.fileImage = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsDataURL(event.target.files[0]);
    fileReader.onload = () => {
      this.fileURL = fileReader.result.toString();
    };
    this.imageChanged = true;
  }

  imgUpload(foodItemId, file) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.foodItemService.uploadFoodItemPicture(foodItemId, file).subscribe(
      uploadedImage => {
      }
    ),
      async (error) => {
        const toast = await this.toastController.create({
          message: 'Could not upload image: ' + error,
          duration: 2000,
        });
        toast.present();
      };
  }

  async customization() {
    const modalCustomization = await this.modalController.create({
      component: CustomizationPage,
      cssClass: 'my-custom-class',
    });

    modalCustomization.onDidDismiss().then((data) => {
      if (data.data !== undefined) {
        this.food.itemCustomizations.push(data.data);
        this.updateFoodItemCustomizations();
      }
    });

    return await modalCustomization.present();
  }

  updateFoodItemCustomizations() {
    this.foodItemService.updateFoodItemDetails(this.food).subscribe(
      async (updatedFoodItem) => {
        const toast = await this.toastController.create({
          message: 'Food item customization has been updated ',
          duration: 2000,
        });
        toast.present();
      },
      async (error) => {
        const toast = await this.toastController.create({
          message: 'Could not retrieve Food Item: ' + error,
          duration: 2000,
        });
        toast.present();
      }
    );
  }

  async removeOption(i) {
    const alertRemove = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirm',
      message:
        'Are you sure you want to remove ' +
        this.food.itemCustomizations[i].customizationName +
        '?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Okay',
          handler: () => {
            this.food.itemCustomizations.splice(i, 1);
            this.updateFoodItemCustomizations();
          },
        },
      ],
    });

    await alertRemove.present();
  }

  async editCustomization(j) {
    const viewCustomisationModal = await this.modalController.create({
      component: EditCustomizationPage,
      cssClass: 'my-custom-class',
      componentProps: {
        customization: this.food.itemCustomizations[j],
      },
    });

    viewCustomisationModal.onDidDismiss().then((data) => {
      if (data.data !== undefined) {
        this.food.itemCustomizations[j] = data.data;
        this.updateFoodItemCustomizations();
      }
    });

    return await viewCustomisationModal.present();
  }

  async deleteFoodItem() {
    const alertDelete = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirm',
      message: 'Are you sure you want to delete ' + this.food.itemName + '?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Confirm',
          handler: () => {
            this.deleteFood();
            this.router.navigate(['hawker/menus/view-all-food-item']);
          },
        },
      ],
    });

    await alertDelete.present();
  }

  deleteFood() {
    this.foodItemService.deleteFoodItem(this.food._id).subscribe(
      async (deletedFoodItem) => {
        const toast = await this.toastController.create({
          message: 'Food Item has been deleted ',
          duration: 2000,
        });
        toast.present();
      },
      async (error) => {
        const toast = await this.toastController.create({
          message: 'Could not delete food item: ' + error,
          duration: 2000,
        });
        toast.present();
      }
    );
  }

  updateCategoryName = (oldCategoryName, newCategoryName) => {
    const outletId = (this.food.outlet as unknown) as string;
    this.menuService
      .updateCategoryName(
        outletId,
        oldCategoryName,
        newCategoryName
      )
      .subscribe(
        (success) => {
          this.allCategories = this.allCategories.map((name) =>
            name === oldCategoryName ? newCategoryName : name
          );
          this.food.itemCategory = newCategoryName;
        },
        (error) => { }
      );
  };

  updateCategoryNameCallback = (categoryName) => {
    const alert = this.alertController
      .create({
        header: 'Edit Category Name',
        inputs: [
          {
            name: 'newCategoryName',
            placeholder: '',
            value: categoryName,
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Submit',
            handler: (data) => {
              this.updateCategoryName(categoryName, data.newCategoryName);
            },
          },
        ],
      })
      .then((alertElement) => {
        alertElement.present();
      });
  };
}
