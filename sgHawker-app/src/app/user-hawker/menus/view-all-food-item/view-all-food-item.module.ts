import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewAllFoodItemPageRoutingModule } from './view-all-food-item-routing.module';

import { ViewAllFoodItemPage } from './view-all-food-item.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewAllFoodItemPageRoutingModule
  ],
  declarations: [ViewAllFoodItemPage]
})
export class ViewAllFoodItemPageModule {}
