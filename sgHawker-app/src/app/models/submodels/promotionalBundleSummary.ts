import { FoodBundle } from './foodBundle';
import { Outlet } from '../outlet';

export class PromotionalBundleSummary extends FoodBundle {
    outletName: string | undefined;

    constructor(
        outletName?: string
    ) {
        super();
        this.outletName = outletName;
    }

    static create(bundle: FoodBundle, outlet: Outlet): PromotionalBundleSummary {
        const tempBundle = new PromotionalBundleSummary();
        tempBundle.foodItems = bundle.foodItems;
        tempBundle.bundleName = bundle.bundleName;
        tempBundle.bundlePrice = bundle.bundlePrice;
        tempBundle._id = outlet._id;
        tempBundle.outletName = outlet.outletName;
        return tempBundle;
    }
}
