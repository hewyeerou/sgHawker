import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../../../models/user';
import { BankAccount } from '../../../../models/submodels/bankAccount';
import { SessionService } from '../../../../services/session.service';
import { UserService } from '../../../../services/user.service';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-create-bank-account',
  templateUrl: './create-bank-account.page.html',
  styleUrls: ['./create-bank-account.page.scss'],
})
export class CreateBankAccountPage implements OnInit {

  user: User;
  bankAccount: BankAccount;
  bankAccountForm: FormGroup;
  formValid: boolean;
  tempDefault: boolean;
  errorMsg: string;
  baseUrl = '/api';

  constructor(public sessionService: SessionService,
    private userService: UserService,
    public alertController: AlertController, private router: Router) {
      this.bankAccountForm = new FormGroup({
        fullName: new FormControl('', [Validators.required, Validators.maxLength(100)]),
        accountNumber: new FormControl('', [Validators.required, Validators.maxLength(100)]),
        nameOfBank: new FormControl('', [Validators.required, Validators.maxLength(100)]),
        isDefault: new FormControl(false, Validators.required),
      });
      this.formValid = false;
    }

  ngOnInit() {
    this.initData();
  }

  initData() {
    this.user = this.sessionService.getCurrentUser();
    if(this.user.bankAccounts === undefined){
      this.user.bankAccounts= [];
    }
    this.tempDefault = false;
    const controls = this.bankAccountForm.controls;
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

    const tempBankAccount = new BankAccount();
    const { fullName, accountNumber, nameOfBank, isDefault} = this.bankAccountForm.value;
    tempBankAccount.fullName = fullName;
    tempBankAccount.accountNumber = accountNumber;
    tempBankAccount.nameOfBank = nameOfBank;
    tempBankAccount.isDefault = this.tempDefault;

    if(tempBankAccount.isDefault === true){
      for(const varBankAccount in this.user.bankAccounts){
        if(this.user.bankAccounts[varBankAccount].isDefault === true ){
          this.user.bankAccounts[varBankAccount].isDefault = false;
        }
      }
    }
    this.user.bankAccounts.push(tempBankAccount);
    this.userService
      .updateUserDetails(this.user._id, this.user)
      .subscribe(
        updatedUser => {
            this.sessionService.setCurrentUser(updatedUser);
            this.initData();
            this.router.navigate(['/customer/profile/digital-wallet']);
            this.presentAlert('Success', 'Added Bank Account Successfully!');
        },
        error => {
          this.initData();
          this.presentAlert('Hmm..something went wrong', 'Unable to add bank account: ' + error);
        }
      );
  }

  get errorControl() {
    return this.bankAccountForm.controls;
  }

  checkFormValid() {
    this.formValid = true;
    const controls = this.bankAccountForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        this.formValid = false;
        return;
      }
    }
  }

}
