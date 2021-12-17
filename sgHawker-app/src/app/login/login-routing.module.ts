import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginPage } from './login.page';

const routes: Routes = [
  {
    path: '',
    component: LoginPage
  },
  {
    path: 'customer-register',
    loadChildren: () => import('./customer-register/customer-register.module').then(m => m.CustomerRegisterPageModule)
  },
  {
    path: 'hawker-register',
    loadChildren: () => import('./hawker-register/hawker-register.module').then(m => m.HawkerRegisterPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginPageRoutingModule { }
