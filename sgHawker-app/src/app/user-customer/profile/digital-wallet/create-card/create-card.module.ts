import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CreateCardPageRoutingModule } from './create-card-routing.module';

import { CreateCardPage } from './create-card.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    CreateCardPageRoutingModule
  ],
  declarations: [CreateCardPage]
})
export class CreateCardPageModule {}
