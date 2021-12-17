import { Component, Input } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { AccountStatusEnum } from 'src/app/models/enums/account-status-enum.enum';
import { User } from 'src/app/models/user';
import {
  HawkerAccountManagementService
} from '../../../services/hawker-account-management.service';

@Component({
  selector: 'app-pending-account-details-modal',
  templateUrl: './pending-account-details-modal.component.html',
  styleUrls: ['./pending-account-details-modal.component.scss'],
})
export class PendingAccountDetailsModalComponent {


  @Input() user: User;

  constructor(
    private hawkerAccountManagementService: HawkerAccountManagementService,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController
  ) { }

  async approveHawker() {
    const confirmPrompt = this.alertController.create({
      message: 'Do you want to approve?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.hawkerAccountManagementService
              .approveHawker(this.user._id)
              .subscribe(async (res: User) => {
                this.modalController.dismiss(this.user._id);
                this.presentToast('Hawker Account Approved');
              });
          },
        },
        {
          text: 'No',
          handler: () => {
            return;
          },
        },
      ],
    });
    (await confirmPrompt).present();
  }

  async rejectHawker() {
    const confirmPrompt = this.alertController.create({
      message: 'Do you want to reject?',
      buttons: [
        {
          text: 'Yes',
          handler: async () => {
            const alertInput = this.alertController.create({
              header: 'Reason of Rejecting Hawker Account',
              inputs: [
                {
                  name: 'reason',
                  placeholder: 'Tell them why',
                },
              ],
              buttons: [
                {
                  text: 'OK',
                  handler: async (data) => {
                    this.hawkerAccountManagementService
                      .rejectHawker(this.user._id, data.reason)
                      .subscribe((res: User) => {
                        this.modalController.dismiss(this.user._id);
                        this.presentToast('Hawker Account Rejected');
                      });
                  },
                },
                {
                  text: 'Cancel',
                  handler: () => {
                    return;
                  },
                },
              ],
            });
            (await alertInput).present();
          },
        },
        {
          text: 'No',
          handler: () => {
            return;
          },
        },
      ],
    });
    (await confirmPrompt).present();
  }

  downloadHawkerDocuments() {
    this.hawkerAccountManagementService
      .downloadHawkerDocumentsAsZip(this.user.email)
      .subscribe(
        async data => {
          const blob = new Blob([data], {
            type: 'application/zip'
          });
          const url = window.URL.createObjectURL(blob);
          window.open(url);
          this.presentToast('Documents successfully downloaded.');
        },
        error => {
          this.presentToast(error);
        });
  }

  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
    });
    toast.present();
  }

  dismissModal() {
    this.modalController.dismiss();
  }

}
