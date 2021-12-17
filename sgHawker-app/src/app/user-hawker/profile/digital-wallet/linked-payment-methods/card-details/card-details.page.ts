/* eslint-disable no-underscore-dangle */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../../../../models/user';
import { Card } from '../../../../../models/submodels/card';
import { SessionService } from '../../../../../services/session.service';
import { UserService } from '../../../../../services/user.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { AccountTierEnum } from 'src/app/models/enums/account-tier-enum.enum';

@Component({
  selector: 'app-card-details',
  templateUrl: './card-details.page.html',
  styleUrls: ['./card-details.page.scss'],
})
export class CardDetailsPage implements OnInit {

  id: any;
  user: User;
  card: Card;
  cardForm: FormGroup;
  formValid: boolean;
  tempDefault: boolean;
  errorMsg: string;

  constructor(private route: ActivatedRoute, public sessionService: SessionService,
    private userService: UserService, private router: Router,
    public formBuilder: FormBuilder, public alertController: AlertController) {
      this.id = this.route.snapshot.params['id'];
      this.cardForm = formBuilder.group({
        isDefault: [
        ],
      });
      this.initData();
   }

  ngOnInit() {
  }

  initData() {
    this.user = this.sessionService.getCurrentUser();
    for(const varCard in this.user.cards){
      if(this.user.cards[varCard]._id === this.id){
        this.card = this.user.cards[varCard];
      }
    }

    this.tempDefault = false;
    const controls = this.cardForm.controls;
    for (const name in controls) {
      controls[name].setValue(this.card[name]);
    }
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

    for(const varCard in this.user.cards){
      if(this.user.cards[varCard]._id === this.id){
        this.user.cards[varCard].isDefault = this.cardForm.value.isDefault;
      }
    }

    if(this.cardForm.value.isDefault === true){
      for(const varCard in this.user.cards){
        if(this.user.cards[varCard].isDefault === true && this.user.cards[varCard]._id !== this.id ){
          this.user.cards[varCard].isDefault = false;
        }
      }
    }

    this.userService
      .updateUserDetails(this.user._id, this.user)
      .subscribe(
        updatedUser => {
            this.sessionService.setCurrentUser(updatedUser);
            this.initData();
            this.router.navigate(['/hawker/profile/digital-wallet/linked-payment-methods']);
            this.presentAlert('Success', 'Card Details Updated Successfully!');
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

  removeCard(){
    if (this.user.cards.length === 1 && this.user.accountTier !== AccountTierEnum.FREE) {
      this.presentAlert('Unable to remove credit card', 'You have to have at least one credit card for subscription payment');
    } else {
      for(const varCard in this.user.cards){
        if(this.user.cards[varCard]._id === this.id){
          this.user.cards.splice(parseInt(varCard),1);
        }
      }

      this.userService
        .updateUserDetails(this.user._id, this.user)
        .subscribe(
          updatedUser => {
              this.sessionService.setCurrentUser(updatedUser);
              this.router.navigate(['/hawker/profile/digital-wallet/linked-payment-methods']);
              this.presentAlert('Success', 'Card Removed');
          },
          error => {
            this.initData();
            this.presentAlert('Hmm..Something Went Wrong', 'Unable to remove card: ' + error);
          }
        );
        }
  }

  showDeleteAlert() {
    this.alertController.create({
      header: 'Remove Card?',
      buttons: [{
        text: 'Cancel'
      },{
        text: 'OK',
        handler: () => this.removeCard()
      }]
    }).then(res => {

      res.present();

    });
  }

}
