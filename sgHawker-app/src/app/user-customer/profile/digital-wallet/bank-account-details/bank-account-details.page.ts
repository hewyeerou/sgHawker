import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; 
import { ActivatedRoute } from '@angular/router';
import { User } from '../../../../models/user';
import { BankAccount } from '../../../../models/submodels/bankAccount';
import { SessionService } from '../../../../services/session.service';
import { UserService } from '../../../../services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-bank-account-details',
  templateUrl: './bank-account-details.page.html',
  styleUrls: ['./bank-account-details.page.scss'],
})
export class BankAccountDetailsPage implements OnInit {

  id: any;
  user: User;
  bankAccount: BankAccount;
  bankAccountForm: FormGroup;
  formValid: boolean;
  tempDefault: boolean;
  errorMsg: string;
  baseUrl = '/api';

  constructor(private route: ActivatedRoute, public sessionService: SessionService,
    private userService: UserService, private router: Router,
    public formBuilder: FormBuilder, public alertController: AlertController) {
      this.id = this.route.snapshot.params['id'];
      this.bankAccountForm = formBuilder.group({
        isDefault: [
        ],
      });
      this.initData();
   }

  ngOnInit() {
  }

  initData() {
    this.user = this.sessionService.getCurrentUser();
    for(const varBankAccount in this.user.bankAccounts){
      if(this.user.bankAccounts[varBankAccount]._id === this.id){
        this.bankAccount = this.user.bankAccounts[varBankAccount];
      }
    }

    this.tempDefault = false;
    const controls = this.bankAccountForm.controls;
    for (const name in controls) {
      controls[name].setValue(this.bankAccount[name]);
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

    for(const varBankAccount in this.user.bankAccounts){
      if(this.user.bankAccounts[varBankAccount]._id === this.id){
        this.user.bankAccounts[varBankAccount].isDefault = this.bankAccountForm.value.isDefault;
      }
    }

    if(this.bankAccountForm.value.isDefault === true){
      for(const varBankAccount in this.user.bankAccounts){
        if(this.user.bankAccounts[varBankAccount].isDefault === true && this.user.bankAccounts[varBankAccount]._id !== this.id ){
          this.user.bankAccounts[varBankAccount].isDefault = false;
        }
      }
    }
 
    this.userService
      .updateUserDetails(this.user._id, this.user)
      .subscribe(
        updatedUser => {
            this.sessionService.setCurrentUser(updatedUser);
            this.initData();
            this.router.navigate(['/customer/profile/digital-wallet']);
            this.presentAlert('Success', 'Bank Account Details Updated Successfully!');
        },
        error => {
          this.initData();
          this.presentAlert('Hmm..something went wrong', 'Unable to update: ' + error);
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

  removeBankAccount(){
    for(const varBankAccount in this.user.bankAccounts){
      if(this.user.bankAccounts[varBankAccount]._id === this.id){
        this.user.bankAccounts.splice(parseInt(varBankAccount),1);
      }
    }

    this.userService
      .updateUserDetails(this.user._id, this.user)
      .subscribe(
        updatedUser => {
            this.sessionService.setCurrentUser(updatedUser);
            this.router.navigate(['/customer/profile/digital-wallet']);
            this.presentAlert('Success', 'Bank Account Removed');
        },
        error => {
          this.initData();
          this.presentAlert('Hmm..Something Went Wrong', 'Unable to remove bank account: ' + error);
        }
      );

  }

  showDeleteAlert() {
    
    this.alertController.create({
      header: 'Remove Bank Account?',
      buttons: [{
        text: 'Cancel'
      },{
        text: 'OK',
        handler: () => this.removeBankAccount()
      }]
    }).then(res => {

      res.present();

    });
  }
}
