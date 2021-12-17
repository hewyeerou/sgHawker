import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomizationPage } from './customization.page';

const routes: Routes = [
  {
    path: '',
    component: CustomizationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomizationPageRoutingModule {}
