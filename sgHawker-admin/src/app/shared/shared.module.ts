import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DataTablesModule } from 'angular-datatables';

import { TransactionHistoryModalComponent } from './transaction-history-modal/transaction-history-modal.component';
import { PopoverComponent } from './popover/popover.component';

@NgModule({
  declarations: [
    PopoverComponent,
    TransactionHistoryModalComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    DataTablesModule,
    FormsModule
  ],
  exports: [
    PopoverComponent,
    TransactionHistoryModalComponent
  ]
})
export class SharedModule { }
