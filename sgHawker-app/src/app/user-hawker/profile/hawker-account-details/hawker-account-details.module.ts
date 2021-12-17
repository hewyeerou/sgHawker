import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HawkerAccountDetailsPageRoutingModule } from './hawker-account-details-routing.module';

import { HawkerAccountDetailsPage } from './hawker-account-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    HawkerAccountDetailsPageRoutingModule
  ],
  declarations: [HawkerAccountDetailsPage]
})
export class HawkerAccountDetailsPageModule {}
