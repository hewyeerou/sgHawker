import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuCategoryModalPageRoutingModule } from './menu-category-modal-routing.module';

import { MenuCategoryModalPage } from './menu-category-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuCategoryModalPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [MenuCategoryModalPage]
})
export class MenuCategoryModalPageModule { }
