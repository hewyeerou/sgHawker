import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QueueSettingPage } from './queue-setting.page';

const routes: Routes = [
  {
    path: '',
    component: QueueSettingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QueueSettingPageRoutingModule {}
