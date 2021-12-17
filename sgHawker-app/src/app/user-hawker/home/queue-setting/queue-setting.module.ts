import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QueueSettingPageRoutingModule } from './queue-setting-routing.module';

import { QueueSettingPage } from './queue-setting.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QueueSettingPageRoutingModule
  ],
  declarations: [QueueSettingPage]
})
export class QueueSettingPageModule {}
