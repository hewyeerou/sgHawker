import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AccountTypeEnum } from 'src/app/models/enums/account-type-enum.enum';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import {
  User
} from '../../models/user';
import { UserService } from '../../services/user.service';
import { AccountTierEnum } from '../../models/enums/account-tier-enum.enum';

@Component({
  selector: 'app-customer-register',
  templateUrl: './customer-register.page.html',
  styleUrls: ['./customer-register.page.scss'],
})
export class CustomerRegisterPage implements OnInit {

  userForm: FormGroup;
  formValid: boolean;
  loading: boolean;
  formSubmitted: boolean;
  file: any;
  imgURL: any;
  imagePath: any;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private userService: UserService
  ) {
  }

  ngOnInit() {
    this.userForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(128)]),
      cfmPassword: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(128)]),
      name: new FormControl('', Validators.required),
      countryCode: new FormControl(''),
      phone: new FormControl('', Validators.maxLength(8)),
      // profileImgSrc: new FormControl(''),
    });
    this.formValid = false;
  }

  get errorControl() {
    return this.userForm.controls;
  }

  checkFormValid() {
    if (this.userForm.value.password !== this.userForm.value.cfmPassword) {
      this.formValid = false;
      return;
    }
    this.formValid = true;
    const controls = this.userForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        this.formValid = false;
        return;
      }
    }
  }

  cfmPasswordOnChange() {
    return this.userForm.value.password === this.userForm.value.cfmPassword ? false : true;
  }

  removeProfileImage() {
    this.imgURL = undefined;
    this.imagePath = undefined;
    this.file = undefined;
  }

  async presentAlert(isError, header, message) {
    const alert = await (!isError ? this.alertController.create({
      header,
      message,
      buttons: [
        {
          text: 'OK',
          role: 'OK',
          handler: () => {
            this.router.navigate(['/account']);
          }
        }
      ]
    }) : this.alertController.create({
      header,
      message,
      buttons: [{
        text: 'Dismiss',
        role: 'cancel'
      }]
    }));
    this.loading = false;
    await alert.present();
  }

  createCustomer() {
    const user = new User();
    const { email, name, password, phone } = this.userForm.value;
    user.email = email;
    user.name = name;
    user.password = password;
    user.phone = '' + phone;
    user.accountType = AccountTypeEnum.CUSTOMER;
    user.accountTier = AccountTierEnum.FREE;
    this.loading = true;

    this.userService
      .createCustomer(user)
      .subscribe(
        createdUser => {
          this.presentAlert(false, 'Success', 'Account has been created successfully created! Please login');
        },
        error => {
          this.presentAlert(true, 'Hmm..something went wrong', 'Unable to create account');
        }
      );
  }
}
