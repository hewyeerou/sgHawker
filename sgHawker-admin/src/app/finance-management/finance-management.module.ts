import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FinanceManagementPageRoutingModule } from './finance-management-routing.module';
import { FinanceManagementPage } from './finance-management.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FinanceManagementPageRoutingModule,
    SharedModule
  ],
  declarations: [
    FinanceManagementPage
  ]
})
export class FinanceManagementPageModule { }
