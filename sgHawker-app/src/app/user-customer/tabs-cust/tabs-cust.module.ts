import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabsCustPageRoutingModule } from './tabs-cust-routing.module';

import { TabsCustPage } from './tabs-cust.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabsCustPageRoutingModule
  ],
  declarations: [TabsCustPage]
})
export class TabsCustPageModule {}
