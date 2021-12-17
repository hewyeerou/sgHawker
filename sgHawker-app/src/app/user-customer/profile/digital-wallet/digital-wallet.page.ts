/* eslint-disable arrow-body-style */
/* eslint-disable no-underscore-dangle */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../../models/user';
import { Card } from '../../../models/submodels/card';
import { SessionService } from '../../../services/session.service';
import { BankAccount } from 'src/app/models/submodels/bankAccount';
import { ModalController, PopoverController, ToastController } from '@ionic/angular';
import { Wallet } from 'src/app/models/wallet';
import { WalletService } from 'src/app/services/wallet.service';
import { TopUpWalletModalPage } from './top-up-wallet-modal/top-up-wallet-modal.page';
import { WalletTransaction } from 'src/app/models/walletTransaction';
import * as moment from 'moment';
import * as _ from 'lodash';
import { ViewTransactionDetailsModalPage } from './view-transaction-details-modal/view-transaction-details-modal.page';
import { PopoverComponentComponent } from 'src/app/shared/popover-component/popover-component.component';
import { CashbackModalPage } from './cashback-modal/cashback-modal.page';
import { TransactionTypeEnum } from 'src/app/models/enums/transaction-type-enum';
import { OrderService } from 'src/app/services/order.service';

@Component({
  selector: 'app-digital-wallet',
  templateUrl: './digital-wallet.page.html',
  styleUrls: ['./digital-wallet.page.scss'],
})
export class DigitalWalletPage implements OnInit {

  user: User;
  defaultCard: Card;
  myBankAccounts: BankAccount[];
  wallet: Wallet;
  walletTransactions: WalletTransaction[];
  groupedTransactions;
  groupedOrderTransactions;
  groupedRefundTransactions;
  segmentModel = 'top-up';

  // sorting all
  allSortCategories: string[];
  selectedSortCategory: string;
  originalGroupedTransactions = [];

  // filtering
  allFilterMonths: string[];
  selectedMonth: string;

  // sorting order and refund only
  selectedSortOrderCategory: string;
  originalGroupedOrderTransactions = [];
  originalGroupedRefundTransactions = [];
  selectedSortRefundCategory: string;

  // filtering order and refund only
  selectedOrderMonth: string;
  selectedRefundMonth: string;

  // pending order payment amount
  pendingOrderPayment: number;

  constructor(
    private router: Router,
    public orderService: OrderService,
    public sessionService: SessionService,
    public popoverController: PopoverController,
    public walletService: WalletService,
    public modalController: ModalController,
    public toastController: ToastController
  ) {
    this.wallet = new Wallet();
    this.walletTransactions = [];
    this.groupedTransactions = [];
    this.groupedOrderTransactions = [];
    this.groupedRefundTransactions = [];
    // sorting
    this.allSortCategories = [];
    this.allSortCategories.push('Default (From Latest)', 'Transaction Date (From Earliest)');
    this.selectedSortCategory = 'Default (From Latest)';
    this.selectedSortOrderCategory = 'Default (From Latest)';
    this.selectedSortRefundCategory = 'Default (From Latest)';
    // filtering
    this.allFilterMonths = [];
    this.allFilterMonths = [
      'All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ];
    this.selectedMonth = 'All';
    this.selectedOrderMonth = 'All';
    this.selectedRefundMonth = 'All';
    // pending order payment amount
    this.pendingOrderPayment = 0;
  }

  ngOnInit() {
    this.initData();
  }

  ionViewWillEnter() {
    this.groupedOrderTransactions = [];
    this.groupedTransactions = [];
    this.groupedRefundTransactions = [];
    this.initData();
    this.checkAndCreateWallet();
    this.orderService.findOngoingOrdersByCustomerId(this.user._id).subscribe(
      ongoingOrders => {
        const allOngoingOrders = ongoingOrders;
        _.forEach(allOngoingOrders, order => {
          this.pendingOrderPayment += order.totalPrice;
        });
      }
    );
  }

  ionViewDidLeave(){
    this.pendingOrderPayment = 0;
  }

  initData() {
    this.user = this.sessionService.getCurrentUser();
    this.defaultCard = this.user.cards.filter(card => card.isDefault === true)[0];
    this.myBankAccounts = this.user.bankAccounts;
  }

  checkAndCreateWallet() {
    this.walletService.findWalletByOwnerId(this.user._id).subscribe(
      userWallet => {
        if (userWallet === null) {
          this.walletService.createWalletForCustomer(this.user._id).subscribe(
            createdWallet => {
              this.wallet = createdWallet;
              this.walletTransactions = createdWallet.walletTransactions;
            },
          );
        } else {
          this.wallet = userWallet;
          this.walletTransactions = userWallet.walletTransactions;
          this.groupWalletTransactionsByDate(userWallet.walletTransactions);
        }
      }
    );
  }

  groupWalletTransactionsByDate(walletTransactions) {
    const topUpTransactions = walletTransactions.filter(transaction => transaction.transactionType === TransactionTypeEnum.TOP_UP);
    const transactionDate = new Set(topUpTransactions.map(transaction => moment(transaction.transactionDate).format('L')));
    transactionDate.forEach((date) => {
      this.groupedTransactions.push({
        transactionDate: moment(date).format('ll'),
        transactions: topUpTransactions
          .filter(transaction => moment(transaction.transactionDate).format('ll') === moment(date).format('ll'))
          .sort((t1, t2) => {
            return +new Date(t2.transactionDate) - +new Date(t1.transactionDate);
          })
      });
    });

    // sort from latest to earliest
    const groupedSortedTransactions = _.cloneDeep(this.groupedTransactions);
    this.groupedTransactions = groupedSortedTransactions.sort((t1, t2) => {
      return +new Date(t2.transactionDate) - +new Date(t1.transactionDate);
    });

    const orderTransactions = walletTransactions.filter(transaction => transaction.transactionType === TransactionTypeEnum.ORDER);
    const orderTransactionDate = new Set(orderTransactions.map(transaction => moment(transaction.transactionDate).format('L')));
    orderTransactionDate.forEach((date) => {
      this.groupedOrderTransactions.push({
        transactionDate: moment(date).format('ll'),
        transactions: orderTransactions
          .filter(transaction => moment(transaction.transactionDate).format('ll') === moment(date).format('ll'))
          .sort((t1, t2) => {
            return +new Date(t2.transactionDate) - +new Date(t1.transactionDate);
          })
      });
    });

    // sort from latest to earliest
    const groupedSortedOrderTransactions = _.cloneDeep(this.groupedOrderTransactions);
    this.groupedOrderTransactions = groupedSortedOrderTransactions.sort((t1, t2) => {
      return +new Date(t2.transactionDate) - +new Date(t1.transactionDate);
    });

    const refundTransactions = walletTransactions.filter(transaction => transaction.transactionType === TransactionTypeEnum.REFUND);
    const refundTransactionDate = new Set(refundTransactions.map(transaction => moment(transaction.transactionDate).format('L')));
    refundTransactionDate.forEach((date) => {
      this.groupedRefundTransactions.push({
        transactionDate: moment(date).format('ll'),
        transactions: refundTransactions
          .filter(transaction => moment(transaction.transactionDate).format('ll') === moment(date).format('ll'))
          .sort((t1, t2) => {
            return +new Date(t2.transactionDate) - +new Date(t1.transactionDate);
          })
      });
    });

    // sort from latest to earliest
    const groupedSortedRefundTransactions = _.cloneDeep(this.groupedRefundTransactions);
    this.groupedRefundTransactions = groupedSortedRefundTransactions.sort((t1, t2) => {
      return +new Date(t2.transactionDate) - +new Date(t1.transactionDate);
    });

    this.originalGroupedTransactions = _.cloneDeep(this.groupedTransactions);
    this.originalGroupedOrderTransactions = _.cloneDeep(this.groupedOrderTransactions);
    this.originalGroupedRefundTransactions = _.cloneDeep(this.groupedRefundTransactions);
  }

  async showPopOver(ev) {
    const popoverItemProps = [{
      label: 'My Cards',
      eventHandler: () => {
        this.router.navigate(['/customer/profile/digital-wallet/view-all-cards']);
      },
      type: 'CARD'
    }];

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

  async presentTopUpModal() {
    if (!this.defaultCard) {
      this.presentErrorToast('You have no default credit card. Please set one before topping up');
    } else {
      const modal = await this.modalController.create({
        component: TopUpWalletModalPage,
        componentProps: {
          user: this.user,
          walletId: this.wallet._id
        },
        showBackdrop: true,
        backdropDismiss: false,
      });

      modal.onDidDismiss().then((data) => {
        if (data.data.dismiss !== true) {
          this.groupedTransactions = [];
          this.groupedOrderTransactions = [];
          this.groupedRefundTransactions = [];

          this.walletService.findWalletByOwnerId(this.user._id).subscribe(
            userWallet => {
              this.wallet = userWallet;
              this.walletTransactions = userWallet.walletTransactions;
              this.groupWalletTransactionsByDate(userWallet.walletTransactions);
            }
          );
        }
      });
      return await modal.present();
    }
  }

  async presentCashbackModal() {
    const modal = await this.modalController.create({
      component: CashbackModalPage,
      componentProps: {
        walletId: this.wallet._id,
        wallet: this.wallet
      },
      showBackdrop: true,
      backdropDismiss: false,
    });

    modal.onDidDismiss().then((data) => {
      if (data.data.dismiss !== true) {
      }
    });
    return await modal.present();
  }

  filterTransactionsBySortCategory() {
    if (this.selectedSortCategory === 'Default (From Latest)') {
      this.groupedTransactions = this.originalGroupedTransactions;
    } else if (this.selectedSortCategory === 'Transaction Date (From Earliest)') {
      const groupedSortedTransactions = _.cloneDeep(this.groupedTransactions);

      this.groupedTransactions = groupedSortedTransactions.sort((t1, t2) => {
        return +new Date(t1.transactionDate) - +new Date(t2.transactionDate);
      });

      this.groupedTransactions = groupedSortedTransactions.map(allTxn => {
        allTxn.transactions.sort((t1, t2) => {
          return +new Date(t1.transactionDate) - +new Date(t2.transactionDate);
        });
        return allTxn;
      });
    }
  }

  filterOrderTransactionsBySortCategory() {
    if (this.selectedSortOrderCategory === 'Default (From Latest)') {
      this.groupedOrderTransactions = this.originalGroupedOrderTransactions;
    } else if (this.selectedSortOrderCategory === 'Transaction Date (From Earliest)') {
      const groupedSortedOrderTransactions = _.cloneDeep(this.groupedOrderTransactions);

      this.groupedOrderTransactions = groupedSortedOrderTransactions.sort((t1, t2) => {
        return +new Date(t1.transactionDate) - +new Date(t2.transactionDate);
      });

      this.groupedOrderTransactions = groupedSortedOrderTransactions.map(allTxn => {
        allTxn.transactions.sort((t1, t2) => {
          return +new Date(t1.transactionDate) - +new Date(t2.transactionDate);
        });
        return allTxn;
      });
    }
  }

  filterRefundTransactionsBySortCategory() {
    if (this.selectedSortRefundCategory === 'Default (From Latest)') {
      this.groupedRefundTransactions = this.originalGroupedRefundTransactions;
    } else if (this.selectedSortRefundCategory === 'Transaction Date (From Earliest)') {
      const groupedSortedRefundTransactions = _.cloneDeep(this.groupedRefundTransactions);

      this.groupedRefundTransactions = groupedSortedRefundTransactions.sort((t1, t2) => {
        return +new Date(t1.transactionDate) - +new Date(t2.transactionDate);
      });

      this.groupedRefundTransactions = groupedSortedRefundTransactions.map(allTxn => {
        allTxn.transactions.sort((t1, t2) => {
          return +new Date(t1.transactionDate) - +new Date(t2.transactionDate);
        });
        return allTxn;
      });
    }
  }

  filterTransactionsByMonths() {
    this.groupedTransactions = this.originalGroupedTransactions;

    if (this.selectedMonth === 'All') {
      this.groupedTransactions = this.originalGroupedTransactions;
    } else {
      const filteredTransactions = _.cloneDeep(this.groupedTransactions);

      this.groupedTransactions = filteredTransactions.filter(t => {
        return this.allFilterMonths.indexOf(this.selectedMonth) === moment(t.transactionDate).month() + 1;
      });
    }
  }

  filterOrderTransactionsByMonths() {
    this.groupedOrderTransactions = this.originalGroupedOrderTransactions;

    if (this.selectedOrderMonth === 'All') {
      this.groupedOrderTransactions = this.originalGroupedOrderTransactions;
    } else {
      const filteredOrderTransactions = _.cloneDeep(this.groupedOrderTransactions);

      this.groupedOrderTransactions = filteredOrderTransactions.filter(t => {
        return this.allFilterMonths.indexOf(this.selectedOrderMonth) === moment(t.transactionDate).month() + 1;
      });
    }
  }

  filterRefundTransactionsByMonths() {
    this.groupedRefundTransactions = this.originalGroupedRefundTransactions;

    if (this.selectedRefundMonth === 'All') {
      this.groupedRefundTransactions = this.originalGroupedRefundTransactions;
    } else {
      const filteredRefundTransactions = _.cloneDeep(this.groupedRefundTransactions);

      this.groupedRefundTransactions = filteredRefundTransactions.filter(t => {
        return this.allFilterMonths.indexOf(this.selectedRefundMonth) === moment(t.transactionDate).month() + 1;
      });
    }
  }

  async viewTransactionDetails(transactionType, transactionDate, transaction) {
    let selectedTransaction = [];
    if (transactionType === TransactionTypeEnum.TOP_UP) {
      const selectedTransactionArr = this.groupedTransactions.filter(t => {
        return t.transactionDate === transactionDate;
      });

      selectedTransaction = selectedTransactionArr[0].transactions.filter(txn => {
        return txn._id === transaction._id;
      });
    } else if (transactionType === TransactionTypeEnum.ORDER) {
      const selectedTransactionArr = this.groupedOrderTransactions.filter(t => {
        return t.transactionDate === transactionDate;
      });

      selectedTransaction = selectedTransactionArr[0].transactions.filter(txn => {
        return txn._id === transaction._id;
      });
    } else if (transactionType === TransactionTypeEnum.REFUND) {
      const selectedTransactionArr = this.groupedRefundTransactions.filter(t => {
        return t.transactionDate === transactionDate;
      });

      selectedTransaction = selectedTransactionArr[0].transactions.filter(txn => {
        return txn._id === transaction._id;
      });
    }

    const modal = await this.modalController.create({
      component: ViewTransactionDetailsModalPage,
      componentProps: {
        transaction: selectedTransaction[0]
      },
      showBackdrop: true,
      backdropDismiss: false,
    });

    modal.onDidDismiss().then((data) => { });

    return await modal.present();
  }

  async presentErrorToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
    });
    toast.present();
  }
}
