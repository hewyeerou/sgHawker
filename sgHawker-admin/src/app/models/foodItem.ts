import { Customization } from './submodels/customization';
import { Menu } from './menu';
import { Outlet } from './outlet';

export class FoodItem {
  _id: string | undefined;
  itemName: string | undefined;
  itemDescription: string | undefined;
  itemPrice: number | undefined;
  itemImageSrc: string | undefined;
  itemAvailability: boolean | undefined;
  itemCategory: string | undefined;
  outlet: Outlet | undefined;
  menus: Menu[] | undefined;
  itemCustomizations: Customization[] | undefined;

  constructor(
    _id?: string,
    itemName?: string,
    itemDescription?: string,
    itemPrice?: number,
    itemImageSrc?: string,
    itemAvailability?: boolean,
    itemCategory?: string,
    outlet?: Outlet,
    menus?: Menu[],
    itemCustomizations?: Customization[],
  ) {
    this._id = _id;
    this.itemAvailability = itemAvailability;
    this.itemCategory = itemCategory;
    this.itemCustomizations = itemCustomizations;
    this.itemDescription = itemDescription;
    this.itemImageSrc = itemImageSrc;
    this.itemName = itemName;
    this.itemPrice = itemPrice;
    this.menus = menus;
    this.outlet = outlet;
  }
}
