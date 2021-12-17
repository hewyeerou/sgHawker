import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DigitalWalletPageRoutingModule } from './digital-wallet-routing.module';

import { DigitalWalletPage } from './digital-wallet.page';
import { WithdrawSelectModalComponent } from './withdraw-select-modal/withdraw-select-modal.component';
import { SetCashbackModalComponent } from './set-cashback-modal/set-cashback-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DigitalWalletPageRoutingModule,
  ],
  declarations: [
    DigitalWalletPage,
    WithdrawSelectModalComponent,
    SetCashbackModalComponent
  ]
})
export class DigitalWalletPageModule {}
