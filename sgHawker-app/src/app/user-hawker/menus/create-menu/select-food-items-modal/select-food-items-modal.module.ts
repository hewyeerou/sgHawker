import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectFoodItemsModalPageRoutingModule } from './select-food-items-modal-routing.module';

import { SelectFoodItemsModalPage } from './select-food-items-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SelectFoodItemsModalPageRoutingModule
  ],
  declarations: [SelectFoodItemsModalPage]
})
export class SelectFoodItemsModalPageModule {}
