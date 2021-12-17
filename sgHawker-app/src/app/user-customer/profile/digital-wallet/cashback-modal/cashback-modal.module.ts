import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CashbackModalPageRoutingModule } from './cashback-modal-routing.module';

import { CashbackModalPage } from './cashback-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CashbackModalPageRoutingModule
  ],
  declarations: [CashbackModalPage]
})
export class CashbackModalPageModule {}
