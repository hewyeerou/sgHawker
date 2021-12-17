import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { IonicModule } from '@ionic/angular';

import { ApprovedHawkerAccountsPageRoutingModule } from './approved-hawker-accounts-routing.module';

import { ApprovedHawkerAccountsPage } from './approved-hawker-accounts.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ApprovedHawkerAccountsPageRoutingModule,
    DataTablesModule
  ],
  declarations: [ApprovedHawkerAccountsPage]
})
export class ApprovedHawkerAccountsPageModule { }
