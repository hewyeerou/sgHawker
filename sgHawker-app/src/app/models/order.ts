import { OrderStatusEnum } from './enums/order-status-enum.enum';
import { OrderTypeEnum } from './enums/order-type-enum.enum';
import { PaymentTypeEnum } from './enums/payment-type-enum.enum';
import { Outlet } from './outlet';
import { BundleOrderItem } from './submodels/bundleOrderItem';
import { OrderItem } from './submodels/orderItem';
import { User } from './user';

export class Order {
  _id: string | undefined;
  orderCreationTime: Date | undefined;
  orderPickUpTime: Date | undefined;
  completedTime: Date | undefined;
  estimatedTimeTillCompletion: number | undefined;
  totalPrice: number | undefined;
  debitedCashback: number | undefined;
  creditedCashback: number | undefined;
  orderType: OrderTypeEnum | undefined;
  paymentType: PaymentTypeEnum | undefined;
  orderStatus: OrderStatusEnum | undefined;
  specialNote: string | undefined;
  customer: User | undefined;
  outlet: Outlet | undefined;
  individualOrderItems: OrderItem[] | undefined;
  foodBundleOrderItems: BundleOrderItem[] | undefined;

  constructor(
    _id?: string,
    orderCreationTime?: Date,
    orderPickUpTime?: Date,
    completedTime?: Date,
    estimatedTimeTillCompletion?: number,
    totalPrice?: number,
    debitedCashback?: number,
    creditedCashback?: number,
    orderType?: OrderTypeEnum,
    paymentType?: PaymentTypeEnum,
    orderStatus?: OrderStatusEnum,
    specialNote?: string,
    customer?: User,
    outlet?: Outlet,
    individualOrderItems?: OrderItem[],
    foodBundleOrderItems?: BundleOrderItem[]
  ) {
    this._id = _id;
    this.orderCreationTime = orderCreationTime;
    this.orderPickUpTime = orderPickUpTime;
    this.completedTime = completedTime;
    this.estimatedTimeTillCompletion = estimatedTimeTillCompletion;
    this.customer = customer;
    this.outlet = outlet;
    this.totalPrice = totalPrice;
    this.orderType = orderType;
    this.paymentType = paymentType;
    this.orderStatus = orderStatus;
    this.specialNote = specialNote;
    this.individualOrderItems = individualOrderItems;
    this.foodBundleOrderItems = foodBundleOrderItems;
    this.debitedCashback = debitedCashback;
    this.creditedCashback = creditedCashback;
  }
}
