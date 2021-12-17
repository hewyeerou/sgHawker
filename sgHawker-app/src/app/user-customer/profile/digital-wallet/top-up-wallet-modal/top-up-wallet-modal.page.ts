/* eslint-disable no-underscore-dangle */
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { Card } from 'src/app/models/submodels/card';
import { User } from 'src/app/models/user';
import { Wallet } from 'src/app/models/wallet';
import { WalletService } from 'src/app/services/wallet.service';

@Component({
  selector: 'app-top-up-wallet-modal',
  templateUrl: './top-up-wallet-modal.page.html',
  styleUrls: ['./top-up-wallet-modal.page.scss'],
})
export class TopUpWalletModalPage implements OnInit {

  @Input() user: User;
  @Input() walletId: string;

  topUpWalletForm: FormGroup;
  formValid: boolean;
  formSubmitted: boolean;

  cards: Card[];
  defaultCard: Card;
  updatedWallet: Wallet;

  constructor(
    public modalController: ModalController,
    public formBuilder: FormBuilder,
    public walletService: WalletService,
    public alertController: AlertController,
    public router: Router
  ) {
  }

  ngOnInit() {
    this.cards = this.user.cards;
    this.defaultCard = this.cards.filter(card => card.isDefault === true)[0];

    this.topUpWalletForm = this.formBuilder.group({
      cardSelected: [this.defaultCard._id, Validators.required],
      topUpAmt: [0, [Validators.required, Validators.min(1)]]
    });
  }

  dismissModal() {
    this.modalController.dismiss({
      dismiss: true
    });
  }

  //Check for form validation
  checkFormValid() {
    this.formValid = true;
    const controls = this.topUpWalletForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        this.formValid = false;
        return;
      }
    }
  }

  //Get Form Error
  get errorControl() {
    return this.topUpWalletForm.controls;
  }

  topUpWalletAmount() {
    this.formSubmitted = true;

    let topUpAmount = 0;
    let creditCardInvolved = {};

    topUpAmount = this.topUpWalletForm.value.topUpAmt;
    const creditCardSelectedId = this.topUpWalletForm.value.cardSelected;
    const creditCardSelected = this.cards.filter(card => card._id === creditCardSelectedId)[0];
    creditCardInvolved = {
      cardName: creditCardSelected.cardName,
      cardNumber: creditCardSelected.cardNumber,
      truncatedCardNumber: creditCardSelected.truncatedCardNumber,
      expiryDate: creditCardSelected.expiryDate,
      cvv: creditCardSelected.cvv,
      cardType: creditCardSelected.cardType,
    };

    this.walletService.topUpFromCreditCardToWallet(this.walletId, topUpAmount, creditCardInvolved).subscribe(
      updatedWallet => {
        // this.updatedWallet = updatedWallet;
        this.alertPopUp('Top up successfully.');
      },
      error => {
        this.alertPopUp('Unable to top up wallet: ' + error);
      }
    );
  }

  alertPopUp(msg) {
    this.alertController
      .create({
        header: 'Success',
        message: msg,
        buttons: [
          {
            text: 'OK',
            role: 'OK',
            handler: () => {
              this.topUpWalletForm.reset();
              this.modalController.dismiss({
                updatedWallet: this.updatedWallet
              });
            },
          },
        ],
      })
      .then((alertElement) => {
        alertElement.present();
      });
  }
}
