import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ViewOutletQrPageRoutingModule } from './view-outlet-qr-routing.module';
import { ViewOutletQrPage } from './view-outlet-qr.page';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewOutletQrPageRoutingModule,
    NgxQRCodeModule
  ],
  declarations: [ViewOutletQrPage]
})
export class ViewOutletQrPageModule {}
