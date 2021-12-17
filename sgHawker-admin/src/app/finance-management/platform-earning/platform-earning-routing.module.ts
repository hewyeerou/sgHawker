import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlatformEarningPage } from './platform-earning.page';

const routes: Routes = [
  {
    path: '',
    component: PlatformEarningPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlatformEarningPageRoutingModule {}
