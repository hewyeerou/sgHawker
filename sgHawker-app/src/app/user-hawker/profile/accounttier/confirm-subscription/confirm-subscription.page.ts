import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { constants } from 'buffer';
import { AccountStatusEnum } from 'src/app/models/enums/account-status-enum.enum';
import { AccountTierEnum } from 'src/app/models/enums/account-tier-enum.enum';
import { Outlet } from 'src/app/models/outlet';
import { Card } from 'src/app/models/submodels/card';
import { SessionService } from 'src/app/services/session.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-confirm-subscription',
  templateUrl: './confirm-subscription.page.html',
  styleUrls: ['./confirm-subscription.page.scss'],
})
export class ConfirmSubscriptionPage implements OnInit {

  hawkerId: string;
  newAccountTier: AccountTierEnum;
  subscriptionFee: string;
  masterOutlet: Outlet;
  creditCards: Card[];
  selectedCreditCardId: string;

  files: File[];
  existFiles = false;
  selectOptions: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    public sessionService: SessionService,
    public userService: UserService,
    private toastController: ToastController,
    private router: Router,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.hawkerId =  this.activatedRoute.snapshot.paramMap.get('hawkerId');
    this.newAccountTier = this.activatedRoute.snapshot.paramMap.get('newAccountTier') as AccountTierEnum;
    this.subscriptionFee = this.activatedRoute.snapshot.paramMap.get('subscriptionFee');
    this.creditCards = this.sessionService.getCurrentUser().cards;
    if (this.creditCards.find((x) => x.isDefault) !== undefined) {
      this.selectedCreditCardId = this.creditCards.find((x) => x.isDefault)._id;
    }
    this.selectOptions = {
      header: 'Select Credit Card',
    };

    if (this.newAccountTier === AccountTierEnum.DELUXE) {
      this.masterOutlet = this.sessionService.getCurrentOutlet();
      this.files = [];
    } else {
      this.masterOutlet = null;
    }
  }

  onFileChange(event) {
    this.files = Array.prototype.slice.call(this.files);
    if (!this.existFiles) {
      this.files = event.target.files;
      this.existFiles = true;
    } else {
      for (const j of event.target.files) {
        this.files.push(j);
      }
    }
  }

  removeFile(i) {
    this.files = Array.prototype.slice.call(this.files);
    if (this.files.length === 1) {
      this.files = [];
      this.existFiles = false;
    } else {
      this.files.splice(i, 1);
    }
  }

  disable() {
    if (this.newAccountTier === AccountTierEnum.DELUXE) {
      if (this.files.length === 0 || !this.selectedCreditCardId) {
        return true;
      }
    } else if (this.newAccountTier === AccountTierEnum.PREMIUM) {
      if (!this.selectedCreditCardId) {
        return true;
      }
    }
    return false;
  }

  confirm() {
    this.creditCards.find((x) => x.isDefault).isDefault = false;
    this.creditCards.find((x) => x._id === this.selectedCreditCardId).isDefault = true;

    this.userService.upgradeAccount(this.hawkerId, this.newAccountTier, this.masterOutlet).subscribe(
      res1 => {
        const updatedUser = res1;
        updatedUser.cards = this.creditCards;
        this.userService.updateUserDetails(updatedUser._id, res1).subscribe(
            res => {
              this.sessionService.setCurrentUser(res);
              if (this.newAccountTier === AccountTierEnum.DELUXE) {
                this.uploadFiles(this.files, res.email);
              }
              if (res.accountUpgradeStatus === AccountStatusEnum.APPROVED) {
                this.presentErrorToast('Subscription Tier changed to ' + res.accountTier);
              } else if (res.accountUpgradeStatus === AccountStatusEnum.PENDING) {
                this.presentErrorToast('Your request to upgrade to DELUXE has been sent to us. We will review and get back to you');
              }
              this.router.navigate(['/hawker/profile/hawkertier']);
            },
            err => {
              this.presentErrorToast('An error has occurred. Please try again');
            }
          );
      },
      err1 => {
        this.presentErrorToast('An error has occurred. Please try again');
      }
    );
  }

  async presentErrorToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
    });
    toast.present();
  }

  uploadFiles(arrFiles, email) {
    for (const i of arrFiles) {

      // Create form data
      const formData = new FormData();
      // Store form name as "file" with file data
      formData.append('file', i, email + '_' + i.name);

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      this.userService.uploadDocumentsForAccountUpgrade(formData, email).subscribe(
        uploadedDocument => {
        }
      ),
        (error) => {
          this.alertController
          .create({
            header: 'Hmm..something went wrong',
            message: 'Unable to upload photo: ' + error,
            buttons: [
              {
                text: 'Dismiss',
                role: 'cancel',
              },
            ],
          })
          .then((alertElement) => {
            alertElement.present();
          });
        };
    }
  }

}
