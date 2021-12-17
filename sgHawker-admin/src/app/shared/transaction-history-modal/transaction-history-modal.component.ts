import { BankAccount } from './../../models/submodels/bankAccount';
import { PopoverComponent } from './../popover/popover.component';
import { TransactionTypeEnum } from './../../models/enums/transaction-type-enum';
import { WalletService } from './../../services/wallet.service';
import { WalletTransaction } from './../../models/walletTransaction';
import { ModalController, AlertController, PopoverController, ToastController } from '@ionic/angular';
import { Component, OnInit, Input } from '@angular/core';
import { Outlet } from 'src/app/models/outlet';
import { Wallet } from 'src/app/models/wallet';
import * as moment from 'moment';
import * as _ from 'lodash';
@Component({
  selector: 'app-transaction-history-modal',
  templateUrl: './transaction-history-modal.component.html',
  styleUrls: ['./transaction-history-modal.component.scss'],
})
export class TransactionHistoryModalComponent implements OnInit {

  @Input() outlet: Outlet;
  @Input() transactionType: TransactionTypeEnum;
  transactions: WalletTransaction[];
  originalTransactions: WalletTransaction[];
  wallet: Wallet;
  dtOptions: any = {};

  startDate: Date;
  endDate: Date;

  constructor(
    private modalController: ModalController,
    private walletService: WalletService,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.dtOptions = {
      dom: 'Bfrtip',
      responsive: true,
      buttons: [
      ],
      paging: false,
      aoColumnDefs: [{ bSortable: false, aTargets: [2] }]
    };

    this.walletService.findWalletByOwnerId(this.outlet._id).subscribe(wallet => {
      this.filterTransactions(wallet);
    })
  }

  showBankWithdrawalAlert() {
    const bankAccount = this.outlet.hawkerAccount.bankAccounts?.filter(x => x.isDefault)[0];
    if (!bankAccount) {
      this.alertController.create({
        header: 'Unable to perform bank transfer',
        message: 'The outlet did not provide a bank account',
        buttons: [
          {
            text: 'Dismiss',
            role: 'cancel'
          }
        ]
      }).then(x => x.present());
      return;
    }

    this.alertController.create({
      header: 'Immediate Bank Transfer',
      message: 'Do you want to update the withdrawal status?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.bankTransfer(true, bankAccount);
          }
        },
        {
          text: 'No',
          handler: () => {
            this.bankTransfer(false, bankAccount);
          }
        }
      ]
    }).then(x => x.present());
  }

  closeModal() {
    this.modalController.dismiss();
  }

  resetDurationFilter() {
    this.transactions = _.cloneDeep(this.originalTransactions);
    this.startDate = null;
    this.endDate = null;
  }

  filterByDuration() {
    if (moment(this.startDate).isAfter(moment(this.endDate))) {
      this.alertController.create({
        header: 'Invalid time range',
        message: 'Start date must be before end date',
        buttons: [
          {
            text: 'Dismiss',
            role: 'cancel'
          }
        ]
      }).then(x => x.present());
      return;
    }
    let startDate = moment(this.startDate);
    let endDate = moment(this.endDate);
    this.transactions = this.originalTransactions.filter(transaction => moment(transaction.transactionDate).isBetween(startDate, endDate, 'days', '[]'))
  }

  private bankTransfer(setNewNextWithdrawalDate: boolean, bankAccount: BankAccount) {
    this.alertController.create({
      header: 'Are you sure you want to proceed with bank withdrawal?',
      message: `A total balance of $${this.wallet.balance} will be transferred to bank account number ${bankAccount.accountNumber}`,
      buttons: [
        {
          text: 'Confirm',
          handler: () => {
            this.walletService
              .debitFromWalletToBankAccount(this.wallet._id, bankAccount, setNewNextWithdrawalDate)
              .subscribe(
                updatedWallet => {
                  this.filterTransactions(updatedWallet);
                  this.toastController.create({
                    header: 'Bank transfer successful',
                    duration: 3000
                  }).then(x => x.present());
                },
                error => {
                  this.toastController.create({
                    header: 'Bank transfer failed!',
                    message: `${error}`,
                    duration: 3000
                  }).then(x => x.present());
                })
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    }).then(x => x.present())
  }

  private filterTransactions(wallet: Wallet) {
    this.wallet = wallet;
    this.transactions = wallet.walletTransactions.filter(x => {
      if (this.transactionType === TransactionTypeEnum.WITHDRAWAL && x.withdrawalAmount >= 0) {
        return true;
      } else if (this.transactionType === TransactionTypeEnum.TOP_UP && x.topUpAmount >= 0) {
        return true;
      } else if (this.transactionType === TransactionTypeEnum.ORDER && x.order !== null) {
        return true;
      }
      return false;
    });
    this.originalTransactions = _.cloneDeep(this.transactions);
  }
}
