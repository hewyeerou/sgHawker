import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PremiumAcctsUpgradePageRoutingModule } from './premium-accts-upgrade-routing.module';

import { PremiumAcctsUpgradePage } from './premium-accts-upgrade.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PremiumAcctsUpgradePageRoutingModule
  ],
  declarations: [PremiumAcctsUpgradePage]
})
export class PremiumAcctsUpgradePageModule {}
