import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TopUpWalletModalPageRoutingModule } from './top-up-wallet-modal-routing.module';

import { TopUpWalletModalPage } from './top-up-wallet-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TopUpWalletModalPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [TopUpWalletModalPage]
})
export class TopUpWalletModalPageModule { }
