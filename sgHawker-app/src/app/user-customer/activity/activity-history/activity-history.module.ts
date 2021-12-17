import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ActivityHistoryPageRoutingModule } from './activity-history-routing.module';
import { ActivityHistoryPage } from './activity-history.page';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    IonicModule,
    ActivityHistoryPageRoutingModule
  ],
  declarations: [
    ActivityHistoryPage
  ]
})
export class ActivityHistoryPageModule { }
