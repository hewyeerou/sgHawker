import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AccounttierPageRoutingModule } from './accounttier-routing.module';

import { AccounttierPage } from './accounttier.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AccounttierPageRoutingModule
  ],
  declarations: [AccounttierPage]
})
export class AccounttierPageModule {}
