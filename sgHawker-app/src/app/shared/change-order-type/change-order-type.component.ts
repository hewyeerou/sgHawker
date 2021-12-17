import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { Order } from './../../models/order';
import { User } from './../../models/user';
import { Address } from './../../models/submodels/address';
import { FoodBasketService } from './../../services/food-basket.service';
import { SessionService } from './../../services/session.service';
import { OrderService } from 'src/app/services/order.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Location } from '@angular/common';
import { OrderTypeEnum } from './../../models/enums/order-type-enum.enum';
import { PaymentTypeEnum } from 'src/app/models/enums/payment-type-enum.enum';
import { OutletService } from 'src/app/services/outlet.service';
import { Router } from '@angular/router';
import { Outlet } from 'src/app/models/outlet';
import { WalletService } from 'src/app/services/wallet.service';
import { Wallet } from 'src/app/models/wallet';

@Component({
  selector: 'app-change-order-type',
  templateUrl: './change-order-type.component.html',
  styleUrls: ['./change-order-type.component.scss'],
})
export class ChangeOrderTypeComponent implements OnInit {

  order: Order;
  user: User;
  allUserAddresses: Address[];

  diningOptions: OrderTypeEnum;
  advancedOrder = false;
  selectedTime: string;
  selectedAddress: Address;
  selectedPaymentType: PaymentTypeEnum;


  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private foodBasketService: FoodBasketService,
    private sessionService: SessionService,
    private outletService: OutletService,
    private orderService: OrderService,
  ) {
   }

  ngOnInit() {
    this.user = this.sessionService.getCurrentUser();
    this.allUserAddresses = this.user?.addresses;
    for (const varAddress in this.allUserAddresses) {
      if (this.allUserAddresses[varAddress].isDefault === true) {
        this.selectedAddress = this.allUserAddresses[varAddress];
      }
    }
    //this.order = this.foodBasketService.getOrder();
    // get wallet amount
    this.user = this.sessionService.getCurrentUser();
  }

  // ionViewWillEnter() {
  //   this.order = this.foodBasketService.getOrder();
  // }

  closeModal() {
    this.modalController.dismiss();
  }

  saveOrderType(){
    this.order.orderType = this.diningOptions;
    if(this.diningOptions === "DELIVERY" && this.advancedOrder){
      this.order.orderPickUpTime = moment(moment(new Date(this.selectedTime), 'HH:mm'), 'H:mm').toDate();
    }
    if(this.diningOptions === "DELIVERY" && this.advancedOrder===false){
      this.order.orderPickUpTime = undefined;
    }
    if(this.diningOptions === "TAKE_AWAY" && this.advancedOrder){
      this.order.orderPickUpTime = moment(moment(new Date(this.selectedTime), 'HH:mm'), 'H:mm').toDate();
    }
    if(this.diningOptions === "TAKE_AWAY" && this.advancedOrder===false){
      this.order.orderPickUpTime = undefined;
    }
    // this.orderService.findOrderByOrderId(this.order._id).subscribe(currentOrder =>{
    //   console.log(currentOrder._id);
    //   currentOrder = this.order;
    //   console.log(currentOrder);
    // });
    this.orderService.updateOrder(this.order).subscribe(updatedOrder => {
      this.modalController.dismiss();
    });
    //this.modalController.dismiss();
  }

  validateOrder(outlet): boolean {
    if (this.diningOptions === undefined) {
      this.showAlert('Please select a dining option.');
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
    return true;
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


}
