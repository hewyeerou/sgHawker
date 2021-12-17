import { TransactionTypeEnum } from './../../models/enums/transaction-type-enum';
import { TransactionHistoryModalComponent } from '../../shared/transaction-history-modal/transaction-history-modal.component';
import { ModalController } from '@ionic/angular';
import { OutletService } from 'src/app/services/outlet.service';
import { Component, OnInit } from '@angular/core';
import { Outlet } from 'src/app/models/outlet';
import * as moment from 'moment';

@Component({
  selector: 'app-outlet-earning',
  templateUrl: './outlet-earning.page.html',
  styleUrls: ['./outlet-earning.page.scss'],
})
export class OutletEarningPage implements OnInit {

  outlets: Outlet[];
  dtOptions: any = {};

  constructor(
    private outletService: OutletService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.outlets = [];
    this.dtOptions = {
      pagingType: 'full_numbers',
      dom: 'Bfrtip',
      responsive: true,
      buttons: [],
      paging: false,
      aoColumnDefs: [{ bSortable: false, aTargets: [5] }]
    };
  }

  ionViewWillEnter() {
    this.outletService.findAllActiveOutlets().subscribe(outlets => {
      this.outlets = outlets;
    });
  }

  withdrawalStatus(nextWithdrawalDate: Date, outlet: Outlet): string {
    if (!nextWithdrawalDate) {
      return '-';
    }
    if (outlet.wallet.walletTransactions?.length === 0) {
      return 'PENDING';
    }
    return moment(nextWithdrawalDate, 'dd/MM/YYYY').isBefore(moment(Date.now(), 'dd/MM/YYYY'))? 'OVERDUE' : 'PENDING';
  }

  totalOutletEarnings() {
    return this.outlets.map(x => x.wallet.balance).reduce((sum, current) => sum + current);
  }

  async showTransactionHistoryModal(outlet: Outlet) {
    const modal = this.modalController.create({
      component: TransactionHistoryModalComponent,
      cssClass: 'transaction-history-modal',
      componentProps: {
        outlet: outlet,
        transactionType: TransactionTypeEnum.WITHDRAWAL
      }
    });

    (await modal).present();
  }

}
