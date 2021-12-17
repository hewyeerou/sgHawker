import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { Outlet } from 'src/app/models/outlet';
import * as _ from 'lodash';
import { OutletService } from 'src/app/services/outlet.service';

@Component({
  selector: 'app-set-cashback-modal',
  templateUrl: './set-cashback-modal.component.html',
  styleUrls: ['./set-cashback-modal.component.scss'],
})
export class SetCashbackModalComponent implements OnInit {

  @Input() currentOutlet: Outlet;
  updatedOutlet: Outlet;

  simulatedCashback: number;
  simulatedEarnings: number;

  constructor(
    private modalController: ModalController,
    private toastController: ToastController,
    public outletService: OutletService
  ) { }

  ngOnInit() {
    this.updatedOutlet = _.cloneDeep(this.currentOutlet);
    this.updatedOutlet.cashbackRate *= 100;
    this.updateSimulation();
   }

  ionViewWillEnter() {
  }

  updateSimulation() {
    const cashback = this.updatedOutlet.cashbackRate/100;
    this.simulatedCashback = 6.5*(cashback);
    this.simulatedEarnings = 6.50-this.simulatedCashback;
  }

  updateCashback() {
    // eslint-disable-next-line no-underscore-dangle
    const cashback = this.updatedOutlet.cashbackRate/100;
    this.outletService.updateOutletCashback(this.currentOutlet._id, cashback, this.updatedOutlet.cashbackIsActive)
    .subscribe(
      res => {
        this.currentOutlet = res;
        this.presentErrorToast('Cashback updated');
        this.modalController.dismiss({
          outlet: res
        });
      },
      err => {
        this.presentErrorToast('An error has occurred. Please try again.');
      }
    );
  }

  closeModal() {
    this.modalController.dismiss();
  }

  async presentErrorToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
    });
    toast.present();
  }
}
