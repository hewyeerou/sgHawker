import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home.page';
import { OrderQueueCardComponent } from './order-queue-card/order-queue-card.component';
import { PeekQueueModalComponent } from './order-queue-card/peek-queue-modal/peek-queue-modal.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { TakeOrderModalComponent } from './take-order-modal/take-order-modal.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
  ],
  declarations: [
    HomePage,
    OrderQueueCardComponent,
    PeekQueueModalComponent,
    TakeOrderModalComponent,
  ]
})
export class HomePageModule {}
