import { newArray } from '@angular/compiler/src/util';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, IonSelect, ModalController, PopoverController, ToastController } from '@ionic/angular';
import { FoodItem } from 'src/app/models/foodItem';
import { Outlet } from 'src/app/models/outlet';
import { Customization } from 'src/app/models/submodels/customization';
import { User } from 'src/app/models/user';
import { FoodItemService } from 'src/app/services/food-item.service';
import { MenuService } from 'src/app/services/menu.service';
import { OutletService } from 'src/app/services/outlet.service';
import { SessionService } from 'src/app/services/session.service';
import { CustomizationPage } from '../customization/customization.page';
import { EditCustomizationPage } from '../edit-customization/edit-customization.page';

class Category {
  public id: number;
  public name: string;
}

@Component({
  selector: 'app-create-food-item',
  templateUrl: './create-food-item.page.html',
  styleUrls: ['./create-food-item.page.scss'],
})
export class CreateFoodItemPage implements OnInit {
  baseUrl = '/api';

  categoryValue: string;
  foodItem: FoodItem;

  categories: string[];
  selectedCategory: string;

  outlets: Outlet[];
  outlet: Outlet;

  user: User;
  errorMsg: string;

  fileImage: File;
  fileURL: string | ArrayBuffer;
  imageExist: boolean = false;

  customizationArr: Customization[];

  formValid: boolean;

  constructor(public modalController: ModalController, public formBuilder: FormBuilder,
    public outletService: OutletService, public sessionService: SessionService,
    public foodItemService: FoodItemService, public alertController: AlertController,
    private router: Router, public menuService: MenuService, public toastController: ToastController) {

    this.foodItem = new FoodItem();
    this.categories = [];
    this.selectedCategory = undefined;
    this.fileURL = this.baseUrl + '/public/static/default-fooditem.jpeg';
  }

  ngOnInit() {
    this.user = this.sessionService.getCurrentUser();
    this.customizationArr = [];
    const hawkerId = this.sessionService.getCurrentUser()._id;

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    // this.outletService.getHawkerOutlets(hawkerId).subscribe(
    //   allOutlet => {
    //     this.outlets = allOutlet;
    //     this.outlet = allOutlet[0];
    //     this.retrieveCategories(this.outlet._id);
    //   }
    // ),
    //   async (error) => {
    //     const toast = await this.toastController.create({
    //       message: 'Could not retrieve outlet: ' + error,
    //       duration: 2000
    //     });
    //     toast.present();
    //   };
    this.outlet = this.sessionService.getCurrentOutlet();
    this.retrieveCategories();

  }

  retrieveCategories() {
    this.menuService.retrieveAllUniqueFoodCategories(this.outlet._id).subscribe(
      success => {
        this.categories = success;
      },
      error => {
        this.errorMsg = error;
      }
    );
  }

  // onClickOutlet(outlet) {
  //   this.retrieveCategories(outlet[0]._id);
  // }

  checkFormValid() {
    if (this.foodItem.itemName === undefined || this.foodItem.itemPrice === undefined || this.foodItem.itemDescription === undefined
      || this.outlet === undefined || this.selectedCategory === undefined) {
      this.formValid = false;
      return;
    }
    this.formValid = true;
  }

  imgUpload(foodItemId, file) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.foodItemService.uploadFoodItemPicture(foodItemId, file).subscribe(
      uploadedImage => {
      }
    ),
      async (error) => {
        const toast = await this.toastController.create({
          message: 'Could not upload FoodItem image: ' + error,
          duration: 2000
        });
        toast.present();
      };
  }

  onFileChange(event) {
    this.fileImage = event.target.files[0];
    var fileReader = new FileReader();
    fileReader.readAsDataURL(event.target.files[0]);
    fileReader.onload = () => {
      this.fileURL = fileReader.result.toString();
      this.imageExist = true;
    };
  }

  createFoodItem = () => {
    this.checkFormValid();
    if (this.formValid) {
      this.foodItem.itemCustomizations = this.customizationArr;
      this.foodItem.outlet = this.outlet;
      this.foodItem.itemCategory = this.selectedCategory;
      this.foodItem.itemAvailability = true;
      this.foodItem.itemImageSrc = 'public/static/default-fooditem.jpeg';

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      this.foodItemService.createFoodItem(this.foodItem).subscribe(
        createdFoodItem => {
          if (this.fileImage) {
            this.imgUpload(createdFoodItem._id, this.fileImage);
          }
          this.alertController.create({
            cssClass: '',
            header: 'Success',
            message: 'Food Item has been created',
            buttons: [
              {
                text: 'OK',
                role: 'OK',
                handler: () => {
                  this.foodItem = new FoodItem();
                  this.selectedCategory = '';
                  this.fileImage = null;
                  this.fileURL = this.baseUrl + '/public/static/default-fooditem.jpeg';
                  this.customizationArr = [];
                  this.imageExist = false;
                  this.router.navigate(['/hawker/menus/view-all-food-item']);
                }
              }
            ]
          }).then(alertElement => {
            alertElement.present();

          });
        }
      ),
        (error) => {
          this.alertController
            .create({
              header: 'Hmm..something went wrong',
              message: 'Unable to create Food Item: ' + error,
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
        };

    } else {
      this.alertController
        .create({
          header: 'Unable to submit',
          message: 'Please ensure to submit a completed form.',
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
  };

  async customization() {
    const modalCustomization = await this.modalController.create({
      component: CustomizationPage,
      cssClass: 'my-custom-class'
    });

    modalCustomization.onDidDismiss().then((data) => {
      if (data.data !== undefined) {
        this.customizationArr.push(data.data);
      }
    });

    return await modalCustomization.present();
  }

  async removeOption(i) {
    this.customizationArr.splice(i, 1);
  }

  async viewCustomization(j) {
    const viewCustomisationModal = await this.modalController.create({
      component: EditCustomizationPage,
      cssClass: 'my-custom-class',
      componentProps: {
        'customization': this.customizationArr[j]
      }
    });

    return await viewCustomisationModal.present();
  }

  updateCategoryName = (oldCategoryName, newCategoryName) => {
    this.menuService.updateCategoryName(this.outlet._id, oldCategoryName, newCategoryName).subscribe(
      success => {
        this.categories = this.categories.map(name => (name === oldCategoryName) ? newCategoryName : name);
        this.selectedCategory = newCategoryName;
      },
      error => {
      }
    );
  };

  updateCategoryNameCallback = (categoryName) => {
    const alert = this.alertController.create({
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
          handler: data => {
            this.updateCategoryName(categoryName, data.newCategoryName);
          }
        }
      ],
    }).then((alertElement) => {
      alertElement.present();
    });
  };

}
