import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';

import { IonicModule } from '@ionic/angular';

import { ViewFoodItemPageRoutingModule } from './view-food-item-routing.module';

import { ViewFoodItemPage } from './view-food-item.page';
import { ItemCategoryComponent } from '../item-category/item-category.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewFoodItemPageRoutingModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgOptionHighlightModule
  ],
  declarations: [ViewFoodItemPage, ItemCategoryComponent]
})
export class ViewFoodItemPageModule { }
