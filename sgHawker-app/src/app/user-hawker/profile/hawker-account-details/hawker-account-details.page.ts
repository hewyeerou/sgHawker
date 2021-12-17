/* eslint-disable guard-for-in */
/* eslint-disable no-underscore-dangle */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../../models/user';
import { SessionService } from '../../../services/session.service';
import { UserService } from '../../../services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-hawker-account-details',
  templateUrl: './hawker-account-details.page.html',
  styleUrls: ['./hawker-account-details.page.scss'],
})
export class HawkerAccountDetailsPage implements OnInit {

  user: User;
  accountForm: FormGroup;
  formValid: boolean;
  errorMsg: string;
  imagePath: any;
  file: any;
  imgURL: any;
  previewPic: boolean;
  baseUrl = '/api';

  constructor(private router: Router,
    public sessionService: SessionService, private userService: UserService,
    public formBuilder: FormBuilder, public alertController: AlertController) {
    this.accountForm = formBuilder.group({
      name: [
        '',
        Validators.compose([Validators.maxLength(100), Validators.required]),
      ],
      email: [
        '',
        Validators.compose([
          Validators.maxLength(70),
          Validators.pattern(
            '^[a-zA-Z0-9._]+[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$'
          ),
          Validators.required,
        ]),
      ],
      phone: [
        '',
        Validators.compose([Validators.maxLength(8), Validators.minLength(8)]),
      ],
    });
    this.initData(true);
  }

  initData(resetPhoto) {
    this.user = this.sessionService.getCurrentUser();
    const controls = this.accountForm.controls;
    for (const name in controls) {
      controls[name].setValue(this.user[name]);
    }
    if (resetPhoto) {
      this.previewPic = false;
      this.imgURL = undefined;
    }
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.initData(true);
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

  updateDetails() {
    this.user = {
      ...this.user,
      name: this.accountForm.value.name,
      email: this.accountForm.value.email,
      phone: this.accountForm.value.phone,
    };

    this.userService
      .updateUserDetails(this.user._id, this.user)
      .subscribe(
        updatedUser => {
          if (this.file) {
            this.userService.uploadUserProfilePicture(updatedUser.email, this.file).subscribe(
              newUser => {
                this.sessionService.setCurrentUser(newUser);
                this.user = newUser;
                this.initData(true);
                this.presentAlert('Success', 'Profile Details Changed Successfully!');
              },
              error => {
                this.initData(false);
                this.presentAlert('Hmm..something went wrong', 'Account Updated Successfully, but unable to upload photo.');
              }
            );
          } else {
            this.sessionService.setCurrentUser(updatedUser);
            this.initData(false);
            this.presentAlert('Success', 'Profile details changed successfully!');
          }
        },
        error => {
          this.initData(false);
          this.presentAlert('Hmm..something went wrong', 'Unable to update account: ' + error);
        }
      );
  }


  get errorControl() {
    return this.accountForm.controls;
  }

  checkFormValid() {
    this.formValid = true;
    const controls = this.accountForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        this.formValid = false;
        return;
      }
    }
  }

  preview(files) {
    if (files.length === 0) {
      return;
    }

    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      return this.alertController.create({
        cssClass: '',
        header: 'Only images are supported!',
        buttons: [
          {
            text: 'Dismiss',
            role: 'cancel',
          }
        ]
      }).then(x => x.present());
    }

    const reader = new FileReader();
    this.imagePath = files;
    this.file = files[0];
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
    };
    this.previewPic = true;
  }

  removeProfileImage() {
    this.imgURL = undefined;
    this.imagePath = undefined;
    this.file = undefined;
  }

}
