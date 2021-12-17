import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../../../../models/user';
import { Card } from '../../../../../models/submodels/card';
import { SessionService } from '../../../../../services/session.service';
import { UserService } from '../../../../../services/user.service';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-create-card',
  templateUrl: './create-card.page.html',
  styleUrls: ['./create-card.page.scss'],
})
export class CreateCardPage implements OnInit {

  user: User;
  card: Card;
  cardForm: FormGroup;
  formValid: boolean;
  tempDefault: boolean;
  errorMsg: string;

  constructor(public sessionService: SessionService,
    private userService: UserService,
    public alertController: AlertController, private router: Router) {
      this.cardForm = new FormGroup({
        cardName: new FormControl('', [Validators.required, Validators.maxLength(100)]),
        cardNumber: new FormControl('', [Validators.required, Validators.maxLength(16), Validators.minLength(16)]),
        cardType: new FormControl('', [Validators.required, Validators.maxLength(10)]),
        expiryDate: new FormControl(Validators.required),
        cvv: new FormControl('', [Validators.required, Validators.maxLength(3)]),
        billingAddressDetails: new FormControl('', [Validators.required, Validators.maxLength(100)]),
        billingPostalCode: new FormControl('', [Validators.required, Validators.maxLength(6), Validators.minLength(6)]),
        isDefault: new FormControl(false, Validators.required),
      });
      this.formValid = false;
    }

  ngOnInit() {
    this.initData();
  }

  initData() {
    this.user = this.sessionService.getCurrentUser();
    if(this.user.cards === undefined){
      this.user.cards= [];
    }
    this.tempDefault = false;
    const controls = this.cardForm.controls;
  }

  async presentAlert(header, message) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
        },
      ],
    });
    await alert.present();
  }

  changeDefault(event){
    this.tempDefault = !this.tempDefault;
  }

  updateDetails() {

    const tempCard = new Card();
    const { cardName, cardNumber, cardType, expiryDate, cvv, billingAddressDetails, billingPostalCode} = this.cardForm.value;
    tempCard.cardName = cardName;
    tempCard.cardNumber = cardNumber;
    tempCard.truncatedCardNumber = cardNumber.substr(0,4) + '**** ****' + cardNumber.substr(cardNumber.length-4);
    tempCard.cardType = cardType;
    tempCard.expiryDate = expiryDate;
    tempCard.cvv = cvv;
    tempCard.billingAddressDetails = billingAddressDetails;
    tempCard.billingPostalCode = billingPostalCode;
    tempCard.isDefault = false;

    // if(tempCard.isDefault === true){
    //   for(const varCard in this.user.cards){
    //     if(this.user.cards[varCard].isDefault === true ){
    //       this.user.cards[varCard].isDefault = false;
    //     }
    //   }
    // }
    //this.user.cards.push(tempCard);
    this.userService
      // eslint-disable-next-line no-underscore-dangle
      .addUserCard(this.user._id, tempCard)
      .subscribe(
        updatedUser => {
            this.sessionService.setCurrentUser(updatedUser);
            this.initData();
            this.router.navigate(['/hawker/profile/digital-wallet/linked-payment-methods']);
            this.presentAlert('Success', 'Added Card Successfully!');
        },
        error => {
          this.initData();
          this.presentAlert('Hmm..something went wrong', 'Unable to update card: ' + error);
        }
      );
  }

  get errorControl() {
    return this.cardForm.controls;
  }

  checkFormValid() {
    this.formValid = true;
    const controls = this.cardForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        this.formValid = false;
        return;
      }
    }
  }

}
