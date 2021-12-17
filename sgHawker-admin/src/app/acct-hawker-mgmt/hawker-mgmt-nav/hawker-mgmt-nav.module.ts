import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HawkerMgmtNavPageRoutingModule } from './hawker-mgmt-nav-routing.module';

import { HawkerMgmtNavPage } from './hawker-mgmt-nav.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HawkerMgmtNavPageRoutingModule,
  ],
  declarations: [HawkerMgmtNavPage]
})
export class HawkerMgmtNavPageModule {}
