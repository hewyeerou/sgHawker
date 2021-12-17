import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { AccountTierEnum } from 'src/app/models/enums/account-tier-enum.enum';
import { SubscriptionFees } from 'src/app/models/submodels/subscriptionFees';
import { User } from 'src/app/models/user';
import { SessionService } from 'src/app/services/session.service';
import { UserService } from 'src/app/services/user.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-choose-plan',
  templateUrl: './choose-plan.page.html',
  styleUrls: ['./choose-plan.page.scss'],
})
export class ChoosePlanPage implements OnInit {

  hawker: User;
  originalHawker: User;
  subscriptionFees: SubscriptionFees;

  constructor(
    private router: Router,
    private toastController: ToastController,
    public sessionService: SessionService,
    public userService: UserService,
    public alertController: AlertController
    ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.originalHawker = this.sessionService.getCurrentUser();
    this.hawker = _.cloneDeep(this.sessionService.getCurrentUser());
    this.userService.findSubscriptionFees().subscribe(
      res => {
        this.subscriptionFees = res;
      },
      err => {
        this.presentErrorToast('An error has occurred. Please try again');
      }
    );
  }

  directToProfilePage()
  {
  	this.router.navigate(['profile']);
  }

  switch(i) {
    if (i===1) {
      this.hawker.accountTier = AccountTierEnum.FREE;
    } else if (i===2) {
      this.hawker.accountTier = AccountTierEnum.PREMIUM;
    } else {
      this.hawker.accountTier = AccountTierEnum.DELUXE;
    }
  }

  confirm() {
    if (this.hawker.cards.length === 0) {
      this.presentCardCreationAlert();
    } else {
      // for free, disable master
      // for premium -> set credit card
      // for deluxe -> set credit card, select master outlet, upload documents, disable master if downgrade
      this.router.navigate(['/hawker/profile/hawkertier/confirm-subscription',
        {
          hawkerId: this.hawker._id,
          newAccountTier: this.hawker.accountTier,
          subscriptionFee: this.hawker.accountTier === AccountTierEnum.PREMIUM ? this.subscriptionFees.premium :
          (this.hawker.accountTier === AccountTierEnum.DELUXE ? this.subscriptionFees.deluxe : '0')
        }]);
    }
  }

  presentCardCreationAlert() {
    this.alertController
    .create({
      header:
        'You have no credit cards associated',
      message:
        'Do you want add a new credit card?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Okay',
          handler: () => {
            this.router.navigate(['/hawker/profile/digital-wallet/linked-payment-methods/create-card']);
          },
        },
      ],
    })
    .then((x) => x.present());
  }

  async presentErrorToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
    });
    toast.present();
  }
}
