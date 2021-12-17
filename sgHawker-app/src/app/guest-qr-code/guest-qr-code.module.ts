import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GuestQrCodePageRoutingModule } from './guest-qr-code-routing.module';

import { GuestQrCodePage } from './guest-qr-code.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GuestQrCodePageRoutingModule
  ],
  declarations: [GuestQrCodePage]
})
export class GuestQrCodePageModule {}
