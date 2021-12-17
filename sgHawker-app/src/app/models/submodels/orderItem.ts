import { OrderGroupItemStatusEnum } from '../enums/order-group-item-status-enum';
import { FoodItem } from '../foodItem';
import { OrderItemCustomization } from './orderItemCustomization';

export class OrderItem {
  _id: string | undefined;
  itemQuantity: number | undefined;
  foodItem: FoodItem | undefined;
  itemSubtotal: number | undefined;
  selectedCustomizations: OrderItemCustomization[] | undefined;
  orderItemStatus: OrderGroupItemStatusEnum;

  constructor(
    _id?: string,
    itemQuantity?: number,
    foodItem?: FoodItem,
    itemSubtotal?: number,
    selectedCustomizations?: OrderItemCustomization[],
    orderItemStatus?: OrderGroupItemStatusEnum
  ) {
    this._id = _id;
    this.itemQuantity = itemQuantity;
    this.foodItem = foodItem;
    this.itemSubtotal = itemSubtotal;
    this.selectedCustomizations = selectedCustomizations;
    this.orderItemStatus = orderItemStatus;
  }
}
