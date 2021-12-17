import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CustomizationPageRoutingModule } from './customization-routing.module';

import { CustomizationPage } from './customization.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CustomizationPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [CustomizationPage]
})
export class CustomizationPageModule {}
