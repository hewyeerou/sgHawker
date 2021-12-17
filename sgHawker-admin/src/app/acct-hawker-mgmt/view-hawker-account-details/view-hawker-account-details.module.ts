import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewHawkerAccountDetailsPageRoutingModule } from './view-hawker-account-details-routing.module';

import { ViewHawkerAccountDetailsPage } from './view-hawker-account-details.page';
import { DataTablesModule } from 'angular-datatables';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewHawkerAccountDetailsPageRoutingModule,
    DataTablesModule
  ],
  declarations: [ViewHawkerAccountDetailsPage]
})
export class ViewHawkerAccountDetailsPageModule {}
