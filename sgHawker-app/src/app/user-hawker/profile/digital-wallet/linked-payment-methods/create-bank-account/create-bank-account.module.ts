import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CreateBankAccountPageRoutingModule } from './create-bank-account-routing.module';

import { CreateBankAccountPage } from './create-bank-account.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    CreateBankAccountPageRoutingModule
  ],
  declarations: [CreateBankAccountPage]
})
export class CreateBankAccountPageModule {}
