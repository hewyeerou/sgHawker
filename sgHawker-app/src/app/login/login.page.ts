import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, UrlSerializer } from '@angular/router';
import { AlertController, AlertInput, ToastController } from '@ionic/angular';
import { AccountStatusEnum } from '../models/enums/account-status-enum.enum';
import { AccountTierEnum } from '../models/enums/account-tier-enum.enum';
import { AccountTypeEnum } from '../models/enums/account-type-enum.enum';
import { User } from '../models/user';
import { OutletService } from '../services/outlet.service';
import { SessionService } from '../services/session.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email: string;
  password: string;
  isCustomer: boolean;
  loginForm: FormGroup;
  formSubmitted: boolean;
  formValid: boolean;
  userInvalid: boolean;
  isEmptyField: boolean;

  constructor(
    public sessionService: SessionService,
    private userService: UserService,
    private router: Router,
    public formBuilder: FormBuilder,
    public alertController: AlertController,
    public outletService: OutletService,
    public toastController: ToastController
  ) {
    this.loginForm = formBuilder.group({
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
      password: [
        '',
        Validators.compose([Validators.minLength(8), Validators.required]),
      ],
    });
  }

  ngOnInit() {
    this.formSubmitted = false;
    this.isCustomer = true;
    if (this.sessionService.getIsLogin()) {
      const user: User = this.sessionService.getCurrentUser();
    }
    this.isEmptyField = true;
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

  login() {
    this.formSubmitted = true;
    this.email = this.loginForm.value.email;
    this.password = this.loginForm.value.password;
    this.isEmptyField = false;

    if (this.isCustomer) {

      this.userService.customerLogin(this.email, this.password).subscribe(
        (user) => {
          this.sessionService.setIsLogin(true);
          this.sessionService.setCurrentUser(user);
          this.router.navigate(['/customer']);
          this.resetForm();
        },
        (error) => {
          this.presentAlert('Login Failed', 'Invalid Email and Password');
        }
      );

    } else {
      this.userService.hawkerLogin(this.email, this.password).subscribe(
        (user) => {
          if (user.accountTier === AccountTierEnum.FREE || user.accountTier === AccountTierEnum.PREMIUM) {
            this.sessionService.setCurrentOutlet(user.outlets[0]);
            this.sessionService.setCurrentUser(user);
            this.sessionService.setIsLogin(true);
            this.router.navigate(['/hawker']);
            this.resetForm();
          } else {
            const outlets = user.outlets.map(outlet => {
              const radioObj = {
                type: 'radio',
                value: undefined,
                label: '',
              };
              if (outlet.isMaster) {
                radioObj.label = outlet.outletName + ' [Master]';
              } else {
                radioObj.label = outlet.outletName;
              }
              radioObj.value = outlet;
              return radioObj;
            });

            this.alertController.create({
              header: 'Select outlet',
              inputs: outlets as AlertInput[],
              buttons: [
                {
                  text: 'Login',
                  handler: (data) => {
                    this.sessionService.setCurrentOutlet(data);
                    this.sessionService.setCurrentUser(user);
                    this.sessionService.setIsLogin(true);
                    this.router.navigate(['/hawker']);
                    this.resetForm();
                  }
                }
              ]
            }).then(x => x.present());
          }
        },
        (error) => {
          this.presentAlert('Login Failed', 'Account is invalid, or you are attempting multiple sign in with a free-tier account.');
        }
      );
    }
  }

  setOutletAndUser(user) {
    this.outletService.getOutletDetails(user.outlets[0]._id).subscribe(
      selectedOutlet => {
        this.sessionService.setCurrentOutlet(selectedOutlet);
        this.sessionService.setCurrentUser(user);
        this.sessionService.setIsLogin(true);
        this.router.navigate(['/hawker']);
        this.resetForm();
      },
      async (error) => {
        const toast = await this.toastController.create({
          message: 'Could not Login: ' + error,
          duration: 2000,
        });
        toast.present();
      }
    );
  }

  get errorControl() {
    return this.loginForm.controls;
  }

  tabs(isCustomer: boolean) {
    this.isCustomer = isCustomer;
    this.resetForm();
  }

  resetForm() {
    this.formSubmitted = false;
    this.loginForm.reset();
  }

  clickHawkerRegister() {
    this.router.navigate(['account/hawker-register']);
  }

  clickCustomerRegister() {
    this.router.navigate(['account/customer-register']);
  }

  checkFormValid() {
    this.formValid = true;
    const controls = this.loginForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        this.formValid = false;
        return;
      }
    }
  }
}
