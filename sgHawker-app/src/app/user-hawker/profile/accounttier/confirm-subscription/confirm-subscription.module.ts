import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConfirmSubscriptionPageRoutingModule } from './confirm-subscription-routing.module';

import { ConfirmSubscriptionPage } from './confirm-subscription.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConfirmSubscriptionPageRoutingModule
  ],
  declarations: [ConfirmSubscriptionPage]
})
export class ConfirmSubscriptionPageModule {}
