import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewReportsPageRoutingModule } from './view-reports-routing.module';

import { ViewReportsPage } from './view-reports.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    ViewReportsPageRoutingModule
  ],
  declarations: [ViewReportsPage]
})
export class ViewReportsPageModule {}
