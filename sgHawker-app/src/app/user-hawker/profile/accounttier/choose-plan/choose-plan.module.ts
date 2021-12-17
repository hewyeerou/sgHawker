import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChoosePlanPageRoutingModule } from './choose-plan-routing.module';

import { ChoosePlanPage } from './choose-plan.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChoosePlanPageRoutingModule
  ],
  declarations: [ChoosePlanPage]
})
export class ChoosePlanPageModule {}
