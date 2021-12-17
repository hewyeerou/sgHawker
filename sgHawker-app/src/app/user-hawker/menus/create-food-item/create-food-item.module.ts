import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateFoodItemPageRoutingModule } from './create-food-item-routing.module';

import { CreateFoodItemPage } from './create-food-item.page';
import { ItemCategoryComponent } from '../item-category/item-category.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateFoodItemPageRoutingModule,
    NgSelectModule,
    NgOptionHighlightModule
  ],
  declarations: [CreateFoodItemPage, ItemCategoryComponent]
})
export class CreateFoodItemPageModule { }
