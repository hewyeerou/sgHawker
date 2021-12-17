import { Component, Input, OnInit } from '@angular/core';
import { PromotionalBundleSummary } from '../../../../models/submodels/promotionalBundleSummary';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-promotions-modal',
  templateUrl: './all-promotions-modal.component.html',
  styleUrls: ['./all-promotions-modal.component.scss'],
})
export class AllPromotionsModalComponent implements OnInit {

  @Input() allPromotionalFoodBundles: PromotionalBundleSummary[];
  outletMap: Map<string, PromotionalBundleSummary[]>;

  constructor(
    private router: Router,
    private modalController: ModalController
  ) {
  }

  ngOnInit() {
    this.outletMap = new Map();
    this.allPromotionalFoodBundles.forEach(bundle => {
      if (this.outletMap.get(bundle.outletName)) {
        this.outletMap.get(bundle.outletName).push(bundle);
      } else {
        const arr = [];
        arr.push(bundle);
        this.outletMap.set(bundle.outletName, arr);
      }
    });
  }

  navigateHawkerStore(outletId) {
    this.dismissModal();
    this.router.navigate(['/customer/home/hawkerOutlets', outletId]);
  }

  dismissModal() {
    this.modalController.dismiss();
  }

}
