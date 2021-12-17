import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActivityHistoryPage } from './activity-history.page';

const routes: Routes = [
  {
    path: '',
    component: ActivityHistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActivityHistoryPageRoutingModule {}
