/* eslint-disable no-underscore-dangle */
/* eslint-disable guard-for-in */
/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { OutletService } from '../../../services/outlet.service';
import { UserService } from 'src/app/services/user.service';
import { SessionService } from 'src/app/services/session.service';
import { FoodBasketService } from 'src/app/services/food-basket.service';
import * as _ from 'lodash';
import { HawkerCenter } from '../../../models/submodels/hawkerCenter';
import { User } from 'src/app/models/user';
import { HawkerStore } from 'src/app/models/submodels/hawkerStore';
import { AlertController } from '@ionic/angular';
import { Outlet } from 'src/app/models/outlet';

@Component({
  selector: 'app-favourites',
  templateUrl: './favourites.page.html',
  styleUrls: ['./favourites.page.scss'],
})
export class FavouritesPage implements OnInit {

  allHawkerCentres: HawkerCenter[];
  favouriteHawkerCentres: HawkerCenter[];
  tempHawkerCentres: HawkerCenter[];
  allHawkerStores: Outlet[];
  favouriteHawkerStores: Outlet[];
  tempHawkerStores: Outlet[];
  input: string;
  user: User;
  segmentModel: string;
  tempModel: string;

  allCentreCategories: string[];
  selectedCentreCategories: string[];
  allStoreCategories: string[];
  selectedStoreCategories: string[];

  constructor(
    private router: Router,
    private outletService: OutletService,
    private userService: UserService,
    private sessionService: SessionService,
    private foodBasketService: FoodBasketService,
    public alertController: AlertController,
  ) { }

  ngOnInit() {
    this.user = this.sessionService.getCurrentUser();
    this.favouriteHawkerCentres = [];
    this.favouriteHawkerStores = [];
    if(this.tempModel !== undefined){
      this.segmentModel = this.tempModel;
    }else{
      this.segmentModel = 'centres';
    }

    this.outletService.getAllHawkerOutlets().subscribe(hawkerStoreArray => {
      const storeSet = new Set();
      this.allHawkerStores = hawkerStoreArray;
      for(const id in this.user.favouriteHawkerStores){
        for(const varId in this.allHawkerStores){
          if (this.allHawkerStores[varId]._id === this.user.favouriteHawkerStores[id]){
            this.favouriteHawkerStores.push(this.allHawkerStores[varId]);
          }
        }
      }

      this.tempHawkerStores = this.favouriteHawkerStores;
      _.forEach(this.favouriteHawkerStores, hawkerStore => {
        _.forEach(hawkerStore.cuisineType, type => {
          storeSet.add(type);
        });
      });
      this.allStoreCategories = Array.from(storeSet) as string[];
    });

    this.outletService.findAllHawkerCenters().subscribe(hawkerCenterArray => {
      const centreSet = new Set();
      this.allHawkerCentres = hawkerCenterArray;
      for(const id in this.user.favouriteHawkerCentres){
        for(const varId in this.allHawkerCentres){
          if(this.allHawkerCentres[varId].hawkerCenterName === this.user.favouriteHawkerCentres[id]){
            this.favouriteHawkerCentres.push(this.allHawkerCentres[varId]);
          }
        }
      }
      this.tempHawkerCentres = this.favouriteHawkerCentres;
      _.forEach(this.favouriteHawkerCentres, hawkerCenter => {
        _.forEach(hawkerCenter.cuisineTypes, type => {
          centreSet.add(type);
        });
      });
      this.allCentreCategories = Array.from(centreSet)  as string[];
    });
  }


  filterCentreCategories(){
    if (!this.selectedCentreCategories || this.selectedCentreCategories.length <= 0) {
      this.favouriteHawkerCentres = this.tempHawkerCentres;
      return;
    }
    this.favouriteHawkerCentres = this.filterCentreCategory(this.tempHawkerCentres);
  }

  private filterCentreCategory(source: HawkerCenter[]) {
    if (!this.selectedCentreCategories || this.selectedCentreCategories.length === 0) {
      return source;
    }
    return _.filter(source, centre => {
      let hasCategory = false;
      _.forEach(centre.cuisineTypes, type => {
        if (this.selectedCentreCategories.includes(type)) {
          hasCategory = true;
        }
      });
      return hasCategory;
    });
  }

  filterStoreCategories(){
    if (!this.selectedStoreCategories || this.selectedStoreCategories.length <= 0) {
      this.favouriteHawkerStores = this.tempHawkerStores;
      return;
    }
    this.favouriteHawkerStores = this.filterStoreCategory(this.tempHawkerStores);
  }

  private filterStoreCategory(source: Outlet[]) {
    if (!this.selectedStoreCategories || this.selectedStoreCategories.length === 0) {
      return source;
    }
    return _.filter(source, store => {
      let hasCategory = false;
      _.forEach(store.cuisineType, type => {
        if (this.selectedStoreCategories.includes(type)) {
          hasCategory = true;
        }
      });
      return hasCategory;
    });
  }

  isActive(outlet: Outlet): boolean {
    return this.outletService.checkOutletIsActive(outlet);
  }

  searchCentreData(event) {
    this.favouriteHawkerCentres = this.filterCentreCategory(this.tempHawkerCentres);

    this.input = event.target.value.toLowerCase();
    this.favouriteHawkerCentres =
     _.filter(this.favouriteHawkerCentres, centre => centre.hawkerCenterName.toLowerCase().includes(this.input));
  }

  searchStoreData(event) {
    this.favouriteHawkerStores = this.filterStoreCategory(this.tempHawkerStores);

    this.input = event.target.value.toLowerCase();
    this.favouriteHawkerStores =
     _.filter(this.favouriteHawkerStores, store => store.outletName.toLowerCase().includes(this.input));
  }

  navigateHawkerCentreDetails(hawkerCentreName) {
    this.router.navigate(['/customer/home', hawkerCentreName]);
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

  noCategoryAlert(){
    this.presentAlert('Oops', 'There are no categories!');
  }

  removeFavouriteHawkerCentre(hawkerCentreName) {
    this.userService
      .removeUserFavouriteCentre(this.user._id, hawkerCentreName)
      .subscribe(
        updatedUser => {
            this.sessionService.setCurrentUser(updatedUser);
            this.presentAlert('Success', 'Removed from favourites!');
            this.tempModel = 'centres';
            this.ngOnInit();
        },
        error => {
          this.presentAlert('Hmm..something went wrong','Cannot add to favourites');
        }
      );
  }

  removeFavouriteHawkerStore(hawkerStoreId) {
    this.userService
      .removeUserFavouriteStore(this.user._id, hawkerStoreId)
      .subscribe(
        updatedUser => {
            this.sessionService.setCurrentUser(updatedUser);
            this.presentAlert('Success', 'Removed from favourites!');
            this.tempModel = 'stores';
            this.ngOnInit();
        },
        error => {
          this.presentAlert('Hmm..something went wrong','Cannot add to favourites');
        }
      );
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

}


