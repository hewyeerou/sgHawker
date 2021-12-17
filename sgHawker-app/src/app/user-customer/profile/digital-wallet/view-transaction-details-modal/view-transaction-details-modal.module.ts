import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewTransactionDetailsModalPageRoutingModule } from './view-transaction-details-modal-routing.module';

import { ViewTransactionDetailsModalPage } from './view-transaction-details-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewTransactionDetailsModalPageRoutingModule
  ],
  declarations: [ViewTransactionDetailsModalPage]
})
export class ViewTransactionDetailsModalPageModule {}
