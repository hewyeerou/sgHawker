import { OrderGroupItemStatusEnum } from '../enums/order-group-item-status-enum';
import { OrderItem } from './orderItem';

export class BundleOrderItem {
  _id: string | undefined;
  bundle_id: string | undefined;
  bundleName: string | undefined;
  bundleQuantity: number | undefined;
  bundleSubtotal: number | undefined;
  bundleItems: OrderItem[] | undefined;
  bundleItemStatus: OrderGroupItemStatusEnum;

  constructor(
    _id?: string,
    bundle_id?: string,
    bundleName?: string,
    bundleQuantity?: number,
    bundleSubtotal?: number,
    bundleItems?: OrderItem[],
    bundleItemStatus?: OrderGroupItemStatusEnum
  ) {
    this._id = _id;
    this.bundle_id = bundle_id;
    this.bundleQuantity = bundleQuantity;
    this.bundleName = bundleName;
    this.bundleSubtotal = bundleSubtotal;
    this.bundleItems = bundleItems;
    this.bundleItemStatus = bundleItemStatus;
  }
}
