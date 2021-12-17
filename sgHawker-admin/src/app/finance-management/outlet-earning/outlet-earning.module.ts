import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { OutletEarningPageRoutingModule } from './outlet-earning-routing.module';
import { OutletEarningPage } from './outlet-earning.page';
import { DataTablesModule } from 'angular-datatables';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OutletEarningPageRoutingModule,
    DataTablesModule
  ],
  declarations: [OutletEarningPage]
})
export class OutletEarningPageModule { }
