/* eslint-disable no-underscore-dangle */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../../../services/session.service';
import { AlertController, ModalController, PopoverController, ToastController } from '@ionic/angular';
import { WalletService } from 'src/app/services/wallet.service';
import { PopoverComponentComponent } from 'src/app/shared/popover-component/popover-component.component';
import { Wallet } from 'src/app/models/wallet';
import { User } from 'src/app/models/user';
import { Outlet } from 'src/app/models/outlet';
import * as _ from 'lodash';
import * as moment from 'moment';
import { WithdrawSelectModalComponent } from './withdraw-select-modal/withdraw-select-modal.component';
import { SetCashbackModalComponent } from './set-cashback-modal/set-cashback-modal.component';
import { TransactionTypeEnum } from 'src/app/models/enums/transaction-type-enum';
import { OrderDetailModalComponent } from 'src/app/shared/order-detail-modal/order-detail-modal.component';
import { AccountTypeEnum } from 'src/app/models/enums/account-type-enum.enum';
import { FilterModalComponent } from './filter-modal/filter-modal.component';

@Component({
  selector: 'app-digital-wallet',
  templateUrl: './digital-wallet.page.html',
  styleUrls: ['./digital-wallet.page.scss'],
})
export class DigitalWalletPage implements OnInit {

  wallet: Wallet;
  currentUser: User;
  currentOutlet: Outlet;
  segmentModel = 'all';
  segmentType: TransactionTypeEnum;
  filter = null;
  ordersType = 'allOrders';

  transactionsByDate: any[] = [];
  defaultBankAccount = false;

  constructor(
    private router: Router,
    public sessionService: SessionService,
    public walletService: WalletService,
    private popoverController: PopoverController,
    private toastController: ToastController,
    private alertController: AlertController,
    private modalController: ModalController,
  ) { }

  ngOnInit() { }

  ionViewWillEnter() {
    // if session user changed, update in session outlet
    this.currentUser = this.sessionService.getCurrentUser();
    if (this.currentUser.bankAccounts.length === 0) {
      this.alertController
        .create({
          header:
            'You have no bank accounts associated',
          message:
            'Please create one for withdrawal',
          buttons: [
            {
              text: 'Ok',
              handler: () => {
                this.router.navigate(['/hawker/profile/digital-wallet/linked-payment-methods']);
              },
            },
          ],
        })
        .then((x) => x.present());
    } else {
      const outlet = this.sessionService.getCurrentOutlet();
      outlet.hawkerAccount = this.currentUser;
      this.sessionService.setCurrentOutlet(outlet);
      this.currentOutlet = this.sessionService.getCurrentOutlet();

      if (this.currentUser.bankAccounts.find(x => x.isDefault)) {
        this.defaultBankAccount = true;
      }

      this.segmentModel = 'all';
      this.walletService.findWalletByOwnerId(this.currentOutlet._id)
        .subscribe(
          res => {
            this.wallet = res;
            this.segmentType = null;
            this.sortTransactionsByDate();
          },
          err => {
            this.presentErrorToast('An error has occurred. Please try again');
            this.router.navigate(['/hawker/profile']);
          }
        );
    }
  }

  sortTransactionsByDate() {
    this.transactionsByDate = [];
    // BY DEFAULT: Get current month's transactions of selected transaction type
    let walletTransactionsFiltered = this.wallet.walletTransactions;
    if (this.filter === null) {
      walletTransactionsFiltered = this.wallet.walletTransactions.filter(
        (x) =>
          (moment(x.transactionDate).month() === moment().month()) &&
          (this.segmentType === null ? true :
            (this.segmentType === TransactionTypeEnum.ORDER ?
              (this.ordersType === 'onlyOrders' ? x.transactionType === TransactionTypeEnum.ORDER :
                (this.ordersType === 'onlyRefunded' ? x.transactionType === TransactionTypeEnum.REFUND :
                  (x.transactionType === TransactionTypeEnum.ORDER || x.transactionType === TransactionTypeEnum.REFUND))) :
              x.transactionType === this.segmentType)));
      // FILTER 'one': Get selected date's transactions of selected transaction type
    } else if (this.filter.dateType === 'one') {
      walletTransactionsFiltered = this.wallet.walletTransactions.filter(
        (x) =>
          (moment(x.transactionDate).isSame(moment(this.filter.singleDate), 'day')) &&
          (this.segmentType === null ? true :
            (this.segmentType === TransactionTypeEnum.ORDER ?
              (this.ordersType === 'onlyOrders' ? x.transactionType === TransactionTypeEnum.ORDER :
                (this.ordersType === 'onlyRefunded' ? x.transactionType === TransactionTypeEnum.REFUND :
                  (x.transactionType === TransactionTypeEnum.ORDER || x.transactionType === TransactionTypeEnum.REFUND))) :
              x.transactionType === this.segmentType)));

      // FILTER 'multiple': Get transactions of selected date range of selected transaction type
    } else if (this.filter.dateType === 'multiple') {
      walletTransactionsFiltered = this.wallet.walletTransactions.filter(
        (x) =>
          (moment(x.transactionDate).isSameOrAfter(moment(this.filter.startDate), 'day') &&
            (moment(x.transactionDate).isSameOrBefore(moment(this.filter.endDate), 'day')))
          &&
          (this.segmentType === null ? true :
            (this.segmentType === TransactionTypeEnum.ORDER ?
              (this.ordersType === 'onlyOrders' ? x.transactionType === TransactionTypeEnum.ORDER :
                (this.ordersType === 'onlyRefunded' ? x.transactionType === TransactionTypeEnum.REFUND :
                  (x.transactionType === TransactionTypeEnum.ORDER || x.transactionType === TransactionTypeEnum.REFUND))) :
              x.transactionType === this.segmentType)));
    }

    // Sort transactions by latest date
    walletTransactionsFiltered.sort(
      (a, b) =>
        (new Date(a.transactionDate) < new Date(b.transactionDate)) ? 1 :
          (new Date(a.transactionDate) > new Date(b.transactionDate)) ? -1 : 0
    );

    // Get unique dates across all transactions (and put into a Set)
    const transactionDates = [...new Set(
      walletTransactionsFiltered
        .map(x =>
          new Date(x.transactionDate).toDateString()
        )
    )];

    // Find transactions under each unique date and put into a new data array
    const tempTransactions = _.cloneDeep(walletTransactionsFiltered);
    transactionDates.forEach((d) => {
      const temp = tempTransactions.filter(
        (x) => new Date(x.transactionDate).toDateString() === d);
      this.transactionsByDate.push({
        walletTransactions: temp,
        date: d
      });
    });
  }

  async showPopOver(ev) {
    const popoverItemProps = [
      {
        label: 'Linked Payment Methods',
        eventHandler: () => {
          this.router.navigate(['/hawker/profile/digital-wallet/linked-payment-methods']);
        },
        type: 'CARD'
      }
    ];

    this.popoverController
      .create({
        component: PopoverComponentComponent,
        cssClass: 'popover-class',
        componentProps: { items: popoverItemProps },
        translucent: true,
        event: ev,
      })
      .then((popOverElement) => {
        popOverElement.present();
      });
  }

  async presentErrorToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
    });
    toast.present();
  }

  changeWithdrawalFreq() {
    this.alertController
      .create({
        header: 'Set your withdrawal frequency',
        inputs: [
          {
            name: 'daily',
            type: 'radio',
            label: 'Daily',
            value: '1',
            checked: this.wallet.withdrawalFrequency === 1
          },
          {
            name: 'weekly',
            type: 'radio',
            label: 'Weekly',
            value: '7',
            checked: this.wallet.withdrawalFrequency === 7
          },
          {
            name: 'biweekly',
            type: 'radio',
            label: 'Bi-Weekly',
            value: '14',
            checked: this.wallet.withdrawalFrequency === 14
          },
          {
            name: 'monthly',
            type: 'radio',
            label: 'Monthly',
            value: '30',
            checked: this.wallet.withdrawalFrequency === 30
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Confirm',
            handler: data => {
              if (data === this.wallet.withdrawalFrequency) {
                this.presentErrorToast('The withdrawal frequency is the same');
              } else if (data) {
                this.walletService.updateWithdrawalFrequency(this.wallet._id, data)
                  .subscribe(
                    res => {
                      const outletWithWallet = this.sessionService.getCurrentOutlet();
                      outletWithWallet.wallet = res;
                      this.sessionService.setCurrentOutlet(outletWithWallet);
                      this.wallet = res;
                      this.presentErrorToast('Withdrawal Frequency updated');
                    },
                    error => {
                      this.presentErrorToast('An error occurred while setting up digital wallet. Please try again.');
                    }
                  );
              } else {
                this.presentErrorToast('Please set a withdrawal frequency');
              }
            }
          }
        ]
      })
      .then((x) => x.present());
  }

  getWithdrawalFrequencyString(wf: number) {
    switch (wf) {
      case 1:
        return 'Daily';
      case 7:
        return 'Weekly';
      case 14:
        return 'Bi-Weekly';
      case 30:
        return 'Monthly';
    }
  }

  async openWithdrawModal() {
    if (this.wallet.balance === 0) {
      this.presentErrorToast('You have zero balance');
    } else if (this.currentOutlet.hawkerAccount.bankAccounts.length === 0) {
      this.alertController
        .create({
          header:
            'You have no bank accounts associated',
          message:
            'Do you want add a new bank account?',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Okay',
              handler: () => {
                this.router.navigate(['/hawker/profile/digital-wallet/linked-payment-methods/create-bank-account']);
              },
            },
          ],
        })
        .then((x) => x.present());
    } else {
      const modal = await this.modalController.create({
        component: WithdrawSelectModalComponent,
        cssClass: 'my-modal-class',
        componentProps: {
          currentOutlet: this.currentOutlet,
          currentWallet: this.wallet
        },
        showBackdrop: true,
        backdropDismiss: false
      });
      modal.onDidDismiss().then((data) => {
        if (data.data !== undefined) {
          this.wallet = data.data.wallet;
          this.currentOutlet.wallet = data.data.wallet;
          this.sessionService.setCurrentOutlet(this.currentOutlet);
          this.sortTransactionsByDate();
          this.router.navigate(['/hawker/profile/digital-wallet']);
        }
      });
      return await modal.present();
    }
  }

  async openCashbackModal() {
    const modal = await this.modalController.create({
      component: SetCashbackModalComponent,
      componentProps: {
        currentOutlet: this.currentOutlet,
      },
      showBackdrop: true,
      backdropDismiss: false
    });
    modal.onDidDismiss().then((data) => {
      if (data.data !== undefined) {
        this.currentOutlet = data.data.outlet;
        this.sessionService.setCurrentOutlet(this.currentOutlet);
      }
    });
    return await modal.present();
  }

  changeSegment(ev: any) {
    switch (this.segmentModel) {
      case 'all':
        this.segmentType = null;
        break;
      case 'bt':
        this.segmentType = TransactionTypeEnum.WITHDRAWAL;
        break;
      case 'cc':
        this.segmentType = TransactionTypeEnum.SUBSCRIPTION_PAYMENT;
        break;
      case 'o':
        this.segmentType = TransactionTypeEnum.ORDER;
        break;
    }
    this.sortTransactionsByDate();
  }

  changeRadio(ev: any) {
    switch (ev) {
      case 'allOrders':
        this.ordersType = 'allOrders';
        break;
      case 'onlyOrders':
        this.ordersType = 'onlyOrders';
        break;
      case 'onlyRefunded':
        this.ordersType = 'onlyRefunded';
        break;
    }
    this.sortTransactionsByDate();

  }

  async openOrderModal(orderItem) {
    const modal = await this.modalController.create({
      component: OrderDetailModalComponent,
      componentProps: {
        order: orderItem,
        userType: AccountTypeEnum.HAWKER
      },
      showBackdrop: true,
      backdropDismiss: false
    });
    return await modal.present();
  }

  async filterTransactions() {
    const modal = await this.modalController.create({
      component: FilterModalComponent,
      cssClass: 'my-date-modal-class',
      componentProps: {
        filter: this.filter,
      },
      showBackdrop: true,
      backdropDismiss: false
    });
    modal.onDidDismiss().then((data) => {
      if (data.data !== undefined) {
        this.filter = data.data.filter;
        this.sortTransactionsByDate();
      }
    });
    return await modal.present();
  }

}
