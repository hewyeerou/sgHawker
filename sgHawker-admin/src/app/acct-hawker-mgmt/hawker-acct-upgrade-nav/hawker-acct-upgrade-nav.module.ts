import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HawkerAcctUpgradeNavPageRoutingModule } from './hawker-acct-upgrade-nav-routing.module';

import { HawkerAcctUpgradeNavPage } from './hawker-acct-upgrade-nav.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HawkerAcctUpgradeNavPageRoutingModule
  ],
  declarations: [HawkerAcctUpgradeNavPage]
})
export class HawkerAcctUpgradeNavPageModule {}
