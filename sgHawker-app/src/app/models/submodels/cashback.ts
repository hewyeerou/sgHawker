import { Outlet } from '../outlet';

export class Cashback {
    _id: string | undefined;
    outlet: Outlet | undefined;
    cashbackBalance: number | undefined;

    constructor(
      _id?: string,
      outlet?: Outlet,
      cashbackBalance?: number
      ) {
      this.outlet = outlet;
      this.cashbackBalance = cashbackBalance;
    }
}
