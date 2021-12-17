import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';

import { Outlet } from 'src/app/models/outlet';
import { OutletService } from 'src/app/services/outlet.service';
import { OperatingDaysEnum } from 'src/app/models/enums/operating-days-enum';
import { User } from '../../../models/user';

@Component({
  selector: 'app-create-outlet-modal',
  templateUrl: './create-outlet-modal.page.html',
  styleUrls: ['./create-outlet-modal.page.scss'],
})
export class CreateOutletModalPage implements OnInit {

  @Input() hawker: User;

  newOutlet: Outlet;
  createOutletForm: FormGroup;
  formValid: boolean;
  formSubmitted: boolean;

  constructor(
    public modalCtrl: ModalController,
    public formBuilder: FormBuilder,
    public toastController: ToastController,
    private outletService: OutletService,
  ) {
    this.createOutletForm = formBuilder.group({
      outletName: ['', Validators.required],
      outletAddress: ['', Validators.required],
      hawkerCentreName: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.newOutlet = new Outlet();
  }

  dismiss(createdOutlet) {
    this.modalCtrl.dismiss({
      outlet: createdOutlet
    });
  }

  checkFormValid() {
    this.formValid = true;
    const controls = this.createOutletForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        this.formValid = false;
        return;
      }
    }
  }

  //Get Form Error
  get errorControl() {
    return this.createOutletForm.controls;
  }

  createOutlet() {
    this.formSubmitted = true;
    this.newOutlet.outletName = this.createOutletForm.value.outletName;
    this.newOutlet.outletAddress = this.createOutletForm.value.outletAddress;
    this.newOutlet.hawkerCentreName = this.createOutletForm.value.hawkerCentreName;
    this.newOutlet.businessHrsOption = 'same';
    // this.newOutlet.outletOperatingHrs = [];
    this.newOutlet.outletContactNumber = '';
    this.newOutlet.cuisineType = [];

    // eslint-disable-next-line no-underscore-dangle
    this.outletService.createOutlet(this.newOutlet, this.hawker._id).subscribe(
      (createdOutlet) => {
        this.dismiss(createdOutlet);
        this.presentMessageToast('Outlet for ' + this.hawker.name + ' has been created');
      },
      (error) => {
        this.presentMessageToast('Unable to create outlet' + error);
      }
    );
  }

  async presentMessageToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 3000,
    });
    toast.present();
  }
}
