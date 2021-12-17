/* eslint-disable no-underscore-dangle */
import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Wallet } from 'src/app/models/wallet';
import { WalletService } from 'src/app/services/wallet.service';
import * as _ from 'lodash';
import { Outlet } from 'src/app/models/outlet';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cashback-modal',
  templateUrl: './cashback-modal.page.html',
  styleUrls: ['./cashback-modal.page.scss'],
})
export class CashbackModalPage implements OnInit {

  @Input() walletId: string;
  @Input() wallet: Wallet;

  availableCashbacks = [];

  // filtering
  selectedCategory: string;
  allFilterCategories: string[];
  originalAvailableCashbacks = [];
  allHawkerStores: string[];
  selectedHawkerStores: Outlet[];
  allHawkerCentres: string[];
  selectedHawkerCentres: string[];

  // sorting
  allSortCategories: string[];
  selectedSortCategory: string;

  constructor(
    public modalController: ModalController,
    private walletService: WalletService,
    private router: Router
  ) {
    this.selectedCategory = 'Default';
    this.allFilterCategories = [];
    this.allFilterCategories.push('Default', 'Hawker Centre', 'Hawker Store');
    this.allHawkerStores = [];
    this.selectedHawkerStores = [];
    this.allHawkerCentres = [];
    this.selectedHawkerCentres = [];

    this.allSortCategories = [];
    this.allSortCategories.push('A-Z', 'Price - Ascending', 'Price - Descending');
    this.selectedSortCategory = 'A-Z';
  }

  ngOnInit() {
    this.availableCashbacks = this.wallet.availableCashBacks;
    this.originalAvailableCashbacks = _.cloneDeep(this.availableCashbacks);

    // get all the hawker stores available
    this.availableCashbacks.map(store => {
      this.allHawkerStores.push(store.outlet);
    });

    // get all the hawker centre available
    this.availableCashbacks.map(store => {
      if (!this.allHawkerCentres.includes(store.outlet.hawkerCentreName)) {
        this.allHawkerCentres.push(store.outlet.hawkerCentreName);
      }
    });
  }

  dismissModal() {
    this.modalController.dismiss({
      dismiss: true
    });
  }

  onChangeSelectedCategory() {
    if (this.selectedCategory === 'Default') {
      this.availableCashbacks = this.originalAvailableCashbacks;
    }
  }

  filterCashbacksByOutlet() {
    this.availableCashbacks = this.originalAvailableCashbacks;

    if (this.selectedHawkerStores.length > 0) {
      const hawkerStoreCashbacks = _.cloneDeep(this.availableCashbacks);

      this.availableCashbacks = hawkerStoreCashbacks.filter(cashback => {
        if (this.selectedHawkerStores.includes(cashback.outlet._id)) {
          return true;
        }
        return false;
      });
    }
  }

  filterCashbacksByHawkerCentres() {
    this.availableCashbacks = this.originalAvailableCashbacks;

    if (this.selectedHawkerCentres.length > 0) {
      const hawkerCentreCashbacks = _.cloneDeep(this.availableCashbacks);

      this.availableCashbacks = hawkerCentreCashbacks.filter(cashback => {
        if (this.selectedHawkerCentres.includes(cashback.outlet.hawkerCentreName)) {
          return true;
        }
        return false;
      });
    }
  }

  sortAllCashbacks() {
    const allCashbacks = _.cloneDeep(this.availableCashbacks);
    if (this.selectedSortCategory === 'A-Z') {
      this.availableCashbacks = allCashbacks.sort((c1, c2) => c1.outlet.outletName.localeCompare(c2.outlet.outletName));
    } else if (this.selectedSortCategory === 'Price - Ascending') {
      this.availableCashbacks = allCashbacks.sort((c1, c2) => c1.cashbackBalance - c2.cashbackBalance);
    } else if (this.selectedSortCategory === 'Price - Descending') {
      this.availableCashbacks = allCashbacks.sort((c1, c2) => c2.cashbackBalance - c1.cashbackBalance);
    }
  }

  navigateHawkerStore(outlet){
    this.dismissModal();
    this.router.navigate(['/customer/home/hawkerOutlets', outlet._id]);
  }

}
