import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { WalletTransaction } from 'src/app/models/walletTransaction';

@Component({
  selector: 'app-view-transaction-details-modal',
  templateUrl: './view-transaction-details-modal.page.html',
  styleUrls: ['./view-transaction-details-modal.page.scss'],
})
export class ViewTransactionDetailsModalPage implements OnInit {

  @Input() transaction: WalletTransaction;

  constructor(
    public modalController: ModalController
  ) { }

  ngOnInit() {
  }

  dismissModal() {
    this.modalController.dismiss();
  }

}
