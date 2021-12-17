/* eslint-disable no-underscore-dangle */
/* eslint-disable arrow-body-style */
import { Component, OnInit } from '@angular/core';

import { User } from 'src/app/models/user';
import { HawkerAccountManagementService } from 'src/app/services/hawker-account-management.service';
import {
  PendingAccountDetailsModalComponent
} from './pending-account-details-modal/pending-account-details-modal.component';

import { ModalController, ToastController } from '@ionic/angular';
import * as _ from 'lodash';

@Component({
  selector: 'app-pending-hawker-accounts',
  templateUrl: './pending-hawker-accounts.page.html',
  styleUrls: ['./pending-hawker-accounts.page.scss'],
})
export class PendingHawkerAccountsPage implements OnInit {

  dtOptions: any = {};
  pendingHawkers: User[] = [];

  constructor(
    private hawkerAccountManagementService: HawkerAccountManagementService,
    private modalController: ModalController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      dom: 'Bfrtip',
      responsive: true,
      buttons: ['copy', 'print', 'excel'],
    };

    this.hawkerAccountManagementService
      .findAllPendingHawkerAccounts()
      .subscribe((res: any[]) => {
        this.pendingHawkers = res;
      });
  }

  downloadHawkerDocuments(hawker: User) {
    this.hawkerAccountManagementService
      .downloadHawkerDocumentsAsZip(hawker.email)
      .subscribe(
        async data => {
          const blob = new Blob([data], {
            type: 'application/zip'
          });
          const url = window.URL.createObjectURL(blob);
          window.open(url);
          this.toastController.create({
            message: 'Documents successfully downloaded!',
            duration: 2000,
          }).then(x => x.present());
        },
        error => {
          this.toastController.create({
            message: 'Something went wrong!' + error,
            duration: 2000,
          }).then(x => x.present());
        });
  }

  async showPendingAccountDetailsModal(user: User) {
    const modal = await this.modalController.create({
      component: PendingAccountDetailsModalComponent,
      componentProps: {
        'user': user
      }
    })

    modal.onDidDismiss().then(data => {
      this.pendingHawkers = _.filter(this.pendingHawkers, account => account._id !== data.data);
    })
    await modal.present();
  }

}
