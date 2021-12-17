import { HawkerCenter } from '../../../models/submodels/hawkerCenter';
/* eslint-disable @typescript-eslint/prefer-for-of */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, NavController, ToastController, IonBackButtonDelegate } from '@ionic/angular';
import { FoodBasketService } from '../../../services/food-basket.service';
import { OutletService } from '../../../services/outlet.service';
import { UserService } from 'src/app/services/user.service';
import { SessionService } from 'src/app/services/session.service';
import * as _ from 'lodash';
import { Outlet } from '../../../models/outlet';
import { PromotionalBundleSummary } from '../../../models/submodels/promotionalBundleSummary';
import { AllPromotionsModalComponent } from './all-promotions-modal/all-promotions-modal.component';
import { ModalController } from '@ionic/angular';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-hawker-stores',
  templateUrl: './hawker-stores.page.html',
  styleUrls: ['./hawker-stores.page.scss'],
})
export class HawkerStoresPage implements OnInit {

  @ViewChild(IonBackButtonDelegate, { static: false }) backButton: IonBackButtonDelegate;

  hawkerCenter: HawkerCenter;
  allHawkerStores: Outlet[];
  allPromotionalFoodBundles: PromotionalBundleSummary[];
  tempHawkerStores: Outlet[];
  defaultHawkerStores: Outlet[];
  user: User;

  // search and filter
  allFoodCategories: string[];
  allSortCategories: string[];
  selectedCategory: string;
  searchString: string;
  input = '';
  selectedCategories: string[];

  constructor(private aRoute: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    public navCtrl: NavController,
    private outletService: OutletService,
    public foodBasketService: FoodBasketService,
    private userService: UserService,
    private sessionService: SessionService,
    private modalController: ModalController,
    private route: Router
  ) { }

  ngOnInit() {
    this.user = this.sessionService.getCurrentUser();
    this.hawkerCenter = new HawkerCenter();
    this.hawkerCenter.hawkerCenterName = this.aRoute.snapshot.params.hawkerCentreName;
    this.allFoodCategories = [];
    this.allSortCategories = [];
    this.allPromotionalFoodBundles = [];
    this.allHawkerStores = [];
    this.selectedCategory = '';
    this.selectedCategories = [];
    this.allSortCategories.push('Default', 'A-Z');
    this.outletService
      .findAllHawkerOutletsByHawkerCentre(this.hawkerCenter.hawkerCenterName)
      .subscribe(hawkerStoreArray => {
        this.allHawkerStores = [];
        if (hawkerStoreArray?.length === 0) {
          this.alertController.create({
            message: 'This hawker center has no active outlets!',
            buttons: [{
              text: 'Go back',
              handler: () => {
                this.route.navigateByUrl('/customer/home');
              }
            }]
          }).then(x => x.present());
          return;
        }
        this.hawkerCenter.hawkerCentreAddress = hawkerStoreArray[0].outlet.outletAddress;
        _.forEach(hawkerStoreArray, hawkerStore => {
          this.allHawkerStores.push(hawkerStore.outlet);
          _.forEach(hawkerStore.promotionalFoodBundles, bundle => {
            this.allPromotionalFoodBundles.push(PromotionalBundleSummary.create(bundle, hawkerStore.outlet));
          });
        });

        for (let i = 0; i < this.allHawkerStores.length; i++) {
          const cuisineArray = this.allHawkerStores[i].cuisineType;
          for (let j = 0; j < cuisineArray.length; j++) {
            if (!this.allFoodCategories.includes(cuisineArray[j])) {
              this.allFoodCategories.push(cuisineArray[j]);
            }
          }
        }
        this.tempHawkerStores = [...this.allHawkerStores];
        this.defaultHawkerStores = [...this.allHawkerStores];
      });
  }

  ionViewDidEnter() {
    this.setBackButtonAction();
  }

  isActive(outlet: Outlet): boolean {
    return this.outletService.checkOutletIsActive(outlet);
  }

  async showAllPromotionalBundles() {
    const modal = await this.modalController.create({
      component: AllPromotionsModalComponent,
      componentProps: {
        'allPromotionalFoodBundles': this.allPromotionalFoodBundles
      }
    });
    await modal.present();
  }

  filterCategories() {
    if (this.selectedCategories.length > 0) {
      this.allHawkerStores = this.tempHawkerStores.filter(store => {
        for (let i = 0; i < store.cuisineType.length; i++) {
          if (this.selectedCategories.includes(store.cuisineType[i])) {
            return true;
          }
        }
        return false;
      });
    } else {
      this.allHawkerStores = this.tempHawkerStores;
    }
  }

  searchData(event) {
    this.input = event.target.value.toLowerCase();

    // eslint-disable-next-line arrow-body-style
    const tempHawkerStores = this.tempHawkerStores.filter(item => {
      return item.outletName.toLowerCase().indexOf(this.input) !== -1 ||
        item.outletAddress.toLowerCase().indexOf(this.input) !== -1 ||
        // this.foodItemsSearchMatching(item, this.input) ||
        !this.input;
    });
    if (this.selectedCategories.length === 0) {
      this.allHawkerStores = tempHawkerStores;
    } else {
      this.allHawkerStores = tempHawkerStores.filter(store => {
        for (let i = 0; i < store.cuisineType.length; i++) {
          if (this.selectedCategories.includes(store.cuisineType[i])) {
            return true;
          }
        }
        return false;
      });
    }
  }

  filterByCategory() {
    if (this.selectedCategory === 'Default') {
      this.allHawkerStores = this.defaultHawkerStores;
    } else if (this.selectedCategory === 'A-Z') {
      const filteredString: string[] = [];
      const orderedHawkerStores: any[] = [];
      for (const store of this.allHawkerStores) {
        filteredString.push(store.outletName);
      }
      filteredString.sort();
      while (orderedHawkerStores.length < this.allHawkerStores.length) {
        for (const tempString of filteredString) {
          for (const hawkerStore of this.allHawkerStores) {
            if (hawkerStore.outletName === tempString) {

              orderedHawkerStores.push(hawkerStore);
            }
          }
        }
      }

      this.allHawkerStores = orderedHawkerStores;
    }
  }

  navigateHawkerStore(outlet) {
    if (!this.isActive(outlet)) {
      this.showHawkerClosedAlert();
      this.router.navigate(['/customer/home/hawkerOutlets', outlet._id]);
    } else if (this.foodBasketService.getTotalItems() > 0) { //check whether the user is navigating to another hawker store.
      // const outlet = this.foodBasketService.getOrder().outlet;
      // const navigateToOutlet = this.allHawkerStores.filter(store =>
      //   store.outletId === outletId)[0];
      // if (outlet.hawkerCentreName !== this.hawkerCentreName ||
      //   outlet.outletName !== navigateToOutlet.outletName) {
      // if (true) { //replace with above condition once actual order is created
      //   this.confirmNaviagateToNewHawker(outletId);
      // } else {
      this.router.navigate(['/customer/home/hawkerOutlets', outlet._id]);
      // }
    } else {
      this.router.navigate(['/customer/home/hawkerOutlets', outlet._id]);
    }
  }

  addFavouriteHawkerStore(hawkerStoreId) {
    if (!this.isFavourited(hawkerStoreId)) {
      this.userService
        .addUserFavouriteStore(this.user._id, hawkerStoreId)
        .subscribe(
          updatedUser => {
            this.sessionService.setCurrentUser(updatedUser);
            this.presentAlert('Success', 'Added to favourites!');
            this.ngOnInit();
          },
          error => {
            this.presentAlert('Hmm..something went wrong', 'Cannot add to favourites');
          }
        );
    } else {
      this.presentAlert('Error', 'Already Added to Favourites');
    }
  }

  async presentAlert(header, message) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
        },
      ],
    });
    await alert.present();
  }

  async showHawkerClosedAlert() {
    const alert = await this.alertController.create({
      header: 'The store is closed now. You can view the items, but cannot add any items to your cart.',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
        }
      ]
    });

    await alert.present();
  }

  isFavourited(hawkerStoreName) {
    for (const id in this.user?.favouriteHawkerStores) {
      if (hawkerStoreName === this.user.favouriteHawkerStores[id]) {
        return true;
      }
    }
  }

  async confirmNaviagateToNewHawker(outletId) {
    let confirmMessage = 'You cart contains items from another outlet. ';
    confirmMessage += 'Going to another hawker store will empty your cart. Click OK to confirm.';
    const confirmPrompt = this.alertController.create({
      message: confirmMessage,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.foodBasketService.clearBasket();
            this.router.navigate(['/customer/home/hawkerOutlets', outletId]);
          }
        },
        {
          text: 'Back',
          role: 'cancel'
        },
      ]
    });
    (await confirmPrompt).present();
  }

  async confirmExitHawkerDetailsPage() {
    let confirmMessage = 'You cart contains items from an outlet in this hawker centre. ';
    confirmMessage += 'Exiting this page will empty your cart. Click OK to confirm.';
    const confirmPrompt = this.alertController.create({
      message: confirmMessage,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.foodBasketService.clearBasket();
            this.navCtrl.navigateBack('/customer/home');
          }
        },
        {
          text: 'Back',
          role: 'cancel'
        },
      ]
    });
    (await confirmPrompt).present();
  }

  setBackButtonAction() {
    this.backButton.onClick = () => {
      if (this.foodBasketService.getTotalItems() > 0) {
        this.confirmExitHawkerDetailsPage();
      } else {
        this.navCtrl.navigateBack('/customer/home');
      }
    };
  }

  navigateToCart() {
    this.router.navigate(['/customer/activity/cart']);
  }

}
