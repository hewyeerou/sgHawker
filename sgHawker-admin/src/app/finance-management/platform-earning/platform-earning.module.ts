import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlatformEarningPageRoutingModule } from './platform-earning-routing.module';

import { PlatformEarningPage } from './platform-earning.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PlatformEarningPageRoutingModule
  ],
  declarations: [PlatformEarningPage]
})
export class PlatformEarningPageModule {}
