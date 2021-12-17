/* eslint-disable arrow-body-style */
/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonBackButtonDelegate, ModalController } from '@ionic/angular';
import { Location } from '@angular/common';
import { OrderTypeEnum } from '../../../models/enums/order-type-enum.enum';
import { Order } from '../../../models/order';
import { User } from '../../../models/user';
import { Address } from '../../../models/submodels/address';
import { FoodBasketService } from '../../../services/food-basket.service';
import { SessionService } from '../../../services/session.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { PaymentTypeEnum } from 'src/app/models/enums/payment-type-enum.enum';
import { OutletService } from 'src/app/services/outlet.service';
import { Router } from '@angular/router';
import { Outlet } from 'src/app/models/outlet';
import { WalletService } from 'src/app/services/wallet.service';
import { Wallet } from 'src/app/models/wallet';
import { Cashback } from 'src/app/models/submodels/cashback';
import { OrderService } from 'src/app/services/order.service';
import { PromotionalBundleSummary } from 'src/app/models/submodels/promotionalBundleSummary';
import { OrderStatusEnum } from 'src/app/models/enums/order-status-enum.enum';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {

  @ViewChild(IonBackButtonDelegate, { static: false }) backButton: IonBackButtonDelegate;

  order: Order;
  user: User;
  allUserAddresses: Address[];

  diningOptions: OrderTypeEnum;
  advancedOrder = false;
  selectedTime: string;
  selectedAddress: Address;
  selectedPaymentType: PaymentTypeEnum;

  wallet: Wallet;
  outlet: Outlet;
  cashback: number;
  debitedCashback: number;
  availableCashback: Cashback;

  constructor(
    private foodBasketService: FoodBasketService,
    private sessionService: SessionService,
    private outletService: OutletService,
    private walletService: WalletService,
    private orderService: OrderService,
    private alertController: AlertController,
    private modalController: ModalController,
    private location: Location,
    private router: Router
  ) {
    this.wallet = new Wallet();
  }

  ngOnInit() {
    this.user = this.sessionService.getCurrentUser();

    this.order = this.foodBasketService.getOrder();

    if (this.user) {
      this.allUserAddresses = this.user.addresses;
      for (const varAddress in this.allUserAddresses) {
        if (this.allUserAddresses[varAddress].isDefault === true) {
          this.selectedAddress = this.allUserAddresses[varAddress];
        }
      }

      // get wallet amount
      // this.user = this.sessionService.getCurrentUser();
      this.walletService.findWalletByOwnerId(this.user._id).subscribe(
        wallet => {
          this.wallet = wallet;

          // get available cashback of outlet
          if (wallet.availableCashBacks.length !== 0 && this.order.outlet !== undefined) {
            this.availableCashback = wallet.availableCashBacks.filter(cashback => cashback.outlet._id === this.order.outlet.toString())[0];
            this.foodBasketService.computeTotalPayable(this.availableCashback, this.selectedPaymentType);
            this.debitedCashback = this.foodBasketService.setDebitedCashback(this.availableCashback);
          }
        }
      );
    } else {
      this.selectedPaymentType = PaymentTypeEnum.CASH;
    }


    // get the cashback of outlet
    if (this.order.outlet !== undefined) {
      this.outletService.getOutletDetails(this.order.outlet.toString()).subscribe(
        outlet => {
          this.outlet = outlet;
          this.cashback = outlet.cashbackRate;
          // this.foodBasketService.computeCreditedCashback(outlet.cashbackRate, outlet.cashbackIsActive, this.selectedPaymentType);
        }
      );
    }
  }

  ionViewWillEnter() {
    this.order = this.foodBasketService.getOrder();

    if (this.user) {
      this.walletService.findWalletByOwnerId(this.user._id).subscribe(
        wallet => {
          this.wallet = wallet;

          // get available cashback of outlet
          if (wallet.availableCashBacks.length !== 0 && this.order.outlet !== undefined) {
            this.availableCashback = wallet.availableCashBacks.filter(cashback => cashback.outlet._id === this.order.outlet.toString())[0];
            this.foodBasketService.computeTotalPayable(this.availableCashback, this.selectedPaymentType);
            this.debitedCashback = this.foodBasketService.setDebitedCashback(this.availableCashback);
          }
        }
      );
    }

    // get the cashback of outlet
    if (this.order.outlet !== undefined) {
      this.outletService.getOutletDetails(this.order.outlet.toString()).subscribe(
        outlet => {
          this.outlet = outlet;
          this.cashback = outlet.cashbackRate;
          // this.foodBasketService.computeCreditedCashback(outlet.cashbackRate, outlet.cashbackIsActive, this.selectedPaymentType);
        }
      );
    }
  }

  ionViewDidEnter() {
    this.setBackButtonAction();
  }

  placeOrder() {
    const outletId = this.foodBasketService.order.outlet.toString();

    this.outletService.getOutletDetails(outletId).subscribe(outlet => {
      this.validateOrder(outlet).then(orderIsValid => {
        if (orderIsValid) {
          if (this.user) {
            if (this.advancedOrder) {
              const pickUpTime = moment(moment(new Date(this.selectedTime), 'HH:mm'), 'H:mm').toDate();
              if (this.diningOptions === OrderTypeEnum.DELIVERY) {
                this.foodBasketService.checkOut(this.selectedPaymentType, this.diningOptions, pickUpTime, this.selectedAddress);
              } else if (this.diningOptions === OrderTypeEnum.TAKE_AWAY) {
                this.foodBasketService.checkOut(this.selectedPaymentType, this.diningOptions, pickUpTime);
              }
              this.resetData();
            } else {
              if (this.diningOptions === OrderTypeEnum.DELIVERY) {
                this.foodBasketService.checkOut(this.selectedPaymentType, this.diningOptions, undefined, this.selectedAddress);
              } else {
                this.foodBasketService.checkOut(this.selectedPaymentType, this.diningOptions);
              }
              this.resetData();
            }
          } else { //guest checkout
            // this.sessionService.addGuestOrderId('blah');
            this.foodBasketService.customerGuestCheckOut(this.diningOptions).subscribe(createdOrder => {
              this.router.navigate(['/customer/activity']);
            }, error => {
              this.showAlert('There is an error creating an order. Try again later.');
            });
          }
        }
      });
    });
  }

  async validateOrder(outlet): Promise<boolean> {
    if (this.diningOptions === undefined) {
      this.showAlert('Please select a dining option.');
      return false;
    }
    if (!this.outletService.checkOutletIsActive(outlet)) {
      this.showOutletClosedAlert('This outlet is closed.');
      return false;
    }
    if ((this.diningOptions === OrderTypeEnum.TAKE_AWAY || this.diningOptions === OrderTypeEnum.DELIVERY) &&
      this.advancedOrder) {
      const currentTime = moment(moment(new Date()).format('H:mm'), 'H:mm');
      const selectedTime = moment(moment(new Date(this.selectedTime), 'HH:mm'), 'H:mm');
      if (selectedTime.isBefore(currentTime)) {
        this.showAlert('Please select a future time.');
        return false;
      } else if (!this.outletService.checkOutletIsActive(outlet, selectedTime)) {
        this.showAlert('Pick up time is after outlet closing time.');
        return false;
      }
    }
    if (this.diningOptions === OrderTypeEnum.DELIVERY && !this.selectedAddress) {
      this.showAlert('Please select a delivery address.');
      return false;
    }
    if (this.selectedPaymentType === undefined) {
      this.showAlert('Please select a payment type');
      return false;
    }
    if (this.selectedPaymentType === PaymentTypeEnum.DIGITAL) {
      if (this.wallet.balance < this.foodBasketService.getTotalPayable()) {
        this.showBalanceNotSufficientAlert();
        return false;
      } else {
        const orders = await this.orderService.findOngoingOrdersByCustomerId(this.user._id).toPromise();
        let pendingAmount = 0;
        orders.forEach(x => pendingAmount += x.totalPrice);
        if (pendingAmount + this.foodBasketService.getTotalPayable() > this.wallet.balance) {
          this.showBalanceNotSufficientAlert();
          return Promise.resolve(false);
        }
      }
    }
    return Promise.resolve(true);
  }

  async showAlert(alertMessage: string) {
    const alert = await this.alertController.create({
      header: alertMessage,
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
        }
      ]
    });

    await alert.present();
  }

  async showOutletClosedAlert(alertMessage: string) {
    const alert = await this.alertController.create({
      header: alertMessage,
      buttons: [
        {
          text: 'Browse other hawker stores',
          role: 'cancel',
        }
      ]
    });

    alert.onDidDismiss().then(data => {
      this.foodBasketService.clearBasket();
      this.router.navigate(['/customer/home']);
    });

    await alert.present();
  }

  showBalanceNotSufficientAlert() {
    this.alertController.create({
      header: 'You don\'t have enough balance',
      message: 'To complete your transaction, please top up your digital wallet',
      buttons: [
        {
          text: 'Top Up Now',
          handler: () => {
            this.router.navigate(['/customer/profile/digital-wallet']);
          }
        }, {
          text: 'Change Payment Method',
          role: 'cancel',
          handler: () => {
            return;
          }
        }
      ]
    }).then(alert => {
      alert.present();
    });
  }

  setBackButtonAction() {
    this.backButton.onClick = () => {
      this.location.back();
    };
  }

  private resetData() {
    this.advancedOrder = false;
    this.diningOptions = undefined;
    this.selectedPaymentType = undefined;
  }

}
