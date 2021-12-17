import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AccessRightErrorPageRoutingModule } from './access-right-error-routing.module';

import { AccessRightErrorPage } from './access-right-error.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AccessRightErrorPageRoutingModule
  ],
  declarations: [AccessRightErrorPage]
})
export class AccessRightErrorPageModule {}
