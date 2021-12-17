import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateMenuPageRoutingModule } from './create-menu-routing.module';

import { CreateMenuPage } from './create-menu.page';
import { ItemCategoryComponent } from '../item-category/item-category.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateMenuPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [CreateMenuPage, ItemCategoryComponent]
})
export class CreateMenuPageModule { }
