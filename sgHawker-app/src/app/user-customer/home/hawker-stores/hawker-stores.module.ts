import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { HawkerStoresPageRoutingModule } from './hawker-stores-routing.module';

import { HawkerStoresPage } from './hawker-stores.page';
import { AllPromotionsModalComponent } from './all-promotions-modal/all-promotions-modal.component';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    IonicModule,
    HawkerStoresPageRoutingModule
  ],
  declarations: [
    HawkerStoresPage,
    AllPromotionsModalComponent
  ]
})

export class HawkerStoresPageModule {}
