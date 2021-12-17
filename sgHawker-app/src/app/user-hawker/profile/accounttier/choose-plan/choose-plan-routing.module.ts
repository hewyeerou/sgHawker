import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChoosePlanPage } from './choose-plan.page';

const routes: Routes = [
  {
    path: '',
    component: ChoosePlanPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChoosePlanPageRoutingModule {}
