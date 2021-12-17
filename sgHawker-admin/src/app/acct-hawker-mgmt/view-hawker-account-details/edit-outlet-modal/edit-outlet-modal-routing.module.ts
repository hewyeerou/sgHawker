import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditOutletModalPage } from './edit-outlet-modal.page';

const routes: Routes = [
  {
    path: '',
    component: EditOutletModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditOutletModalPageRoutingModule {}
