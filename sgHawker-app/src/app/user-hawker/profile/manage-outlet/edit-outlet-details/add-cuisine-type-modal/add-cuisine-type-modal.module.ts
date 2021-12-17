import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddCuisineTypeModalPageRoutingModule } from './add-cuisine-type-modal-routing.module';

import { AddCuisineTypeModalPage } from './add-cuisine-type-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddCuisineTypeModalPageRoutingModule
  ],
  declarations: [AddCuisineTypeModalPage]
})
export class AddCuisineTypeModalPageModule {}
