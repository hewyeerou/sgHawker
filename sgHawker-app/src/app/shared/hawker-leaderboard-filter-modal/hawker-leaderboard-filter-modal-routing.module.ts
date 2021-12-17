import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HawkerLeaderboardFilterModalPage } from './hawker-leaderboard-filter-modal.page';

const routes: Routes = [
  {
    path: '',
    component: HawkerLeaderboardFilterModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HawkerLeaderboardFilterModalPageRoutingModule {}
