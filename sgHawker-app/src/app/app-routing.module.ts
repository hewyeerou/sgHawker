import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'account',
    pathMatch: 'full',
  },
  {
    path: 'account',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'hawker', //internal routing in home-hawker
    loadChildren: () => import('./user-hawker/tabs/tabs.module').then((m) => m.TabsPageModule),
    canActivate: [AuthGuard]
  },

  {
    path: 'customer', //internal routing in customer-hawker
    loadChildren: () => import('./user-customer/tabs-cust/tabs-cust.module').then(m => m.TabsCustPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'accessRightError',
    loadChildren: () =>
      import('./access-right-error/access-right-error.module').then(
        (m) => m.AccessRightErrorPageModule
      ),
  },
  {
    path: 'hawker-leaderboard-filter-modal',
    loadChildren: () => import('./shared/hawker-leaderboard-filter-modal/hawker-leaderboard-filter-modal.module').then(m => m.HawkerLeaderboardFilterModalPageModule)
  },
  {
    path: 'guest-qr-code',
    loadChildren: () => import('./guest-qr-code/guest-qr-code.module').then(m => m.GuestQrCodePageModule)
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
