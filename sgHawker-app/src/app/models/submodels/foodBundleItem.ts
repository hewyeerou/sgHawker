import { FoodItem } from '../foodItem';

export class FoodBundleItem {
  foodItem: FoodItem | undefined;
  qty: number | undefined;

  constructor(
    foodItem?: FoodItem,
    qty?: number,
  ) {
    this.foodItem = foodItem;
    this.qty = qty;
  }
}
