import { OperatingDaysEnum } from './enums/operating-days-enum';
import { FoodItem } from './foodItem';
import { Menu } from './menu';
import { Order } from './order';
import { User } from './user';
import { Wallet } from './wallet';

export class Outlet {
  _id: string | undefined;
  outletName: string | undefined;
  outletAddress: string | undefined;
  businessHrsOption: string | undefined;
  // eslint-disable-next-line @typescript-eslint/member-delimiter-style
  outletOperatingHrs: Array<{ day: OperatingDaysEnum, startTime: Date, endTime: Date, businessStatus: boolean }> | undefined;
  outletContactNumber: string | undefined;
  hawkerCentreName: string | undefined;
  cuisineType: Array<string> | undefined;
  menus: Menu[] | undefined;
  foodItems: FoodItem[] | undefined;
  orders: Order[] | undefined;
  wallet: Wallet | undefined;
  cashbackRate: number | undefined;
  cashbackIsActive: boolean | undefined;
  isDeleted: boolean | undefined;
  hawkerAccount: User | undefined;
  isMaster: boolean | undefined;

  constructor(
    _id?: string,
    outletName?: string,
    outletAddress?: string,
    businessHrsOption?: string,
    outletContactNumber?: string,
    hawkerCentreName?: string,
    cuisineType?: Array<string>,
    menus?: Menu[],
    foodItems?: FoodItem[],
    orders?: Order[],
    wallet?: Wallet,
    cashbackRate?: number,
    cashbackIsActive?: boolean,
    isDeleted?: boolean,
    hawkerAccount?: User,
    isMaster?: boolean
  ) {
    this.foodItems = foodItems;
    this._id = _id;
    this.menus = menus;
    this.outletName = outletName;
    this.outletAddress = outletAddress;
    this.businessHrsOption = businessHrsOption;
    this.outletContactNumber = outletContactNumber;
    this.hawkerCentreName = hawkerCentreName;
    this.cuisineType = cuisineType;
    this.orders = orders;
    this.wallet = wallet;
    this.cashbackIsActive = cashbackIsActive;
    this.cashbackRate = cashbackRate;
    this.isDeleted = isDeleted;
    this.hawkerAccount = hawkerAccount;
    this.isMaster = isMaster;
    
    this.outletOperatingHrs = [
      {
        day: OperatingDaysEnum.MONDAY,
        startTime: new Date(),
        endTime: new Date(),
        businessStatus: true
      },
      {
        day: OperatingDaysEnum.TUESDAY,
        startTime: new Date(),
        endTime: new Date(),
        businessStatus: true
      },
      {
        day: OperatingDaysEnum.WEDNESDAY,
        startTime: new Date(),
        endTime: new Date(),
        businessStatus: true
      },
      {
        day: OperatingDaysEnum.THURSDAY,
        startTime: new Date(),
        endTime: new Date(),
        businessStatus: true
      },
      {
        day: OperatingDaysEnum.FRIDAY,
        startTime: new Date(),
        endTime: new Date(),
        businessStatus: true
      },
      {
        day: OperatingDaysEnum.SATURDAY,
        startTime: new Date(),
        endTime: new Date(),
        businessStatus: true
      },
      {
        day: OperatingDaysEnum.SUNDAY,
        startTime: new Date(),
        endTime: new Date(),
        businessStatus: true
      }
    ];
  }
}
