import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DigitalWalletPageRoutingModule } from './digital-wallet-routing.module';

import { DigitalWalletPage } from './digital-wallet.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DigitalWalletPageRoutingModule
  ],
  declarations: [DigitalWalletPage]
})
export class DigitalWalletPageModule {}
