import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CreateOutletModalPageRoutingModule } from './create-outlet-modal-routing.module';
import { CreateOutletModalPage } from './create-outlet-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateOutletModalPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [CreateOutletModalPage]
})
export class CreateOutletModalPageModule {}
