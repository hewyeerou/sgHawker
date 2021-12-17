/* eslint-disable arrow-body-style */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { AlertController, ModalController, NavController, ToastController } from '@ionic/angular';
import { User } from 'src/app/models/user';
import { HawkerAccountManagementService } from 'src/app/services/hawker-account-management.service';
import { CreateOutletModalPage } from './create-outlet-modal/create-outlet-modal.page';
import * as _ from 'lodash';
import { Outlet } from '../../models/outlet';
import { AccountTierEnum } from 'src/app/models/enums/account-tier-enum.enum';
import { EditOutletModalPage } from './edit-outlet-modal/edit-outlet-modal.page';
import { OutletService } from '../../services/outlet.service';

@Component({
  selector: 'app-view-hawker-account-details',
  templateUrl: './view-hawker-account-details.page.html',
  styleUrls: ['./view-hawker-account-details.page.scss'],
})
export class ViewHawkerAccountDetailsPage implements OnInit {

  updatedHawker: User;
  outlets: Outlet[] = [];
  dtOptions: any = {};
  readOnly: boolean;
  automaticClose = false;
  private hawker: User;

  constructor(
    private activatedRoute: ActivatedRoute,
    private hawkerService: HawkerAccountManagementService,
    private outletService: OutletService,
    private location: Location,
    public modalCtrl: ModalController,
    public toastController: ToastController,
    public alertController: AlertController,
    private hawkerAccountManagementService: HawkerAccountManagementService) {
  }

  ngOnInit() {
    this.readOnly = true;
    this.dtOptions = {
      pagingType: 'full_numbers',
      dom: 'Bfrtip',
      responsive: true,
      buttons: []
    };
    this.hawker = new User();
    this.updatedHawker = new User();
  }

  ionViewWillEnter() {
    this.hawkerService.getHawkerAccount(this.activatedRoute.snapshot.params.id).subscribe(
      user => {
        this.hawker = _.cloneDeep(user);
        this.updatedHawker = _.cloneDeep(user);
        this.outlets = this.updatedHawker.outlets;
      },
      error => {
        this.alertController
          .create({
            message: 'Something went wrong! ' + error,
            buttons: [
              {
                text: 'Go back',
                handler: () => {
                  this.location.back();
                },
              },
            ],
          })
          .then(x => x.present());
      });
  }

  toggleReadOnly() {
    if (this.readOnly) {
      this.readOnly = !this.readOnly;
    } else {
      this.alertController.create({
        message: 'Are you sure you want to cancel update?',
        buttons: [
          {
            text: 'Yes',
            handler: () => {
              this.updatedHawker = _.cloneDeep(this.hawker);
              this.readOnly = !this.readOnly;
            }
          },
          {
            text: 'No',
            role: 'cancel'
          }
        ]
      })
        .then(x => x.present());
    }
  }

  updateAccountDetails(detailsForm) {
    if (detailsForm.valid) {
      this.hawkerService.updateHawkerAccount(this.updatedHawker).subscribe(
        updatedUser => {
          this.hawker = _.cloneDeep(updatedUser);
          this.updatedHawker = _.cloneDeep(updatedUser);
          this.readOnly = true;
          this.presentToast('Hawker information has been updated');
        },
        error => {
          this.readOnly = true;
          this.presentToast('Something went wrong: ' + error);
        }
      );
    } else {
      this.alertController.create({
        message: 'Please fill in all fields',
        buttons: [
          {
            text: 'Dismiss',
            role: 'cancel'
          }
        ]
      })
        .then(x => x.present());
    }
  }

  deleteOutlet(outlet: Outlet) {
    this.alertController.create({
      message: 'Are you sure you want to delete this outlet?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.outletService
              .deleteOutlet(outlet._id)
              .subscribe(
                updatedOutlet => {
                  this.outlets = _.filter(this.outlets, outlet => outlet._id !== updatedOutlet._id);
                  this.outlets.push(updatedOutlet);
                  this.presentToast('Outlet successfully deleted!');
                },
                error => {
                  this.alertController.create({
                    message: 'Failed to delete the outlet!',
                    buttons: [
                      {
                        text: 'Dismiss',
                        role: 'cancel'
                      }
                    ]
                  }).then(x => x.present());
                })
          }
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    }).then(x => x.present());
  };

  downloadHawkerDocuments() {
    this.hawkerAccountManagementService
      .downloadHawkerDocumentsAsZip(this.hawker.email)
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

  async presentCreateOutletModal() {
    if (this.hawker.accountTier === AccountTierEnum.FREE && this.outlets.filter(x => !x.isDeleted).length === 1) {
      this.alertController.create({
        message: 'Hawker account with free tier can only have one active outlet!',
        buttons: [
          {
            text: 'Dismiss',
            role: 'cancel'
          },
        ],
      }).then(x => x.present());
      return;
    }
    const modal = await this.modalCtrl.create({
      component: CreateOutletModalPage,
      cssClass: 'create-outlet-modal-css',
      componentProps: {
        'hawker': this.hawker
      },
      showBackdrop: true,
      backdropDismiss: false
    });
    modal.onDidDismiss()
      .then((data) => {
        const modalData = data.data;
        // check if the data passed back is empty/undefined
        if (modalData !== undefined && modalData.outlet !== undefined) {
          this.outlets.push(modalData.outlet);
        }
      });
    return await modal.present();
  }

  async presentEditOutletModal(outlet) {
    const modal = await this.modalCtrl.create({
      component: EditOutletModalPage,
      cssClass: 'edit-outlet-modal-css',
      componentProps: {
        'outlet': outlet
      },
      showBackdrop: true,
      backdropDismiss: false
    });
    modal.onDidDismiss().then(data => {
      if (data.data) {
        const updatedOutlet = <Outlet>data.data;
        _.forEach(this.outlets, outlet => {
          if (outlet._id === updatedOutlet._id) {
            outlet = updatedOutlet;
          }
        });
      }
    })
    return await modal.present();
  }
}