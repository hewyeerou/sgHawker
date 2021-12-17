import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Outlet } from 'src/app/models/outlet';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { OutletService } from 'src/app/services/outlet.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-edit-outlet-modal',
  templateUrl: './edit-outlet-modal.page.html',
  styleUrls: ['./edit-outlet-modal.page.scss'],
})
export class EditOutletModalPage implements OnInit {

  @Input() outlet: Outlet;

  // edit outlet form
  editOutletForm: FormGroup;
  formValid: boolean;
  formSubmitted: boolean;

  constructor(
    public modalCtrl: ModalController,
    public formBuilder: FormBuilder,
    private outletService: OutletService,
    public toastController: ToastController
  ) {
    this.editOutletForm = this.formBuilder.group({
      outletName: ['', Validators.required],
      outletAddress: ['', Validators.required],
      hawkerCentreName: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.formValid = true;
    this.editOutletForm.patchValue({
      outletName: this.outlet.outletName,
      outletAddress: this.outlet.outletAddress,
      hawkerCentreName: this.outlet.hawkerCentreName
    });
  }

  //Get Form Error
  get errorControl() {
    return this.editOutletForm.controls;
  }

  //Check for form validation
  checkFormValid() {
    this.formValid = true;
    const controls = this.editOutletForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        this.formValid = false;
        return;
      }
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  editOutlet() {
    const outlet = this.outlet;
    outlet.outletName = this.editOutletForm.value.outletName;
    outlet.outletAddress = this.editOutletForm.value.outletAddress;
    outlet.hawkerCentreName = this.editOutletForm.value.hawkerCentreName;

    this.outletService.updateOutletDetails(outlet)
      .subscribe(
        updatedOutlet => {
          this.modalCtrl.dismiss(updatedOutlet);
          this.presentMessageToast('Outlet has been updated');
        },
        error => {
          this.presentMessageToast('Unable to update outlet details: ' + error);
        }
      )
  }

  presentMessageToast(msg) {
    this.toastController.create({
      message: msg,
      duration: 3000,
    }).then(toast => {
      toast.present();
    })
  }
}

