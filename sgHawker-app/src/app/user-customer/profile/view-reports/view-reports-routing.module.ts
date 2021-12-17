import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewReportsPage } from './view-reports.page';

const routes: Routes = [
  {
    path: '',
    component: ViewReportsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewReportsPageRoutingModule {}
