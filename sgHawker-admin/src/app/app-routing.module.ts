import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./home/home.module').then((m) => m.HomePageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'accessRightError',
    loadChildren: () =>
      import('./access-right-error/access-right-error.module').then(
        (m) => m.AccessRightErrorPageModule
      ),
  },
  /**
   * acct-hawker-mgmt
   */
  {
    path: 'hawkerAccountManagement',
    loadChildren: () =>
      import('./acct-hawker-mgmt/hawker-mgmt-nav/hawker-mgmt-nav.module').then((m) => m.HawkerMgmtNavPageModule),
  },
  {
    path: 'hawkerAccountUpgrade',
    loadChildren: () => import('./acct-hawker-mgmt/hawker-acct-upgrade-nav/hawker-acct-upgrade-nav.module').then( m => m.HawkerAcctUpgradeNavPageModule)
  },
  /**
   * Finance Management
  */
  {
    path: 'financeManagement',
    loadChildren: () => import('./finance-management/finance-management.module').then(m => m.FinanceManagementPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
