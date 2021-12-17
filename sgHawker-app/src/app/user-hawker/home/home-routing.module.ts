import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage
  },
  {
    path: 'queue-setting',
    loadChildren: () => import('./queue-setting/queue-setting.module').then( m => m.QueueSettingPageModule)
  },
  {
    path: 'cash-order-modal',
    loadChildren: () => import('./cash-order-modal/cash-order-modal.module').then( m => m.CashOrderModalPageModule)
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}
