import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PendingHawkerAccountsPageRoutingModule } from './pending-hawker-accounts-routing.module';
import { PendingHawkerAccountsPage } from './pending-hawker-accounts.page';
import { DataTablesModule } from 'angular-datatables';
import { PendingAccountDetailsModalComponent } from './pending-account-details-modal/pending-account-details-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PendingHawkerAccountsPageRoutingModule,
    DataTablesModule
  ],
  declarations: [
    PendingHawkerAccountsPage,
    PendingAccountDetailsModalComponent
  ]
})
export class PendingHawkerAccountsPageModule {}
