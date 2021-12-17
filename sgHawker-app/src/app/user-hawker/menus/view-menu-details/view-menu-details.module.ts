import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewMenuDetailsPageRoutingModule } from './view-menu-details-routing.module';

import { ViewMenuDetailsPage } from './view-menu-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewMenuDetailsPageRoutingModule
  ],
  declarations: [ViewMenuDetailsPage]
})
export class ViewMenuDetailsPageModule {}
