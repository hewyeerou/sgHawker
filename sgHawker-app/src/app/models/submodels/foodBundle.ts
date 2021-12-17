import { FoodItem } from '../foodItem';
import { FoodBundleItem } from './foodBundleItem';

export class FoodBundle {
  _id: string | undefined;
  bundleImgSrc: string | undefined;
  bundleName: string | undefined;
  bundlePrice: number | undefined;
  isPromotion: boolean | undefined;
  foodItems: any[] | undefined;

  constructor(
    bundleImgSrc?: string,
    bundleName?: string,
    bundlePrice?: number,
    isPromotion?: boolean,
    foodItems?: any[]
  ) {
    this.bundleImgSrc = bundleImgSrc;
    this.bundleName = bundleName;
    this.bundlePrice = bundlePrice;
    this.isPromotion = isPromotion;
    this.foodItems = foodItems;
  }
}
