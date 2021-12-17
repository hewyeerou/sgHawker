import { FoodItem } from './foodItem';
import { Outlet } from './outlet';
import { FoodBundle } from './submodels/foodBundle';
import { MenuCategory } from './submodels/menuCategory';

export class Menu {
  _id: string | undefined;
  menuName: string | undefined;
  activeMenu: boolean | undefined;
  foodItems: FoodItem[] | undefined;
  menuCategories: MenuCategory[] | undefined;
  foodBundles: FoodBundle[] | undefined;
  outlet: Outlet | undefined;

  constructor(
    _id?: string,
    menuName?: string,
    activeMenu?: boolean,
    foodItems?: FoodItem[],
    menuCategories?: MenuCategory[],
    foodBundles?: FoodBundle[],
    outlet?: Outlet,
  ) {
    // eslint-disable-next-line no-underscore-dangle
    this._id = _id;
    this.menuCategories = menuCategories;
    this.menuName = menuName;
    this.activeMenu = activeMenu;
    this.foodBundles = foodBundles;
    this.foodItems = foodItems;
    this.outlet = outlet;
  }
}
