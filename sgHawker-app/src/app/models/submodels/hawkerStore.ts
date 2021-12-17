import { Outlet } from '../outlet';
import { PromotionalBundleSummary } from './promotionalBundleSummary';

export class HawkerStore {
    outlet: Outlet | undefined;
    promotionalFoodBundles: PromotionalBundleSummary[] | undefined;

    constructor(
        outlet?: Outlet,
        promotionalFoodBundles?: PromotionalBundleSummary[]
    ) {
        this.outlet = outlet;
        this.promotionalFoodBundles = promotionalFoodBundles;
    }
};
