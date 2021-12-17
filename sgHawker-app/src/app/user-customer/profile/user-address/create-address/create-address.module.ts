import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CreateAddressPageRoutingModule } from './create-address-routing.module';

import { CreateAddressPage } from './create-address.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    CreateAddressPageRoutingModule
  ],
  declarations: [CreateAddressPage]
})
export class CreateAddressPageModule {}
