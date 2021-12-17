import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditCustomizationPage } from './edit-customization.page';

const routes: Routes = [
  {
    path: '',
    component: EditCustomizationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditCustomizationPageRoutingModule {}
