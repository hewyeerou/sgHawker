import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditCustomizationPageRoutingModule } from './edit-customization-routing.module';

import { EditCustomizationPage } from './edit-customization.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditCustomizationPageRoutingModule
  ],
  declarations: [EditCustomizationPage]
})
export class EditCustomizationPageModule {}
