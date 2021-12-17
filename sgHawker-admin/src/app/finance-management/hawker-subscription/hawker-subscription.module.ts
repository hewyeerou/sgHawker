import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HawkerSubscriptionPageRoutingModule } from './hawker-subscription-routing.module';
import { HawkerSubscriptionPage } from './hawker-subscription.page';
import { DataTablesModule } from 'angular-datatables';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HawkerSubscriptionPageRoutingModule,
    DataTablesModule
  ],
  declarations: [HawkerSubscriptionPage]
})
export class HawkerSubscriptionPageModule {}
