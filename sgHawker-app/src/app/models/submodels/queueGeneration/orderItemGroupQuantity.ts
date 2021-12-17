import { FoodItem } from '../../foodItem';

export class OrderItemGroupQuantity {

  // _id?: string;
  foodItem?: FoodItem;
  quantity?: number;

  constructor(
    // _id?: string,
    foodItem?: FoodItem,
    quantity?: number
  ) {
    // this._id = _id;
    this.foodItem = foodItem;
    this.quantity = quantity;
  }
}
