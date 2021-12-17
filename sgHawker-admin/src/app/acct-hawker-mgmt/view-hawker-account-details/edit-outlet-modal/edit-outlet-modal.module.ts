import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditOutletModalPageRoutingModule } from './edit-outlet-modal-routing.module';

import { EditOutletModalPage } from './edit-outlet-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditOutletModalPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [EditOutletModalPage]
})
export class EditOutletModalPageModule { }
