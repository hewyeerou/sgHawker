import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { HawkerRegisterPageRoutingModule } from './hawker-register-routing.module';

import { HawkerRegisterPage } from './hawker-register.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    HawkerRegisterPageRoutingModule,
  ],
  declarations: [HawkerRegisterPage],
})
export class HawkerRegisterPageModule {}
