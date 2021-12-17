import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FoodItem } from '../../models/foodItem';

@Component({
  selector: 'app-food-item-summary',
  templateUrl: './food-item-summary.component.html',
  styleUrls: ['./food-item-summary.component.scss'],
})
export class FoodItemSummaryComponent {

  @Input() foodItem: FoodItem;

  baseUrl = '/api/';

  constructor(
  ) { }

  imgSrc(dataSrc) {
    return this.baseUrl + dataSrc;
  }

}
