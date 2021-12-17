import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CategoryChangeModalPageRoutingModule } from './category-change-modal-routing.module';
import { CategoryChangeModalPage } from './category-change-modal.page';
import { ItemCategoryComponent } from '../item-category/item-category.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CategoryChangeModalPageRoutingModule,
    NgSelectModule,
    NgOptionHighlightModule
  ],
  declarations: [CategoryChangeModalPage, ItemCategoryComponent]
})
export class CategoryChangeModalPageModule { }
