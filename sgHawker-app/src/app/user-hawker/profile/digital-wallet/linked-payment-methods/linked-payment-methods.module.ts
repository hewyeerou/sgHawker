import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LinkedPaymentMethodsPageRoutingModule } from './linked-payment-methods-routing.module';

import { LinkedPaymentMethodsPage } from './linked-payment-methods.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LinkedPaymentMethodsPageRoutingModule
  ],
  declarations: [LinkedPaymentMethodsPage]
})
export class LinkedPaymentMethodsPageModule {}
