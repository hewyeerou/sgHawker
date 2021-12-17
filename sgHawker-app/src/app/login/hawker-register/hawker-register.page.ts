/* eslint-disable max-len */
import { Component, Injectable, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../models/user';
import { SessionService } from '../../services/session.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { AccountTypeEnum } from '../../models/enums/account-type-enum.enum';
import { AccountStatusEnum } from 'src/app/models/enums/account-status-enum.enum';
import { AccountTierEnum } from 'src/app/models/enums/account-tier-enum.enum';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-hawker-register',
  templateUrl: './hawker-register.page.html',
  styleUrls: ['./hawker-register.page.scss'],
})
export class HawkerRegisterPage implements OnInit {
  error: string;

  newHawker: User;
  password: string;
  cfmPassword: string;
  registerForm: FormGroup;
  formSubmitted: boolean;
  passwordSimilar: boolean;
  loading: boolean;
  formValid: boolean;

  files: File[];
  existFiles = false;

  insertSuccess: boolean;

  constructor(
    public sessionService: SessionService,
    private userService: UserService,
    private router: Router, public formBuilder: FormBuilder,
    public alertController: AlertController) {
    //Form Validation
    this.registerForm = formBuilder.group({
      name: ['', Validators.compose([Validators.maxLength(100), Validators.required])],
      password: ['', Validators.compose([Validators.minLength(8), Validators.required])],
      email: ['', Validators.compose([Validators.maxLength(70), Validators.pattern('^[a-zA-Z0-9._]+[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$'), Validators.required])],
      cfmPassword: ['', Validators.compose([Validators.minLength(8), Validators.required])],
      phone: ['', Validators.compose([Validators.maxLength(8), Validators.required, Validators.pattern('[0-9]*')])],

    });
  }

  ngOnInit() {
    this.files = [];
    this.newHawker = new User();
  }

  //Get Form Error
  get errorControl() {
    return this.registerForm.controls;
  }

  //Check for form validation
  checkFormValid() {
    if (
      this.registerForm.value.password !== this.registerForm.value.cfmPassword
    ) {
      this.formValid = false;
      return;
    }

    if (this.files && this.files.length === 0) {
      this.formValid = false;
      return;
    }

    this.formValid = true;
    const controls = this.registerForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        this.formValid = false;
        return;
      }
    }
  }

  //Register Method
  register() {
    this.formSubmitted = true;
    this.newHawker.name = this.registerForm.value.name;
    this.newHawker.email = this.registerForm.value.email;
    this.newHawker.phone = this.registerForm.value.phone;
    this.newHawker.password = this.registerForm.value.password;
    this.newHawker.accountType = AccountTypeEnum.HAWKER;
    this.newHawker.accountStatus = AccountStatusEnum.PENDING;
    this.newHawker.accountTier = AccountTierEnum.FREE;
    this.loading = true;

    this.userService.createHawker(this.newHawker).subscribe(
      createdHawker => {
        this.uploadFiles(this.files, this.newHawker.email);
        this.alertController.create({
          cssClass: '',
          header: 'Success',
          message: 'Account has been created and notified to the Admin. We will notify you when your account has been approved.',
          buttons: [
            {
              text: 'OK',
              role: 'OK',
              handler: () => {
                this.registerForm.reset();
                this.router.navigate(['/account']);
              }
            }
          ]
        }).then(alertElement => {
          this.loading = false;
          this.registerForm.reset();
          alertElement.present();

        });
      },
      (error) => {
        this.alertController
          .create({
            header: 'Hmm..something went wrong',
            message: 'Unable to create account: ' + error,
            buttons: [
              {
                text: 'Dismiss',
                role: 'cancel',
              },
            ],
          })
          .then((alertElement) => {
            this.loading = false;
            alertElement.present();
          });
      }
    );
  }

  uploadFiles(arrFiles, email) {
    for (const i of arrFiles) {

      // Create form data
      const formData = new FormData();
      // Store form name as "file" with file data
      formData.append('file', i, email + '_' + i.name);

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      this.userService.uploadDocuments(formData, email).subscribe(
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

  cfmPasswordOnChange() {
    return this.registerForm.value.password === this.registerForm.value.cfmPassword ? false : true;
  }

  goBack() {
    this.router.navigate(['/account']);
    this.registerForm.reset();
  }

  onFileChange(event) {
    this.files = Array.prototype.slice.call(this.files);
    if (!this.existFiles) {
      this.files = event.target.files;
      this.existFiles = true;
      this.checkFormValid();
    } else {
      for (const j of event.target.files) {
        this.files.push(j);
      }
    }
  }

  removeFile(i) {
    this.files = Array.prototype.slice.call(this.files);
    if (this.files.length === 1) {
      this.files = null;
      this.existFiles = false;
    } else {
      this.files.splice(i, 1);
    }
  }
}
