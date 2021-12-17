import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../../../models/user';
import { Address } from '../../../../models/submodels/address';
import { SessionService } from '../../../../services/session.service';
import { UserService } from '../../../../services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-address-details',
  templateUrl: './address-details.page.html',
  styleUrls: ['./address-details.page.scss'],
})
export class AddressDetailsPage implements OnInit {

  id: any;
  user: User;
  address: Address;
  addressForm: FormGroup;
  formValid: boolean;
  tempDefault: boolean;
  errorMsg: string;
  baseUrl = '/api';

  constructor(private route: ActivatedRoute, public sessionService: SessionService,
    private userService: UserService, private router: Router,
    public formBuilder: FormBuilder, public alertController: AlertController) {
      this.id = this.route.snapshot.params['id']; 
      this.addressForm = formBuilder.group({
        addressDetails: [
          '',
          Validators.compose([Validators.maxLength(100), Validators.required]),
        ],
        postalCode: [
          '',
          Validators.compose([Validators.maxLength(6), Validators.minLength(6), Validators.required]),
        ],
        isDefault: [
        ],
      });
      this.initData();
   }

  ngOnInit() {
  }

  initData() {
    this.user = this.sessionService.getCurrentUser();
    for(const varAddress in this.user.addresses){
      if(this.user.addresses[varAddress]._id === this.id){
        this.address = this.user.addresses[varAddress];
      }
    }

    this.tempDefault = false;
    const controls = this.addressForm.controls;
    for (const name in controls) {
      controls[name].setValue(this.address[name]);
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

    for(const varAddress in this.user.addresses){
      if(this.user.addresses[varAddress]._id === this.id){
        this.user.addresses[varAddress].addressDetails = this.addressForm.value.addressDetails;
        this.user.addresses[varAddress].postalCode = this.addressForm.value.postalCode;
        this.user.addresses[varAddress].isDefault = this.addressForm.value.isDefault;
      }
    }

    if(this.addressForm.value.isDefault === true){
      for(const varAddress in this.user.addresses){
        if(this.user.addresses[varAddress].isDefault === true && this.user.addresses[varAddress]._id !== this.id ){
          this.user.addresses[varAddress].isDefault = false;
        }
      }
    }

    this.userService
      .updateUserDetails(this.user._id, this.user)
      .subscribe(
        updatedUser => {
            this.sessionService.setCurrentUser(updatedUser);
            this.initData();
            this.router.navigate(['/customer/profile/user-address']);
            this.presentAlert('Success', 'Address Details Updated Successfully!');
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

  removeAddress(){
    for(const varAddress in this.user.addresses){
      if(this.user.addresses[varAddress]._id === this.id){
        this.user.addresses.splice(parseInt(varAddress),1);
      }
    }

    this.userService
      .updateUserDetails(this.user._id, this.user)
      .subscribe(
        updatedUser => {
            this.sessionService.setCurrentUser(updatedUser);
            this.router.navigate(['/customer/profile/user-address']);
            this.presentAlert('Success', 'Address Deleted');
        },
        error => {
          this.initData();
          this.presentAlert('Hmm..Something Went Wrong', 'Unable to update address: ' + error);
        }
      );

  }

  showDeleteAlert() {
    
    this.alertController.create({
      header: 'Delete Address?',
      // subHeader: 'Subtitle for alert',
      // message: 'This is an alert message.',
      buttons: [{
        text: 'Cancel'
      },{
        text: 'OK',
        handler: () => this.removeAddress()
      }]
    }).then(res => {

      res.present();

    });
  }

}
