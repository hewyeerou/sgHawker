import { Component, Input, OnInit } from '@angular/core';
import { FoodBundle } from '../../models/submodels/foodBundle';

@Component({
  selector: 'app-food-bundle-summary',
  templateUrl: './food-bundle-summary.component.html',
  styleUrls: ['./food-bundle-summary.component.scss'],
})
export class FoodBundleSummaryComponent implements OnInit {

  @Input() foodBundle: FoodBundle;
  available: boolean;

  constructor() { }

  ngOnInit() {
    for(const item of this.foodBundle.foodItems) {
      if (item.itemAvailability === false) {
        this.available = false;
        return;
      }
    }
    this.available = true;
  }

}
