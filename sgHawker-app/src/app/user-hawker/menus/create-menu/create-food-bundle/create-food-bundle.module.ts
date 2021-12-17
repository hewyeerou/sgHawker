import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateFoodBundlePageRoutingModule } from './create-food-bundle-routing.module';

import { CreateFoodBundlePage } from './create-food-bundle.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateFoodBundlePageRoutingModule
  ],
  declarations: [CreateFoodBundlePage]
})
export class CreateFoodBundlePageModule {}
