import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HawkerLeaderboardFilterModalPageRoutingModule } from './hawker-leaderboard-filter-modal-routing.module';
import { HawkerLeaderboardFilterModalPage } from './hawker-leaderboard-filter-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HawkerLeaderboardFilterModalPageRoutingModule,
  ],
  declarations: [HawkerLeaderboardFilterModalPage]
})
export class HawkerLeaderboardFilterModalPageModule { }
