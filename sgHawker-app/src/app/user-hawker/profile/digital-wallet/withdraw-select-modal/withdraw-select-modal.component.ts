/* eslint-disable no-underscore-dangle */
import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { Outlet } from 'src/app/models/outlet';
import { User } from 'src/app/models/user';
import { Wallet } from 'src/app/models/wallet';
import { WalletService } from 'src/app/services/wallet.service';

@Component({
  selector: 'app-withdraw-select-modal',
  templateUrl: './withdraw-select-modal.component.html',
  styleUrls: ['./withdraw-select-modal.component.scss'],
})
export class WithdrawSelectModalComponent implements OnInit {

  @Input() currentOutlet: Outlet;
  @Input() currentWallet: Wallet;

  selectedBankAccountId: string;

  constructor(
    private modalController: ModalController,
    public walletService: WalletService,
    private toastController: ToastController
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    if (this.currentOutlet.hawkerAccount.bankAccounts.find((x) => x.isDefault) !== undefined) {
      this.selectedBankAccountId = this.currentOutlet.hawkerAccount.bankAccounts.find((x) => x.isDefault)._id;
    }
  }

  confirm() {
    const bankAccount =  this.currentOutlet.hawkerAccount.bankAccounts.find((x) => x._id === this.selectedBankAccountId);
    this.walletService.debitFromWalletToBankAccount(this.currentWallet._id, bankAccount)
      .subscribe(
        res => {
          this.currentWallet = res;
          this.presentErrorToast('Successfully withdrawn');
          this.modalController.dismiss({
            wallet: this.currentWallet,
          });
        },
        error => {
          this.presentErrorToast('An error has occurred. Please try again');
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
