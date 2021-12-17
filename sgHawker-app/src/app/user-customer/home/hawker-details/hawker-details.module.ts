import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { HawkerDetailsPageRoutingModule } from './hawker-details-routing.module';
import { HawkerDetailsPage } from './hawker-details.page';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  declarations: [
    HawkerDetailsPage,
  ],
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    IonicModule,
    HawkerDetailsPageRoutingModule
  ],
})
export class HawkerDetailsPageModule { }
