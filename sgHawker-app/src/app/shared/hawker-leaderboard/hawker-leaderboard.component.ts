import { LeaderboardService } from 'src/app/services/leaderboard.service';
import { Component, Input, OnInit } from '@angular/core';
import {
  AlertController,
  ModalController,
  PopoverController,
} from '@ionic/angular';
import { HawkerLeaderboardFilterModalPage } from '../hawker-leaderboard-filter-modal/hawker-leaderboard-filter-modal.page';
import { AccountTypeEnum } from 'src/app/models/enums/account-type-enum.enum';
import { HawkerCenter } from 'src/app/models/submodels/hawkerCenter';
import { LeaderboardViewTypeEnum } from 'src/app/models/enums/leaderboard-view-enum.enum';
import { LeaderboardTimeFramesTypeEnum } from 'src/app/models/enums/leaderboard-time-frames-enum.enum';
import * as _ from 'lodash';
import { LeaderboardValueTypeEnum } from 'src/app/models/enums/leaderboard-value-type-enum.enum';
import { User } from 'src/app/models/user';
import { SessionService } from 'src/app/services/session.service';
import { Router } from '@angular/router';
import { Outlet } from 'src/app/models/outlet';
import { OutletService } from 'src/app/services/outlet.service';

export interface HawkerLeaderboardModel {
  _id: string;
  outletName: string;
  outletPic: string;
  hawkerCentreName: string;
  numOfSales: number;
}

export interface FoodItemLeaderboardModel {
  _id: string;
  foodItemName: string;
  itemImageSrc: string;
  outletName: string;
  outletType: string[];
  hawkerCentre: string;
  numOfSales: number;
}

export interface HawkerCentreLeaderboardModel {
  hawkerCentreName: string;
  numOfSales: number;
}

export interface HawkerCentreAndCuisineTypes {
  hawkerCentreName: string;
  cuisineTypes: string[];
}

@Component({
  selector: 'hawker-leaderboard',
  templateUrl: './hawker-leaderboard.component.html',
  styleUrls: ['./hawker-leaderboard.component.scss'],
})
export class HawkerLeaderboardComponent implements OnInit {
  @Input() leaderboardService: LeaderboardService;
  baseUrl = '/api';
  user: User;
  userType;
  allHawkers: HawkerLeaderboardModel[];
  allFoodItems: FoodItemLeaderboardModel[];

  allHawkerCentres: HawkerCentreLeaderboardModel[];
  allHawkerCentresAndCuisineTypes: HawkerCentreAndCuisineTypes[];

  // Filter items
  pCurrentView: LeaderboardViewTypeEnum = LeaderboardViewTypeEnum.HAWKERS;
  pValueType: LeaderboardValueTypeEnum = LeaderboardValueTypeEnum.SALES;
  pHawkerCentre: HawkerCenter = null;
  pTimeFrame: LeaderboardTimeFramesTypeEnum = null;
  pCuisineType: string = null;

  constructor(
    public modalController: ModalController,
    public sessionService: SessionService,
    private router: Router,
    private alertController: AlertController,
    private outletService: OutletService
  ) {
    this.allHawkers = [];
    this.allFoodItems = [];
    this.allHawkerCentres = [];
  }

  ngOnInit() {
    //NEED TO DECIDE ON DEFAULT VIEW
    this.user = this.sessionService.getCurrentUser();
    this.userType = this.user.accountType;
    this.findNumOfSalesForAllHawkers();
    this.findAllHawkerCentresAndCuisineTypes();
  }

  ionViewWillEnter() {
    //NEED TO DECIDE ON DEFAULT VIEW
    this.findNumOfSalesForAllHawkers();
  }

  //FIND ALL HAWKERS
  findNumOfSalesForAllHawkers() {
    this.leaderboardService
      .findNumOfSalesForAllHawkers()
      .subscribe((retrievedResult) => {
        this.allHawkers = this.pHawkerCentre
          ? retrievedResult.filter(
            (hc) => hc.hawkerCentreName === this.pHawkerCentre
          )
          : retrievedResult;
        this.groupByAndAssignToAllHawkerCentres(retrievedResult);
      });
  }

  groupByAndAssignToAllHawkerCentres(allHawkers) {
    this.allHawkerCentres = _(allHawkers)
      .groupBy((h) => h.hawkerCentreName)
      .map((hawkers, id) => ({
        hawkerCentreName: id,
        numOfSales: _.sumBy(hawkers, (hawker) => hawker.numOfSales),
      }))
      .value();

    this.allHawkerCentres.sort((a, b) => b.numOfSales - a.numOfSales);
  }

  findAllHawkerCentresAndCuisineTypes() {
    this.leaderboardService
      .findAllHawkerCentresAndCuisineTypes()
      .subscribe((retrievedResult) => {
        this.allHawkerCentresAndCuisineTypes = retrievedResult;
      });
  }

  navigateHawkerStore(selectedItem) {
    if (this.userType === 'CUSTOMER') {
      this.outletService.getAllHawkerOutlets().subscribe((outlets) => {
        outlets.forEach((outlet) => {
          if (outlet.outletName === selectedItem.outletName) {
            this.router.navigate(['/customer/home/hawkerOutlets', outlet._id]);
          }
        });
      });
    }
  }

  navigateHawkerCentreDetails(hawkerCentreName) {
    if (this.userType === 'CUSTOMER') {
      this.router.navigate(['/customer/home', hawkerCentreName]);
    }
  }

  isActive(outlet: Outlet): boolean {
    return this.outletService.checkOutletIsActive(outlet);
  }

  async showFilterModal() {
    const allHawkerCentres = this.allHawkerCentresAndCuisineTypes.map(
      (x) => x.hawkerCentreName
    );
    const allCuisineTypes = [
      ...new Set(
        this.allHawkerCentresAndCuisineTypes.flatMap((x) => x.cuisineTypes)
      ),
    ];
    const modal = await this.modalController.create({
      component: HawkerLeaderboardFilterModalPage,
      cssClass: '',
      componentProps: {
        userType: this.userType,
        allHawkerCentres,
        allCuisineTypes,
        pValueType: this.pValueType,
        pCurrentView: this.pCurrentView,
        pHawkerCentre: this.pHawkerCentre,
        pTimeFrame: this.pTimeFrame,
        pCuisineType: this.pCuisineType,
      },
    });

    modal.onDidDismiss().then((data) => {
      const modalData = data.data;
      if (modalData !== undefined) {
        this.pCurrentView = modalData.pCurrentView;
        this.pValueType = modalData.pValueType;
        this.pHawkerCentre = modalData.pHawkerCentre;
        this.pTimeFrame = modalData.pTimeFrame;
        this.pCuisineType = modalData.pCuisineType;
        //NUMOFSALES
        if (this.pValueType === LeaderboardValueTypeEnum.SALES) {
          //FOOD ITEM
          if (this.pCurrentView === LeaderboardViewTypeEnum.FOOD_ITEMS) {
            //To change according to HawkerCentre
            this.findNumOfSalesForAllFoodItemWithFilter(
              this.pTimeFrame,
              this.pCuisineType,
              this.pHawkerCentre
            );
          }
          //HAWKERS IN X HAWKER CENTRE
          if (this.pCurrentView === LeaderboardViewTypeEnum.HAWKERS) {
            if (this.pTimeFrame !== null) {
              this.findNumOfSalesForAllHawkersPastDays(this.pTimeFrame);
            } else {
              this.findNumOfSalesForAllHawkers();
            }
          }
          //HAWKER CENTRES
          if (this.pCurrentView === LeaderboardViewTypeEnum.HAWKER_CENTRES) {
            if (this.pTimeFrame !== null) {
              this.findNumOfSalesForAllHawkersPastDays(this.pTimeFrame);
            } else {
              this.findNumOfSalesForAllHawkers();
            }
          }

          //FAVOURITES
        } else {
          this.pTimeFrame = null;
          // HAWKERS
          if (this.pCurrentView === LeaderboardViewTypeEnum.HAWKERS) {
            //To change according to HawkerCentre
            this.findNumOfFavouritesForAllHawkers(this.pHawkerCentre);
          }

          if (this.pCurrentView === LeaderboardViewTypeEnum.HAWKER_CENTRES) {
            this.findNumOfFavouritesForAllHawkerCentres();
          }
        }
      }
    });
    return await modal.present();
  }

  async showHawkerClosedAlert() {
    const alert = await this.alertController.create({
      header:
        'The store is closed now. You can view the items, but cannot add any items to your cart.',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
        },
      ],
    });

    await alert.present();
  }

  get viewName() {
    let viewName;
    if (this.pCurrentView === LeaderboardViewTypeEnum.HAWKERS) {
      viewName = 'Leaderboard for Hawkers';
    } else if (this.pCurrentView === LeaderboardViewTypeEnum.HAWKER_CENTRES) {
      viewName = 'Leaderboard for Hawker Centres';
    } else if (this.pCurrentView === LeaderboardViewTypeEnum.FOOD_ITEMS) {
      viewName = 'Leaderboard for Food Items';
    }
    return viewName;
  }

  get filterItemStrings() {
    const arr = [];
    if (this.pValueType) {
      arr.push('Leaderboard Type: ' + this.pValueType);
    }
    if (this.pTimeFrame) {
      const timeFrame = this.pTimeFrame
        .toLowerCase()
        .replace('_', ' ')
        .replace('_', ' ');
      arr.push(timeFrame);
    }
    if (this.pHawkerCentre) {
      arr.push('Hawker Centre: ' + this.pHawkerCentre);
    }
    if (this.pCuisineType) {
      arr.push('Cuisine: ' + this.pCuisineType);
    }
    return arr;
  }

  //FIND ALL HAWKERS WITH ONLY TIME FILTER
  findNumOfSalesForAllHawkersPastDays(
    timeFrame: LeaderboardTimeFramesTypeEnum
  ) {
    let numOfDays;

    if (timeFrame === LeaderboardTimeFramesTypeEnum.LAST_7_DAYS) {
      numOfDays = 7;
    } else if (timeFrame === LeaderboardTimeFramesTypeEnum.LAST_30_DAYS) {
      numOfDays = 30;
    } else if (timeFrame === LeaderboardTimeFramesTypeEnum.LAST_60_DAYS) {
      numOfDays = 60;
    }

    this.leaderboardService
      .findNumOfSalesForAllHawkersForPastDays(numOfDays)
      .subscribe((retrievedResult) => {
        this.allHawkers = this.pHawkerCentre
          ? retrievedResult.filter(
            (hc) => hc.hawkerCentreName === this.pHawkerCentre
          )
          : retrievedResult;
        this.groupByAndAssignToAllHawkerCentres(retrievedResult);
      });
  }

  findNumOfSalesForAllHawkerCentresPastDays(
    timeFrame: LeaderboardTimeFramesTypeEnum
  ) {
    let numOfDays;

    if (timeFrame === LeaderboardTimeFramesTypeEnum.LAST_7_DAYS) {
      numOfDays = 7;
    } else if (timeFrame === LeaderboardTimeFramesTypeEnum.LAST_30_DAYS) {
      numOfDays = 30;
    } else if (timeFrame === LeaderboardTimeFramesTypeEnum.LAST_60_DAYS) {
      numOfDays = 60;
    }

    this.leaderboardService
      .findNumOfSalesForAllHawkersForPastDays(numOfDays)
      .subscribe((retrievedResult) => {
        this.allHawkers = this.pHawkerCentre
          ? retrievedResult.filter(
            (hc) => hc.hawkerCentreName === this.pHawkerCentre
          )
          : retrievedResult;
      });
  }

  //FIND ALL FOODITEM
  findNumOfSalesForAllFoodItems() {
    this.leaderboardService
      .findNumOfSalesForAllFoodItem()
      .subscribe((retrievedResult) => {
        this.allFoodItems = retrievedResult;
      });
  }

  //FIND ALL FOODITEM WITH ONLY TIME FILTER
  findNumOfSalesForAllFoodItemsPastDays(numOfDays: number) {
    this.leaderboardService
      .findNumOfSalesForAllFoodItemForPastDays(numOfDays)
      .subscribe((retrievedResult) => {
        this.allFoodItems = retrievedResult;
      });
  }

  //FIND ALL FOODITEM WITH HAWKER CENTER FILTER, HAWKER TYPE FILTER AND TIME FILTER
  findNumOfSalesForAllFoodItemWithFilter(
    timeFrame: LeaderboardTimeFramesTypeEnum,
    hawkerType: string,
    hawkerCentre
  ) {
    let numOfDays;

    if (timeFrame === LeaderboardTimeFramesTypeEnum.LAST_7_DAYS) {
      numOfDays = 7;
    } else if (timeFrame === LeaderboardTimeFramesTypeEnum.LAST_30_DAYS) {
      numOfDays = 30;
    } else if (timeFrame === LeaderboardTimeFramesTypeEnum.LAST_60_DAYS) {
      numOfDays = 60;
    } else {
      numOfDays = null;
    }

    if (numOfDays === null && hawkerType === null && hawkerCentre === null) {
      this.findNumOfSalesForAllFoodItems();
      return;
    }
    if (numOfDays !== null && hawkerType === null && hawkerCentre === null) {
      this.findNumOfSalesForAllFoodItemsPastDays(numOfDays);
      return;
    }
    if (numOfDays !== null) {
      this.leaderboardService
        .findNumOfSalesForAllFoodItemForPastDays(numOfDays)
        .subscribe((retrievedResult) => {
          let result = retrievedResult;
          if (!(hawkerCentre === '' || hawkerCentre === null)) {
            result = result.filter((x) => x.hawkerCentre === hawkerCentre);
          }
          if (!(hawkerType === '' || hawkerType === null)) {
            result = result.filter((x) => x.outletType.includes(hawkerType));
          }
          this.allFoodItems = result;
        });
      return;
    } else {
      this.leaderboardService
        .findNumOfSalesForAllFoodItem()
        .subscribe((retrievedResult) => {
          let result = retrievedResult;
          if (!(hawkerCentre === '' || hawkerCentre === null)) {
            result = result.filter((x) => x.hawkerCentre === hawkerCentre);
          }
          if (!(hawkerType === '' || hawkerType === null)) {
            result = result.filter((y) => y.outletType.includes(hawkerType));
          }
          this.allFoodItems = result;
        });
      return;
    }
  }

  findNumOfFavouritesForAllHawkers(hawkerCentre) {
    this.leaderboardService
      .findNumOfFavouritesForAllHawkers()
      .subscribe((retrievedResult) => {
        let result = retrievedResult;
        if (!(hawkerCentre === '' || hawkerCentre === null)) {
          result = result.filter((x) => x.hawkerCentreName === hawkerCentre);
        }
        this.allHawkers = result;
      });
  }

  findNumOfFavouritesForAllHawkerCentres() {
    this.leaderboardService
      .findNumOfFavouritesForAllHawkersCentres()
      .subscribe((retrievedResult) => {
        //Assign to hawker centre variables
        this.allHawkerCentres = retrievedResult;
      });
  }
}
