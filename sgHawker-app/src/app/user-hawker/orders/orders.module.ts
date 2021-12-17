import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { MbscModule } from '@mobiscroll/angular-lite';
import { OrdersPageRoutingModule } from './orders-routing.module';

import { OrdersPage } from './orders.page';
import { CashOrderAccordionComponent } from '../home/cash-order-accordion/cash-order-accordion.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrdersPageRoutingModule,
    MbscModule
  ],
  declarations: [OrdersPage, CashOrderAccordionComponent]
})
export class OrdersPageModule { }
