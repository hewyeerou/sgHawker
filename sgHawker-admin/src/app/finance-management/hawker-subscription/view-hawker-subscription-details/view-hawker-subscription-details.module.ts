import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewHawkerSubscriptionDetailsPageRoutingModule } from './view-hawker-subscription-details-routing.module';

import { ViewHawkerSubscriptionDetailsPage } from './view-hawker-subscription-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewHawkerSubscriptionDetailsPageRoutingModule
  ],
  declarations: [ViewHawkerSubscriptionDetailsPage]
})
export class ViewHawkerSubscriptionDetailsPageModule {}
