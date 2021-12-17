import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageOutletPage } from './manage-outlet.page';

const routes: Routes = [
  {
    path: '',
    component: ManageOutletPage
  },
  {
    path: 'edit-outlet-details',
    loadChildren: () => import('./edit-outlet-details/edit-outlet-details.module').then(m => m.EditOutletDetailsPageModule)
  },
  {
    path: 'edit-outlet-details/:id',
    loadChildren: () => import('./edit-outlet-details/edit-outlet-details.module').then(m => m.EditOutletDetailsPageModule)
  },
  {
    path: 'view-outlet-qr',
    loadChildren: () => import('./view-outlet-qr/view-outlet-qr.module').then(m => m.ViewOutletQrPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageOutletPageRoutingModule { }
