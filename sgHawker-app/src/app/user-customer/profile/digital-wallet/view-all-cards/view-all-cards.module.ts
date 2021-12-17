import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewAllCardsPageRoutingModule } from './view-all-cards-routing.module';

import { ViewAllCardsPage } from './view-all-cards.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewAllCardsPageRoutingModule
  ],
  declarations: [ViewAllCardsPage]
})
export class ViewAllCardsPageModule {}
