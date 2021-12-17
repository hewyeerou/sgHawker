import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../../../models/user';
import { Address } from '../../../../models/submodels/address';
import { SessionService } from '../../../../services/session.service';
import { UserService } from '../../../../services/user.service';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-create-address',
  templateUrl: './create-address.page.html',
  styleUrls: ['./create-address.page.scss'],
})
export class CreateAddressPage implements OnInit {

  user: User;
  address: Address;
  addressForm: FormGroup;
  formValid: boolean;
  tempDefault: boolean;
  errorMsg: string;
  baseUrl = '/api';

  constructor(public sessionService: SessionService,
    private userService: UserService,
    public alertController: AlertController, private router: Router) {
      this.addressForm = new FormGroup({
        addressDetails: new FormControl('', [Validators.required, Validators.maxLength(100)]),
        postalCode: new FormControl('', [Validators.required, Validators.maxLength(6), Validators.minLength(6)]),
        isDefault: new FormControl(false, Validators.required),
      });
      this.formValid = false;

      // this.addressForm = formBuilder.group({
      //   addressDetails: [
      //     '',
      //     Validators.compose([Validators.maxLength(100), Validators.required]),
      //   ],
      //   postalCode: [
      //     '',
      //     Validators.compose([Validators.maxLength(6), Validators.minLength(6), Validators.required]),
      //   ],
      //   isDefault: [
      //     Validators.compose([Validators.required]),
      //   ],
      // });
      // this.initData();
    }

  ngOnInit() {
    this.initData();
  }

  initData() {
    this.user = this.sessionService.getCurrentUser();
    if(this.user.addresses === undefined){
      this.user.addresses= [];
    }
    this.tempDefault = false;
    const controls = this.addressForm.controls;
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

    const tempAddress = new Address();
    const { addressDetails, postalCode, isDefault} = this.addressForm.value;
    tempAddress.addressDetails = addressDetails;
    tempAddress.postalCode = postalCode;
    tempAddress.isDefault = this.tempDefault;

    if(tempAddress.isDefault === true){
      for(const varAddress in this.user.addresses){
        if(this.user.addresses[varAddress].isDefault === true ){
          this.user.addresses[varAddress].isDefault = false;
        }
      }
    }
    this.user.addresses.push(tempAddress);
    this.userService
      .updateUserDetails(this.user._id, this.user)
      .subscribe(
        updatedUser => {
            this.sessionService.setCurrentUser(updatedUser);
            this.initData();
            this.router.navigate(['/customer/profile/user-address']);
            this.presentAlert('Success', 'Created Address Successfully!');
        },
        error => {
          this.initData();
          this.presentAlert('Hmm..something went wrong', 'Unable to update address: ' + error);
        }
      );
  }

  get errorControl() {
    return this.addressForm.controls;
  }

  checkFormValid() {
    this.formValid = true;
    const controls = this.addressForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        this.formValid = false;
        return;
      }
    }
  }

}
