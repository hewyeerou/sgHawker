import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CashOrderModalPageRoutingModule } from './cash-order-modal-routing.module';

import { CashOrderModalPage } from './cash-order-modal.page';
import { CashOrderAccordionComponent } from '../cash-order-accordion/cash-order-accordion.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CashOrderModalPageRoutingModule
  ],
  declarations: [CashOrderModalPage, CashOrderAccordionComponent]
})
export class CashOrderModalPageModule { }
