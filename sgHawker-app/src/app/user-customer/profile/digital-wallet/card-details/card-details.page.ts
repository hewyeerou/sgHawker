import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../../../models/user';
import { Card } from '../../../../models/submodels/card';
import { SessionService } from '../../../../services/session.service';
import { UserService } from '../../../../services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { AES256 } from '@ionic-native/aes-256/ngx';

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
  cardNumber: string;
  formValid: boolean;
  tempDefault: boolean;
  errorMsg: string;
  baseUrl = '/api';
  // private secureKey: string;
  // private secureIV: string;

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
    // this.aes256.decrypt(this.user.secureKey, this.user.secureIV, this.card.cardNumber)
    // .then(res => this.cardNumber = res)
    // .catch((error: any) => console.error(error));
    

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
            this.router.navigate(['/customer/profile/digital-wallet/view-all-cards']);
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
            this.router.navigate(['/customer/profile/digital-wallet/view-all-cards']);
            this.presentAlert('Success', 'Card Removed');
        },
        error => {
          this.initData();
          this.presentAlert('Hmm..Something Went Wrong', 'Unable to remove card: ' + error);
        }
      );

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
