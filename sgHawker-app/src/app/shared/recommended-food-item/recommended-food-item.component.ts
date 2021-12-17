import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FoodItem } from '../../models/foodItem';
@Component({
  selector: 'app-=recommended-food-item',
  templateUrl: './recommended-food-item.component.html',
  styleUrls: ['./recommended-food-item.component.scss'],
})
export class RecommendedFoodItemComponent {

  @Input() foodItem: FoodItem;

  baseUrl = '/api/';

  constructor(
  ) { }

  imgSrc(dataSrc) {
    return this.baseUrl + dataSrc;
  }

}
