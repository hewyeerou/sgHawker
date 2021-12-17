import { Component, Input, OnInit } from '@angular/core';
import { Order } from '../../models/order';

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.scss'],
})
export class OrderSummaryComponent implements OnInit {

  @Input() order: Order;

  constructor() { }

  ngOnInit() {
  }

  getTotalOrderItems() {
    const foodBundleItems = this.order.foodBundleOrderItems? this.order.foodBundleOrderItems.length : 0;
    const indiOrderItems = this.order.individualOrderItems? this.order.individualOrderItems.length : 0;
    return foodBundleItems + indiOrderItems;
  }

}
