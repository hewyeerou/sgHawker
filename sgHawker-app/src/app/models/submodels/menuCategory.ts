import { FoodItem } from '../foodItem';

export class MenuCategory {
  _id: string | undefined;
  categoryName: string | undefined;
  foodItems: FoodItem[] | undefined;

  constructor(
    _id?: string,
    categoryName?: string,
    foodItems?: FoodItem[]
  ) {
    this._id = _id;
    this.categoryName = categoryName;
    this.foodItems = foodItems;
  }
}
