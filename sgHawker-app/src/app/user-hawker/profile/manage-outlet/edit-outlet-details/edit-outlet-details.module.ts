import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EditOutletDetailsPageRoutingModule } from './edit-outlet-details-routing.module';
import { EditOutletDetailsPage } from './edit-outlet-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditOutletDetailsPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [EditOutletDetailsPage]
})
export class EditOutletDetailsPageModule {}
