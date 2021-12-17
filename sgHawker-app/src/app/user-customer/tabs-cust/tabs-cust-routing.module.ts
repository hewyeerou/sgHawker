import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsCustPage } from './tabs-cust.page';

const routes: Routes = [
  {
    path: '',
    component: TabsCustPage,
    children: [
      {
        path: 'home',
        children: [
          {
            path: '',
            loadChildren: () => import('../home/home.module').then(m => m.HomePageModule),
          },
          {
            path: ':hawkerCentreName',
            loadChildren: () => import('../home/hawker-stores/hawker-stores.module').then(m => m.HawkerStoresPageModule),
          },
          {
            path: 'hawkerOutlets/:hawkerOutletId',
            loadChildren: () => import('../home/hawker-details/hawker-details.module').then(m => m.HawkerDetailsPageModule),
          },
        ],
      },
      {
        path: 'activity',
        children: [
          {
            path: '',
            loadChildren: () => import('../activity/activity.module').then(m => m.ActivityPageModule),
          },
          {
            path: 'cart',
            loadChildren: () => import('../../user-customer/activity/cart/cart.module').then(m => m.CartPageModule),
          },
          {
            path: 'activity-history',
            loadChildren: () => import('../activity/activity-history/activity-history.module').then( m => m.ActivityHistoryPageModule),
          }
        ],
      },
      {
        path: 'leaderboard',
        loadChildren: () => import('../leaderboard/leaderboard.module').then(m => m.LeaderboardPageModule),
      },
      {
        path: 'cart',
        loadChildren: () => import('../../user-customer/activity/cart/cart.module').then(m => m.CartPageModule),
      },
      {
        path: 'profile',
        loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule),
        // canActivate: [CustomerGuard]
      },
      {
        path: '',
        redirectTo: '/customer/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/customer/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsCustPageRoutingModule { }
